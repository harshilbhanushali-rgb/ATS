import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Upload as UploadIcon,
  X as XIcon,
  FileText as FileTextIcon,
  Sparkles as SparklesIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle2 as CheckCircleIcon,
  Eye as EyeIcon,
} from 'lucide-react';
import Modal from './Modal';
import ResumeViewModal from './ResumeViewModal';
import { CandidateSource, Requisition, TalentPool } from '../types';
import {
  BulkCommitResult,
  BulkCommitRow,
  ExtractedBulkRow,
  commitBulkResumes,
  extractBulkResumes,
} from '../services/bulkImportApi';

interface BulkResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisitions: Requisition[];
  talentPools: TalentPool[];
  defaultRequisitionId?: string | null;
  defaultTalentPoolId?: string | null;
}

type ReviewRow = ExtractedBulkRow & {
  included: boolean;
  editedName: string;
  editedEmail: string;
  editedPhone: string;
};

type Step = 'select' | 'review' | 'result';

const MAX_FILES = 25;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = '.pdf,.txt';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-slate-50 disabled:opacity-60';

const RESULT_BADGE_CLASS: Record<string, string> = {
  created: 'bg-emerald-50 text-emerald-700',
  merged: 'bg-blue-50 text-blue-700',
  duplicate: 'bg-slate-100 text-slate-600',
  error: 'bg-rose-50 text-rose-700',
};

const BulkResumeUploadModal: React.FC<BulkResumeUploadModalProps> = ({
  isOpen,
  onClose,
  requisitions,
  talentPools,
  defaultRequisitionId,
  defaultTalentPoolId,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('select');
  const [files, setFiles] = useState<File[]>([]);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [source, setSource] = useState<CandidateSource | ''>('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<BulkCommitResult | null>(null);
  const [previewRowIndex, setPreviewRowIndex] = useState<number | null>(null);

  const requisition = useMemo(
    () => requisitions.find((r) => r.id === defaultRequisitionId) || null,
    [requisitions, defaultRequisitionId]
  );
  const talentPool = useMemo(
    () => talentPools.find((p) => p.id === defaultTalentPoolId) || null,
    [talentPools, defaultTalentPoolId]
  );

  const reset = () => {
    setStep('select');
    setFiles([]);
    setFileWarning(null);
    setIsExtracting(false);
    setExtractError(null);
    setRows([]);
    setSource('');
    setIsCommitting(false);
    setCommitError(null);
    setCommitResult(null);
    setPreviewRowIndex(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (selected.length === 0) return;

    const tooLarge = selected.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    const acceptable = selected.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);

    setFiles((prev) => {
      const combined = [...prev, ...acceptable];
      const overflow = combined.length - MAX_FILES;
      const next = combined.slice(0, MAX_FILES);
      const warnings: string[] = [];
      if (tooLarge.length > 0) {
        warnings.push(`${tooLarge.length} file(s) skipped - larger than 10MB.`);
      }
      if (overflow > 0) {
        warnings.push(`${overflow} file(s) skipped - batch limit is ${MAX_FILES}.`);
      }
      setFileWarning(warnings.length > 0 ? warnings.join(' ') : null);
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const extracted = await extractBulkResumes(files);
      setRows(
        extracted.map((row) => ({
          ...row,
          included: !row.extractionError,
          editedName: row.name || '',
          editedEmail: row.email || '',
          editedPhone: row.phone || '',
        }))
      );
      setStep('review');
    } catch (error) {
      setExtractError((error as Error).message);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateRow = (index: number, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const includedCount = rows.filter((r) => r.included).length;
  const canCommit =
    !!source &&
    includedCount > 0 &&
    rows.every(
      (row) => !row.included || (row.editedName.trim() && EMAIL_PATTERN.test(row.editedEmail.trim()))
    );

  const handleCommit = async () => {
    if (!canCommit) return;
    setIsCommitting(true);
    setCommitError(null);
    try {
      const commitRows: BulkCommitRow[] = rows
        .filter((r) => r.included)
        .map((r) => ({
          filename: r.filename,
          name: r.editedName.trim(),
          email: r.editedEmail.trim(),
          phone: r.editedPhone.trim() || undefined,
          resumeText: r.resumeText || undefined,
        }));
      const result = await commitBulkResumes(
        commitRows,
        source,
        defaultRequisitionId || undefined,
        defaultTalentPoolId || undefined
      );
      setCommitResult(result);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    } catch (error) {
      setCommitError((error as Error).message);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Resumes" size="4xl">
      <div className="space-y-5">
        {(requisition || talentPool) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <FileTextIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {requisition && (
              <span>
                Candidates will be added to <strong className="text-slate-700">{requisition.role}</strong>
              </span>
            )}
            {talentPool && (
              <span>
                Candidates will be added to talent pool{' '}
                <strong className="text-slate-700">{talentPool.name}</strong>
              </span>
            )}
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Resumes (PDF or .txt, up to {MAX_FILES})
              </label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl px-4 py-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                <UploadIcon className="w-6 h-6 text-slate-300" />
                <span className="text-sm text-slate-500">Click to select resumes</span>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>
            </div>

            {fileWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
                {fileWarning}
              </div>
            )}

            {files.length > 0 && (
              <ul className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                  >
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {extractError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                {extractError}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={files.length === 0 || isExtracting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <SparklesIcon className="w-4 h-4 animate-spin" />
                    Extracting {files.length} resume{files.length === 1 ? '' : 's'}...
                  </>
                ) : (
                  `Extract ${files.length || ''} Resume${files.length === 1 ? '' : 's'}`
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Source (applies to all candidates in this batch) <span className="text-red-500">*</span>
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as CandidateSource)}
                className={inputClass}
                required
              >
                <option value="" disabled>
                  Select source channel...
                </option>
                {Object.values(CandidateSource).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[26rem] overflow-y-auto custom-scrollbar pr-1">
              {rows.map((row, index) => (
                <div
                  key={`${row.filename}-${index}`}
                  className={`rounded-2xl border p-3 space-y-2 ${
                    row.extractionError
                      ? 'border-rose-200 bg-rose-50/40'
                      : row.included
                      ? 'border-slate-100 bg-white'
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={row.included}
                        disabled={!!row.extractionError}
                        onChange={(e) => updateRow(index, { included: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-500 truncate">{row.filename}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.existingCandidateWarning && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          <AlertTriangleIcon className="w-3 h-3" />
                          Already exists
                        </span>
                      )}
                      {!row.extractionError && row.resumeText && (
                        <button
                          type="button"
                          onClick={() => setPreviewRowIndex(index)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full px-2 py-0.5 transition-colors"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View
                        </button>
                      )}
                    </div>
                  </div>

                  {row.extractionError ? (
                    <p className="text-xs text-rose-600">{row.extractionError}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={row.editedName}
                          onChange={(e) => updateRow(index, { editedName: e.target.value })}
                          placeholder="Name"
                          disabled={!row.included}
                          className={inputClass}
                        />
                        <input
                          type="email"
                          value={row.editedEmail}
                          onChange={(e) => updateRow(index, { editedEmail: e.target.value })}
                          placeholder="Email"
                          disabled={!row.included}
                          className={inputClass}
                        />
                        <input
                          type="tel"
                          value={row.editedPhone}
                          onChange={(e) => updateRow(index, { editedPhone: e.target.value })}
                          placeholder="Phone (optional)"
                          disabled={!row.included}
                          className={inputClass}
                        />
                      </div>
                      {row.existingCandidateWarning && (
                        <p className="text-[11px] text-amber-700">
                          This email already exists as a candidate
                          {row.existingCandidateWarning.requisitionId
                            ? ' linked to another requisition'
                            : ' in the system'}
                          . Uncheck this row and use <strong>Add Existing</strong> instead if this is
                          the same person.
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {commitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                {commitError}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
              <span className="text-xs text-slate-400">
                {includedCount} of {rows.length} selected
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={!canCommit || isCommitting}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCommitting
                    ? 'Creating...'
                    : `Create ${includedCount} Candidate${includedCount === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && commitResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Created: {commitResult.created}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Merged: {commitResult.merged}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                Duplicate: {commitResult.duplicate}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Errors: {commitResult.errors}
              </span>
            </div>

            <ul className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {commitResult.rows.map((row, index) => (
                <li
                  key={`${row.filename}-${index}`}
                  className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                >
                  <span className="text-sm text-slate-700 truncate">{row.filename}</span>
                  <span
                    className={`shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      RESULT_BADGE_CLASS[row.status] || RESULT_BADGE_CLASS.error
                    }`}
                    title={row.message}
                  >
                    {row.status === 'created' && <CheckCircleIcon className="w-3 h-3" />}
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <ResumeViewModal
        isOpen={previewRowIndex !== null}
        onClose={() => setPreviewRowIndex(null)}
        candidateName={
          previewRowIndex !== null
            ? rows[previewRowIndex]?.editedName || rows[previewRowIndex]?.filename || ''
            : ''
        }
        resumeText={previewRowIndex !== null ? rows[previewRowIndex]?.resumeText : undefined}
      />
    </Modal>
  );
};

export default BulkResumeUploadModal;
