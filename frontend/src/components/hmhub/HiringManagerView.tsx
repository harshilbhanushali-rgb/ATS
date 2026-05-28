import React, { useState, useMemo } from 'react';
import { CandidateStage } from '../../types';
import Card from '../Card';
import CandidateInterviewProgressCard from '../CandidateInterviewProgressCard';
import { useAppData } from '../../contexts/AppDataContext';
import { useModalState } from '../../contexts/ModalStateContext';
import {
  Search as SearchIcon,
  X as XIcon,
  User as UserIcon,
  ClipboardList as ClipboardListIcon,
} from 'lucide-react';

const RELEVANT_HM_STAGES = [
  CandidateStage.SHORTLISTED,
  CandidateStage.INTERVIEW_ROUND_1,
  CandidateStage.INTERVIEW_ROUND_2,
  CandidateStage.INTERVIEW_ROUND_3,
  CandidateStage.INTERVIEW_ROUND_4,
  CandidateStage.HM_DECISION_PENDING,
];

const HiringManagerView: React.FC = () => {
  const { requisitions: allRequisitions, candidates: allCandidates, interviews: allInterviews } = useAppData();
  const {
    openInterviewModal,
    openOfferModal,
    openCandidateAIDashboardModal,
    openOutreachDraftModal,
    openHiringHub,
  } = useModalState();

  const uniqueHiringManagers = useMemo(
    () => Array.from(new Set(allRequisitions.map((r) => r.hiringManagerName))).sort(),
    [allRequisitions]
  );

  const [selectedHiringManager, setSelectedHiringManager] = useState<string>(
    uniqueHiringManagers[0] || ''
  );
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const requisitionsForHM = useMemo(
    () =>
      allRequisitions
        .filter(
          (r) =>
            r.hiringManagerName === selectedHiringManager &&
            (r.reqStatus === 'Open' || r.reqStatus === 'Offered' || r.reqStatus === 'Hold')
        )
        .sort(
          (a, b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime()
        ),
    [allRequisitions, selectedHiringManager]
  );

  const selectedRequisition = useMemo(
    () => requisitionsForHM.find((r) => r.id === selectedRequisitionId) || null,
    [requisitionsForHM, selectedRequisitionId]
  );

  const allCandidatesForReq = useMemo(
    () =>
      selectedRequisitionId
        ? allCandidates.filter(
            (c) =>
              c.requisitionId === selectedRequisitionId &&
              RELEVANT_HM_STAGES.includes(c.stage)
          )
        : [],
    [allCandidates, selectedRequisitionId]
  );

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCandidatesForReq
      .filter(
        (c) =>
          (term === '' ||
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term)) &&
          (stageFilter === '' || c.stage === stageFilter)
      )
      .sort((a, b) => {
        const diff = RELEVANT_HM_STAGES.indexOf(a.stage) - RELEVANT_HM_STAGES.indexOf(b.stage);
        return diff !== 0
          ? diff
          : new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
      });
  }, [allCandidatesForReq, searchTerm, stageFilter]);

  const handleSelectReq = (id: string) => {
    setSelectedRequisitionId(id);
    setSearchTerm('');
    setStageFilter('');
  };

  const handleHMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHiringManager(e.target.value);
    setSelectedRequisitionId(null);
    setSearchTerm('');
    setStageFilter('');
  };

  const hasFilters = searchTerm !== '' || stageFilter !== '';

  if (uniqueHiringManagers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display mb-1">No Hiring Managers</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            No hiring managers have active requisitions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)]">
      {/* ── Left Panel ── */}
      <div style={{ width: '17rem' }} className="shrink-0 flex flex-col min-h-0">
        <Card className="flex-1 min-h-0 flex flex-col !p-0 overflow-hidden">
          {/* Manager selector */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Hiring Manager
              </span>
            </div>
            <select
              value={selectedHiringManager}
              onChange={handleHMChange}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-700"
            >
              {uniqueHiringManagers.map((hm) => (
                <option key={hm} value={hm}>
                  {hm}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Requisitions
              </span>
              {requisitionsForHM.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {requisitionsForHM.length}
                </span>
              )}
            </div>
          </div>

          {/* Requisition list */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 custom-scrollbar">
            {requisitionsForHM.length > 0 ? (
              <ul className="space-y-1">
                {requisitionsForHM.map((req) => (
                  <li key={req.id}>
                    <button
                      onClick={() => handleSelectReq(req.id)}
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
                  <ClipboardListIcon className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-slate-400 text-xs">No active requisitions</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {!selectedRequisition ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ClipboardListIcon className="w-7 h-7 text-indigo-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Select a requisition</p>
              <p className="text-slate-400 text-xs mt-1">
                Choose one to view the interview pipeline
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Compact toolbar */}
            <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-soft px-3 py-2.5 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shrink-0"
              >
                <option value="">All Stages</option>
                {RELEVANT_HM_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStageFilter('');
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  title="Clear filters"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pipeline card */}
            <Card
              title={`Interview Pipeline · ${selectedRequisition.role}`}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
              bodyClassName="flex-grow min-h-0 overflow-y-auto p-4 custom-scrollbar space-y-4"
              titleRightElement={
                allCandidatesForReq.length > 0 ? (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {filteredCandidates.length}
                    {hasFilters && ` / ${allCandidatesForReq.length}`}
                  </span>
                ) : undefined
              }
            >
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <CandidateInterviewProgressCard
                    key={candidate.id}
                    candidate={candidate}
                    requisition={selectedRequisition}
                    interviews={allInterviews.filter((i) => i.candidateId === candidate.id)}
                    onLogInterview={openInterviewModal}
                    onOpenOfferModal={openOfferModal}
                    onOpenCandidateAIDashboardModal={openCandidateAIDashboardModal}
                    onOpenOutreachDraftModal={openOutreachDraftModal}
                    onOpenHiringHub={openHiringHub}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                    <UserIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {allCandidatesForReq.length === 0
                      ? 'No candidates in the interview pipeline'
                      : 'No candidates match current filters'}
                  </p>
                  {hasFilters && (
                    <p className="text-slate-300 text-xs mt-1">Try clearing your filters</p>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default HiringManagerView;
