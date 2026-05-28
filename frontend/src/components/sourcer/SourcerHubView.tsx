import React, { useState, useMemo } from 'react';
import { Candidate, CandidateStage, RequisitionStatus, Requisition } from '../../types';
import Card from '../Card';
import {
  Plus as PlusIcon,
  UserPlus as UserPlusIcon,
  Trash2 as TrashIcon,
  Pencil as PencilIcon,
  Database as DatabaseIcon,
  Send as PaperAirplaneIcon,
  MessageCircle as ChatBubbleIcon,
  UserSearch as UserMagnifyingGlassIcon,
  Eye as EyeIcon,
  BarChart3 as BarChartIcon,
  Search as SearchIcon,
  X as XIcon,
  Layers as LayersIcon,
  Sparkles as SparklesIcon,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import AIRecommendationsDisplay from '../AIRecommendationsDisplay';
import PencilSparklesIcon from '../icons/PencilSparklesIcon';
import Modal from '../Modal';
import SourcerDashboardView from './SourcerDashboardView';
import { useAppData } from '../../contexts/AppDataContext';
import { useModalState } from '../../contexts/ModalStateContext';

const STAGE_PILL: Record<string, string> = {
  [CandidateStage.APPLIED]: 'bg-slate-100 text-slate-600',
  [CandidateStage.SCREENING]: 'bg-blue-50 text-blue-600',
  [CandidateStage.SHORTLISTED]: 'bg-indigo-50 text-indigo-600',
  [CandidateStage.INTERVIEW_ROUND_1]: 'bg-violet-50 text-violet-600',
  [CandidateStage.INTERVIEW_ROUND_2]: 'bg-purple-50 text-purple-600',
  [CandidateStage.INTERVIEW_ROUND_3]: 'bg-fuchsia-50 text-fuchsia-600',
  [CandidateStage.INTERVIEW_ROUND_4]: 'bg-pink-50 text-pink-600',
  [CandidateStage.HM_DECISION_PENDING]: 'bg-amber-50 text-amber-600',
  [CandidateStage.OFFER_EXTENDED]: 'bg-emerald-50 text-emerald-600',
  [CandidateStage.OFFER_ACCEPTED]: 'bg-green-50 text-green-600',
  [CandidateStage.OFFER_DECLINED]: 'bg-rose-50 text-rose-500',
  [CandidateStage.REJECTED]: 'bg-rose-50 text-rose-600',
  [CandidateStage.ON_HOLD]: 'bg-slate-100 text-slate-500',
  [CandidateStage.HIRED]: 'bg-emerald-100 text-emerald-700',
};

const SourcerHubView: React.FC = () => {
  const {
    requisitions,
    candidates: allCandidates,
    talentPools,
    aiMatchedCandidates,
    isLoadingAiMatches,
    currentRequisitionForAIMatches,
    findAiCandidateMatches: onFindAiCandidateMatches,
    assignCandidateFromAIPool: onAssignCandidateFromAIPool,
    removeCandidateFromPool: onRemoveCandidateFromPool,
    moveCandidateToRequisition: onMoveCandidateToRequisition,
  } = useAppData();
  const {
    openCandidateModal: onOpenCandidateModal,
    openTalentPoolFormModal: onOpenTalentPoolFormModal,
    openAddCandidateToPoolModal: onOpenAddCandidateToPoolModal,
    openLogOutreachModal: onOpenLogOutreachModal,
    openCandidateAIDashboardModal: onOpenCandidateAIDashboardModal,
    openOutreachDraftModal: onOpenOutreachDraftModal,
  } = useModalState();

  const [mainTab, setMainTab] = useState<'hub' | 'kpis'>('hub');
  const [selectedView, setSelectedView] = useState<'requisitions' | 'talentPools'>('requisitions');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [candidateToMove, setCandidateToMove] = useState<{
    candidateId: string;
    poolId?: string;
  } | null>(null);
  const [targetRequisitionForMove, setTargetRequisitionForMove] = useState<string>('');
  const [actionContext, setActionContext] = useState<{
    action: 'draft' | 'insights';
    candidate: Candidate;
  } | null>(null);
  const [isPoolSelectorOpen, setIsPoolSelectorOpen] = useState(false);
  const [isAiPanelMinimized, setIsAiPanelMinimized] = useState(false);
  const [pendingMatchRequisition, setPendingMatchRequisition] = useState<Requisition | null>(null);
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);

  const openRequisitions = useMemo(
    () =>
      requisitions
        .filter(
          (r) =>
            r.reqStatus === RequisitionStatus.OPEN || r.reqStatus === RequisitionStatus.OFFERED
        )
        .sort(
          (a, b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime()
        ),
    [requisitions]
  );

  const sortedTalentPools = useMemo(
    () =>
      [...talentPools].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      ),
    [talentPools]
  );

  const selectedRequisition = useMemo(
    () =>
      selectedView === 'requisitions'
        ? openRequisitions.find((r) => r.id === selectedItemId)
        : null,
    [selectedView, selectedItemId, openRequisitions]
  );

  const selectedTalentPool = useMemo(
    () =>
      selectedView === 'talentPools'
        ? sortedTalentPools.find((p) => p.id === selectedItemId)
        : null,
    [selectedView, selectedItemId, sortedTalentPools]
  );

  const candidatesToDisplay = useMemo(() => {
    if (selectedView === 'requisitions' && selectedRequisition) {
      const SOURCER_STAGES = [CandidateStage.APPLIED, CandidateStage.SCREENING];
      return allCandidates
        .filter(
          (c) => c.requisitionId === selectedRequisition.id && SOURCER_STAGES.includes(c.stage)
        )
        .sort(
          (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
        );
    }
    if (selectedView === 'talentPools' && selectedTalentPool) {
      return allCandidates
        .filter((c) => c.talentPoolIds?.includes(selectedTalentPool.id))
        .sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    return [];
  }, [selectedView, selectedRequisition, selectedTalentPool, allCandidates]);

  const handleStartMove = (candidateId: string, poolId?: string) => {
    setTargetRequisitionForMove('');
    setCandidateToMove({ candidateId, poolId });
  };

  const handleConfirmMove = () => {
    if (candidateToMove && targetRequisitionForMove) {
      onMoveCandidateToRequisition(
        candidateToMove.candidateId,
        targetRequisitionForMove,
        candidateToMove.poolId
      );
      setCandidateToMove(null);
      setTargetRequisitionForMove('');
    }
  };

  const renderCandidateItem = (candidate: Candidate, currentPoolId?: string) => {
    const reqCtx = selectedRequisition;
    const stageClass = STAGE_PILL[candidate.stage] || 'bg-slate-100 text-slate-600';

    return (
      <div
        key={candidate.id}
        className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h5 className="font-bold text-sm text-slate-900 truncate">{candidate.name}</h5>
              <span
                className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${stageClass}`}
              >
                {candidate.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
            {candidate.source && (
              <p className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wider font-semibold">
                {candidate.source}
              </p>
            )}
          </div>
          {currentPoolId && (
            <button
              onClick={() => onRemoveCandidateFromPool(candidate.id, currentPoolId)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
              title="Remove from pool"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {candidate.notes && (
          <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 line-clamp-2">
            {candidate.notes}
          </p>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center gap-1 flex-wrap">
          {/* AI Insights */}
          <button
            onClick={() => {
              if (reqCtx) {
                onOpenCandidateAIDashboardModal({ candidate, requisition: reqCtx });
              } else {
                setActionContext({ action: 'insights', candidate });
              }
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide"
          >
            <EyeIcon className="w-3 h-3" /> Insights
          </button>

          {/* AI Draft */}
          <button
            onClick={() => {
              if (reqCtx) {
                onOpenOutreachDraftModal(candidate, reqCtx);
              } else {
                setActionContext({ action: 'draft', candidate });
              }
            }}
            disabled={!reqCtx && selectedView === 'requisitions'}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PencilSparklesIcon className="w-3 h-3" /> AI Draft
          </button>

          {/* Log Outreach */}
          <button
            onClick={() => onOpenLogOutreachModal(candidate)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-teal-600 hover:bg-teal-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide"
          >
            <ChatBubbleIcon className="w-3 h-3" /> Log
          </button>

          {/* Edit */}
          <button
            onClick={() => onOpenCandidateModal(candidate, undefined, currentPoolId)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide"
          >
            <PencilIcon className="w-3 h-3" /> Edit
          </button>

          {/* Move to Requisition */}
          {currentPoolId && (
            <button
              onClick={() => handleStartMove(candidate.id, currentPoolId)}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide"
            >
              <PaperAirplaneIcon className="w-3 h-3" /> Move
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
      {/* ── Main Tab Bar ── */}
      <div className="shrink-0 flex items-center gap-1 bg-white rounded-2xl border border-slate-100 shadow-soft p-1 w-fit">
        <button
          onClick={() => setMainTab('hub')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            mainTab === 'hub'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <UserMagnifyingGlassIcon className="w-3.5 h-3.5" />
          Sourcer Hub
        </button>
        <button
          onClick={() => setMainTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            mainTab === 'kpis'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChartIcon className="w-3.5 h-3.5" />
          Sourcer KPIs
        </button>
      </div>

      {/* ── KPIs Tab ── */}
      {mainTab === 'kpis' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <SourcerDashboardView />
        </div>
      )}

      {/* ── Hub Tab ── */}
      {mainTab === 'hub' && (
        <div className="flex gap-5 flex-1 min-h-0">
          {/* Left Panel */}
          <div style={{ width: '17rem' }} className="shrink-0 flex flex-col min-h-0">
            <Card className="flex-1 min-h-0 flex flex-col !p-0 overflow-hidden">
              {/* View toggle */}
              <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
                  <button
                    onClick={() => {
                      setSelectedView('requisitions');
                      setSelectedItemId(null);
                    }}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wide ${
                      selectedView === 'requisitions'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Requisitions
                  </button>
                  <button
                    onClick={() => {
                      setSelectedView('talentPools');
                      setSelectedItemId(null);
                    }}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wide ${
                      selectedView === 'talentPools'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Talent Pools
                  </button>
                </div>
              </div>

              {/* List header */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {selectedView === 'requisitions' ? 'Open Requisitions' : 'Pools'}
                </span>
                <div className="flex items-center gap-2">
                  {selectedView === 'talentPools' && (
                    <button
                      onClick={() => onOpenTalentPoolFormModal()}
                      className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 rounded-lg transition-all uppercase tracking-wide"
                      title="New Talent Pool"
                    >
                      <PlusIcon className="w-3 h-3" /> New
                    </button>
                  )}
                  {(selectedView === 'requisitions' ? openRequisitions : sortedTalentPools).length >
                    0 && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {selectedView === 'requisitions'
                        ? openRequisitions.length
                        : sortedTalentPools.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Item list */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 custom-scrollbar">
                {selectedView === 'requisitions' &&
                  (openRequisitions.length > 0 ? (
                    <ul className="space-y-1">
                      {openRequisitions.map((req) => (
                        <li key={req.id}>
                          <button
                            onClick={() => setSelectedItemId(req.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group
                              ${
                                selectedItemId === req.id
                                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-600/20'
                                  : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                              }`}
                          >
                            <p
                              className={`font-bold text-xs leading-snug mb-0.5 ${
                                selectedItemId === req.id
                                  ? 'text-white'
                                  : 'text-slate-800 group-hover:text-indigo-600'
                              }`}
                            >
                              {req.role}
                            </p>
                            <div
                              className={`flex items-center text-[10px] font-semibold uppercase tracking-wide ${
                                selectedItemId === req.id ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              <span>{req.function}</span>
                              <span className="mx-1 opacity-40">·</span>
                              <span>{req.location}</span>
                            </div>
                            <p
                              className={`text-[9px] mt-1 font-mono ${
                                selectedItemId === req.id ? 'text-indigo-300' : 'text-slate-300'
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
                      <p className="text-slate-400 text-xs">No open requisitions</p>
                    </div>
                  ))}

                {selectedView === 'talentPools' &&
                  (sortedTalentPools.length > 0 ? (
                    <ul className="space-y-1">
                      {sortedTalentPools.map((pool) => (
                        <li key={pool.id}>
                          <button
                            onClick={() => setSelectedItemId(pool.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group
                              ${
                                selectedItemId === pool.id
                                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-600/20'
                                  : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                              }`}
                          >
                            <p
                              className={`font-bold text-xs leading-snug mb-0.5 ${
                                selectedItemId === pool.id
                                  ? 'text-white'
                                  : 'text-slate-800 group-hover:text-indigo-600'
                              }`}
                            >
                              {pool.name}
                            </p>
                            {pool.description && (
                              <p
                                className={`text-[10px] truncate ${
                                  selectedItemId === pool.id ? 'text-indigo-200' : 'text-slate-400'
                                }`}
                              >
                                {pool.description}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                        <LayersIcon className="w-4 h-4 text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-xs">No talent pools yet</p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
            {/* Toolbar for Talent Pool actions */}
            {selectedView === 'talentPools' && selectedTalentPool && (
              <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-soft px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedTalentPool.name}</p>
                  {selectedTalentPool.description && (
                    <p className="text-xs text-slate-400 truncate">{selectedTalentPool.description}</p>
                  )}
                </div>
                <div className="w-px h-5 bg-slate-200 shrink-0" />
                <button
                  onClick={() => onOpenCandidateModal(undefined, undefined, selectedTalentPool.id)}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl shadow-sm shadow-indigo-600/25 text-xs transition-all whitespace-nowrap shrink-0"
                >
                  <UserPlusIcon className="w-3.5 h-3.5 mr-1" /> New Candidate
                </button>
                <button
                  onClick={() => onOpenAddCandidateToPoolModal(selectedTalentPool)}
                  className="flex items-center border border-slate-200 hover:border-teal-200 hover:bg-teal-50 text-teal-600 font-bold py-2 px-3.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 bg-white"
                >
                  <DatabaseIcon className="w-3.5 h-3.5 mr-1" /> Add Existing
                </button>
              </div>
            )}

            {/* Toolbar for Requisition actions */}
            {selectedView === 'requisitions' && selectedRequisition && (
              <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-soft px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedRequisition.role}</p>
                  <p className="text-xs text-slate-400">{selectedRequisition.function} · {selectedRequisition.location}</p>
                </div>
                <div className="w-px h-5 bg-slate-200 shrink-0" />
                <button
                  onClick={() => {
                    setPendingMatchRequisition(selectedRequisition);
                    setSelectedPoolIds([]);
                    setIsPoolSelectorOpen(true);
                  }}
                  disabled={isLoadingAiMatches}
                  className="flex items-center border border-slate-200 hover:border-purple-200 hover:bg-purple-50 text-purple-600 font-bold py-2 px-3.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <UserMagnifyingGlassIcon className="w-3.5 h-3.5 mr-1" /> AI Matches
                </button>
                <button
                  onClick={() => onOpenCandidateModal(undefined, selectedRequisition.id)}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl shadow-sm shadow-indigo-600/25 text-xs transition-all whitespace-nowrap shrink-0"
                >
                  <UserPlusIcon className="w-3.5 h-3.5 mr-1" /> Add Candidate
                </button>
              </div>
            )}

            {/* AI Recommendations */}
            {selectedView === 'requisitions' &&
              currentRequisitionForAIMatches &&
              selectedRequisition?.id === currentRequisitionForAIMatches.id && (
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
                        {aiMatchedCandidates.filter((r) => r.candidateId !== 'ERROR').length}
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

            {/* Candidate list card */}
            <Card
              title={
                selectedView === 'requisitions'
                  ? selectedRequisition
                    ? `Top of Funnel · ${selectedRequisition.role}`
                    : 'Select a Requisition'
                  : selectedTalentPool
                  ? `Candidates · ${selectedTalentPool.name}`
                  : 'Select a Talent Pool'
              }
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
              bodyClassName="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar space-y-2"
              titleRightElement={
                candidatesToDisplay.length > 0 ? (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {candidatesToDisplay.length}
                  </span>
                ) : undefined
              }
            >
              {candidatesToDisplay.length > 0 ? (
                candidatesToDisplay.map((cand) =>
                  renderCandidateItem(cand, selectedTalentPool?.id)
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <UserMagnifyingGlassIcon className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    {selectedItemId
                      ? 'No candidates to display'
                      : selectedView === 'requisitions'
                      ? 'Select a requisition to see candidates'
                      : 'Select a talent pool to see candidates'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── Pool Selector Modal ── */}
      {isPoolSelectorOpen && pendingMatchRequisition && (
        <Modal
          isOpen={isPoolSelectorOpen}
          onClose={() => setIsPoolSelectorOpen(false)}
          title={`AI Match · ${pendingMatchRequisition.role}`}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select talent pools to search. Leave all unchecked to search across all pools.
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {sortedTalentPools.map((pool) => (
                <label
                  key={pool.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPoolIds.includes(pool.id)}
                    onChange={(e) =>
                      setSelectedPoolIds((prev) =>
                        e.target.checked
                          ? [...prev, pool.id]
                          : prev.filter((id) => id !== pool.id)
                      )
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{pool.name}</p>
                    {pool.description && (
                      <p className="text-xs text-slate-400">{pool.description}</p>
                    )}
                  </div>
                </label>
              ))}
              {sortedTalentPools.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No talent pools available.</p>
              )}
            </div>
            <p className="text-xs text-indigo-600 font-semibold">
              {selectedPoolIds.length === 0
                ? 'All pools will be searched.'
                : `${selectedPoolIds.length} pool(s) selected.`}
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPoolSelectorOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAiPanelMinimized(false);
                  onFindAiCandidateMatches(
                    pendingMatchRequisition,
                    selectedPoolIds.length > 0 ? selectedPoolIds : undefined
                  );
                  setIsPoolSelectorOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/25"
              >
                Run AI Match
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Requisition Context Modal (for pool candidates) ── */}
      {actionContext && (
        <Modal
          isOpen={!!actionContext}
          onClose={() => setActionContext(null)}
          title={`Select Requisition · ${actionContext.candidate.name}`}
          size="lg"
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Select a requisition to provide context for the AI{' '}
              {actionContext.action === 'draft' ? 'outreach draft' : 'insights dashboard'}.
            </p>
            <ul className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {openRequisitions
                .filter((r) => r.jobDescription?.trim())
                .map((req) => (
                  <li key={req.id}>
                    <button
                      onClick={() => {
                        if (actionContext.action === 'draft') {
                          onOpenOutreachDraftModal(actionContext.candidate, req);
                        } else {
                          onOpenCandidateAIDashboardModal({
                            candidate: actionContext.candidate,
                            requisition: req,
                          });
                        }
                        setActionContext(null);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors"
                    >
                      <p className="font-semibold text-sm text-slate-700">{req.role}</p>
                      <p className="text-xs text-slate-400">
                        {req.function} · {req.location}
                      </p>
                    </button>
                  </li>
                ))}
            </ul>
            {openRequisitions.filter((r) => r.jobDescription?.trim()).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No open requisitions with a job description available.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Move Candidate Modal ── */}
      {candidateToMove && (
        <Modal
          isOpen={!!candidateToMove}
          onClose={() => setCandidateToMove(null)}
          title="Move Candidate to Requisition"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-slate-800">
                {allCandidates.find((c) => c.id === candidateToMove.candidateId)?.name}
              </p>
              {candidateToMove.poolId && (
                <p className="text-xs text-slate-400 mt-0.5">
                  From pool:{' '}
                  {talentPools.find((p) => p.id === candidateToMove.poolId)?.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Target Requisition
              </label>
              <select
                value={targetRequisitionForMove}
                onChange={(e) => setTargetRequisitionForMove(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="">Select a requisition...</option>
                {openRequisitions.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.role} ({req.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCandidateToMove(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                disabled={!targetRequisitionForMove}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm shadow-teal-600/25"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SourcerHubView;
