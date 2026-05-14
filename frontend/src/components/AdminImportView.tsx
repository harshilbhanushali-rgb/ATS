import React, { useState } from 'react';
import Card from './Card';
import { apiFetch } from '../services/apiClient';

interface ImportError {
  row?: number | null;
  field?: string | null;
  message: string;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}

const AdminImportView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [allowUpdate, setAllowUpdate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const selected = event.target.files?.[0] || null;
    setFile(selected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a CSV or JSON file.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const query = new URLSearchParams({
      dry_run: String(dryRun),
      allow_update: String(allowUpdate),
    });

    try {
      const response = await apiFetch(`/api/v1/admin/import/users?${query.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload?.detail || 'Import failed.';
        throw new Error(detail);
      }

      const payload = (await response.json()) as ImportResult;
      setResult(payload);
    } catch (err) {
      setError((err as Error).message || 'Import failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="!p-8 bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-6L12 6m0 0l4.5 4.5M12 6v12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight">
              Import Users (CSV or JSON)
            </h3>
            <p className="text-sm text-slate-500">
              Admin-only. Use dry-run to validate before writing.
            </p>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>Valid columns/fields:</p>
              <ul className="list-disc list-inside ml-4 text-slate-600">
                <li><strong>name</strong></li>
                <li><strong>email</strong></li>
                <li><strong>role</strong> (optional, defaults to Recruiter)</li>
                <li><strong>password</strong> (optional)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-3xl bg-slate-50 border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Example file formats</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">CSV</p>
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 text-slate-100 p-3 text-[11px] overflow-x-auto">
{`name,email,role,password
Alice Johnson,alice@example.com,Admin,Password123!
Bob Lee,bob@example.com,Recruiter,`}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">JSON</p>
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 text-slate-100 p-3 text-[11px] overflow-x-auto">
{`[
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Admin",
    "password": "Password123!"
  },
  {
    "name": "Bob Lee",
    "email": "bob@example.com",
    "role": "Recruiter"
  }
]`}
              </pre>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">
              Upload File
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-emerald-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(event) => setDryRun(event.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              Dry run (no DB writes)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={allowUpdate}
                onChange={(event) => setAllowUpdate(event.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              Allow updates to existing users
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[46px] inline-flex items-center justify-center bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all duration-300 text-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Importing...' : 'Run Import'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="!p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
              Created: {result.created}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
              Updated: {result.updated}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              Skipped: {result.skipped}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600">
              Errors: {result.errors.length}
            </span>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 text-sm text-slate-600">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Errors
              </h4>
              <ul className="space-y-2">
                {result.errors.map((err, index) => (
                  <li key={`${err.row}-${index}`} className="text-rose-600">
                    {err.row ? `Row ${err.row}: ` : ''}
                    {err.field ? `${err.field} - ` : ''}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminImportView;
