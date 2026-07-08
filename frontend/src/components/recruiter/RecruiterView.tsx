import React, { useState, useMemo } from 'react';
import { RequisitionStatus, ResumeMatchAnalysis, CandidateStage, Candidate } from '../../types';
import Card from '../Card';
import { CandidateList } from '../CandidateList';
import {
  Plus as PlusIcon,
  UserSearch as UserMagnifyingGlassIcon,
  Search as SearchIcon,
  X as XIcon,
  Users as UsersIcon,
  SlidersHorizontal as FilterIcon,
  Sparkles as SparklesIcon,
  ChevronDown as ChevronDownIcon,
  Upload as UploadIcon,
} from 'lucide-react';
import Modal from '../Modal';
import ResumeAnalysisDisplay from '../ResumeAnalysisDisplay';
import AIRecommendationsDisplay from '../AIRecommendationsDisplay';
import BulkResumeUploadModal from '../BulkResumeUploadModal';
import ResumeViewModal from '../ResumeViewModal';
import { useAppData } from '../../contexts/AppDataContext';
import { useModalState } from '../../contexts/ModalStateContext';

export const RecruiterView: React.FC = () => {
  const {
    requisitions,
    candidates: allCandidates,
    aiMatchedCandidates,
    isLoadingAiMatches,
    currentRequisitionForAIMatches,
    findAiCandidateMatches: onFindAiCandidateMatches,
    assignCandidateFromAIPool: onAssignCandidateFromAIPool,
  } = useAppData();
  const {
    openCandidateModal: onOpenCandidateModal,
    openCandidateAIDashboardModal: onOpenCandidateAIDashboardModal,
    openLogOutreachModal: onOpenLogOutreachModal,
    openOutreachDraftModal: onOpenOutreachDraftModal,
    openHiringHub: onOpenHiringHub,
  } = useModalState();

  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [viewingResumeCandidate, setViewingResumeCandidate] = useState<Candidate | null>(null);
  const [isAiPanelMinimized, setIsAiPanelMinimized] = useState(false);
  const [analysisForModal, setAnalysisForModal] = useState<ResumeMatchAnalysis | null>(null);
  const [contextForAnalysisModal, setContextForAnalysisModal] = useState<{
    candidateName: string;
    requisitionRole: string;
  } | null>(null);

  const [reqSearchTerm, setReqSearchTerm] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('');
  const [candSearchTerm, setCandSearchTerm] = useState('');
  const [candStageFilter, setCandStageFilter] = useState('');

  const openRequisitions = useMemo(() => {
    return requisitions
      .filter(
        (r) => r.reqStatus === RequisitionStatus.OPEN || r.reqStatus === RequisitionStatus.OFFERED
      )
      .filter((r) => {
        const term = reqSearchTerm.toLowerCase();
        const matchesSearch =
          term === '' || r.role.toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
        const matchesStatus = reqStatusFilter === '' || r.reqStatus === reqStatusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime()
      );
  }, [requisitions, reqSearchTerm, reqStatusFilter]);

  const selectedRequisition = useMemo(
    () => requisitions.find((r) => r.id === selectedRequisitionId) || null,
    [requisitions, selectedRequisitionId]
  );

  const candidatesForSelectedRequisition = useMemo(() => {
    if (!selectedRequisitionId) return [];
    return allCandidates
      .filter((c) => c.requisitionId === selectedRequisitionId)
      .filter((c) => {
        const term = candSearchTerm.toLowerCase();
        const matchesSearch =
          term === '' ||
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term);
        const matchesStage = candStageFilter === '' || c.stage === candStageFilter;
        return matchesSearch && matchesStage;
      })
      .sort(
        (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
      );
  }, [allCandidates, selectedRequisitionId, candSearchTerm, candStageFilter]);

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisForModal(null);
    setContextForAnalysisModal(null);
  };

  const handleSelectRequisition = (requisitionId: string) => {
    setSelectedRequisitionId(requisitionId);
    setCandSearchTerm('');
    setCandStageFilter('');
  };

  const handleClearReqFilters = () => {
    setReqSearchTerm('');
    setReqStatusFilter('');
  };

  const handleClearCandFilters = () => {
    setCandSearchTerm('');
    setCandStageFilter('');
  };

  const hasReqFilters = reqSearchTerm !== '' || reqStatusFilter !== '';
  const hasCandFilters = candSearchTerm !== '' || candStageFilter !== '';

  const totalCandidatesForReq = selectedRequisitionId
    ? allCandidates.filter((c) => c.requisitionId === selectedRequisitionId).length
    : 0;

  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)]">
      {/* ── Left Panel: Requisitions ── */}
      <div className="w-68 shrink-0 flex flex-col min-h-0" style={{ width: '17rem' }}>
        <Card className="flex-1 min-h-0 flex flex-col !p-0 overflow-hidden">
          {/* Header + Filters */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FilterIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Requisitions
                </span>
              </div>
              {openRequisitions.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {openRequisitions.length}
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={reqSearchTerm}
                onChange={(e) => setReqSearchTerm(e.target.value)}
                placeholder="Role or ID..."
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Status + Clear */}
            <div className="flex gap-1.5">
              <select
                value={reqStatusFilter}
                onChange={(e) => setReqStatusFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="">All Status</option>
                <option value={RequisitionStatus.OPEN}>Open</option>
                <option value={RequisitionStatus.OFFERED}>Offered</option>
              </select>
              {hasReqFilters && (
                <button
                  onClick={handleClearReqFilters}
                  title="Clear filters"
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Requisition List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 custom-scrollbar">
            {openRequisitions.length > 0 ? (
              <ul className="space-y-1">
                {openRequisitions.map((req) => (
                  <li key={req.id}>
                    <button
                      onClick={() => handleSelectRequisition(req.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group
                        ${
                          selectedRequisitionId === req.id
                            ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      <p
                        className={`font-bold text-xs leading-snug mb-0.5 ${
                          selectedRequisitionId === req.id
                            ? 'text-white'
                            : 'text-slate-800 group-hover:text-indigo-600'
                        }`}
                      >
                        {req.role}
                      </p>
                      <div
                        className={`flex items-center text-[10px] font-semibold uppercase tracking-wide ${
                          selectedRequisitionId === req.id ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{req.function}</span>
                        <span className="mx-1 opacity-40">·</span>
                        <span>{req.location}</span>
                      </div>
                      <p
                        className={`text-[9px] mt-1 font-mono ${
                          selectedRequisitionId === req.id ? 'text-indigo-300' : 'text-slate-300'
                        }`}
                      >
                        {req.id}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                  <SearchIcon className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-slate-400 text-xs">No requisitions found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {!selectedRequisition ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Select a requisition</p>
              <p className="text-slate-400 text-xs mt-1">
                Choose one from the left to view its pipeline
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Compact Toolbar ── */}
            <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-soft px-3 py-2.5 flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={candSearchTerm}
                  onChange={(e) => setCandSearchTerm(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Stage filter */}
              <select
                value={candStageFilter}
                onChange={(e) => setCandStageFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shrink-0"
              >
                <option value="">All Stages</option>
                {Object.values(CandidateStage).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Clear filters — only shown when active */}
              {hasCandFilters && (
                <button
                  onClick={handleClearCandFilters}
                  title="Clear filters"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200 shrink-0" />

              {/* Add Candidate */}
              <button
                onClick={() => onOpenCandidateModal(undefined, selectedRequisition.id)}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl shadow-sm shadow-indigo-600/25 text-xs transition-all whitespace-nowrap shrink-0"
              >
                <PlusIcon className="w-3.5 h-3.5 mr-1" />
                Add Candidate
              </button>

              {/* Bulk Upload */}
              <button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="flex items-center border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-bold py-2 px-3.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 bg-white"
              >
                <UploadIcon className="w-3.5 h-3.5 mr-1" />
                Bulk Upload
              </button>

              {/* AI Matches */}
              <button
                onClick={() => { setIsAiPanelMinimized(false); onFindAiCandidateMatches(selectedRequisition); }}
                disabled={isLoadingAiMatches || !selectedRequisition.jobDescription?.trim()}
                title={
                  !selectedRequisition.jobDescription?.trim()
                    ? 'Add a Job Description to enable AI Matching'
                    : 'Find matching candidates from Talent Pools using AI'
                }
                className="flex items-center border border-slate-200 hover:border-purple-200 hover:bg-purple-50 text-purple-600 font-bold py-2 px-3.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
              >
                <UserMagnifyingGlassIcon className="w-3.5 h-3.5 mr-1" />
                AI Matches
              </button>
            </div>

            {/* ── AI Recommendations Panel (conditional) ── */}
            {currentRequisitionForAIMatches?.id === selectedRequisition.id && (
              <div className="shrink-0 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white overflow-hidden">
                {/* Collapse header */}
                <button
                  onClick={() => setIsAiPanelMinimized((p) => !p)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex-1 text-left">
                    AI Recommendations
                  </span>
                  {!isLoadingAiMatches && aiMatchedCandidates && aiMatchedCandidates.length > 0 && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {aiMatchedCandidates.filter(r => r.candidateId !== 'ERROR').length}
                    </span>
                  )}
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 text-indigo-400 transition-transform duration-200 ${isAiPanelMinimized ? '-rotate-90' : ''}`}
                  />
                </button>
                {/* Content */}
                {!isAiPanelMinimized && (
                  <div className="max-h-[30vh] overflow-y-auto custom-scrollbar border-t border-indigo-100">
                    <AIRecommendationsDisplay
                      recommendations={aiMatchedCandidates}
                      allCandidates={allCandidates}
                      isLoading={isLoadingAiMatches}
                      requisition={selectedRequisition}
                      onAssignCandidate={onAssignCandidateFromAIPool}
                      onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
                      onOpenLogOutreachModal={onOpenLogOutreachModal}
                      onOpenOutreachDraftModal={onOpenOutreachDraftModal}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Candidate Pipeline ── */}
            <Card
              title={`Pipeline · ${selectedRequisition.role}`}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
              bodyClassName="flex-grow min-h-0 overflow-y-auto p-2 custom-scrollbar"
              titleRightElement={
                totalCandidatesForReq > 0 ? (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {candidatesForSelectedRequisition.length}
                    {hasCandFilters && ` / ${totalCandidatesForReq}`}
                  </span>
                ) : undefined
              }
            >
              {candidatesForSelectedRequisition.length > 0 ? (
                <CandidateList
                  candidates={candidatesForSelectedRequisition}
                  selectedRequisition={selectedRequisition}
                  onEditCandidate={onOpenCandidateModal}
                  onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
                  onOpenLogOutreachModal={onOpenLogOutreachModal}
                  onOpenOutreachDraftModal={onOpenOutreachDraftModal}
                  onOpenHiringHub={onOpenHiringHub}
                  onViewResume={setViewingResumeCandidate}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <UsersIcon className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {totalCandidatesForReq === 0
                      ? 'No candidates yet'
                      : 'No candidates match filters'}
                  </p>
                  {totalCandidatesForReq === 0 && (
                    <p className="text-slate-300 text-xs mt-1">
                      Add one manually or use AI Matches
                    </p>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {isAnalysisModalOpen && analysisForModal && contextForAnalysisModal && (
        <Modal
          isOpen={isAnalysisModalOpen}
          onClose={handleCloseAnalysisModal}
          title={`Resume Analysis: ${contextForAnalysisModal.candidateName}`}
          size="4xl"
        >
          <ResumeAnalysisDisplay
            analysis={analysisForModal}
            candidateName={contextForAnalysisModal.candidateName}
            requisitionRole={contextForAnalysisModal.requisitionRole}
          />
        </Modal>
      )}

      {selectedRequisition && (
        <BulkResumeUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          requisitions={requisitions}
          talentPools={[]}
          defaultRequisitionId={selectedRequisition.id}
        />
      )}

      <ResumeViewModal
        isOpen={!!viewingResumeCandidate}
        onClose={() => setViewingResumeCandidate(null)}
        candidateName={viewingResumeCandidate?.name || ''}
        resumeText={viewingResumeCandidate?.resumeText}
        resumeUrl={viewingResumeCandidate?.resumeUrl}
      />
    </div>
  );
};
