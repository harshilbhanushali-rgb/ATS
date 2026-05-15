import React, { useState, useMemo } from 'react';
import { Candidate, CandidateStage, Requisition, RequisitionStatus } from '../types';
import Card from './Card';
import { Plus as PlusIcon, UserPlus as UserPlusIcon, Trash2 as TrashIcon, Pencil as PencilIcon, Database as DatabaseIcon, Send as PaperAirplaneIcon, MessageCircle as ChatBubbleLeftEllipsisIcon, UserSearch as UserMagnifyingGlassIcon, Eye as EyeIcon, BarChart3 as BarChartIcon } from 'lucide-react';
import AIRecommendationsDisplay from './AIRecommendationsDisplay';
import PencilSparklesIcon from './icons/PencilSparklesIcon';
import Modal from './Modal';
import SourcerDashboardView from './SourcerDashboardView';
import { useAppData } from '../contexts/AppDataContext';
import { useModalState } from '../contexts/ModalStateContext';

const SourcerHubView: React.FC = () => {
  const { requisitions, candidates: allCandidates, talentPools, aiMatchedCandidates, isLoadingAiMatches, currentRequisitionForAIMatches, findAiCandidateMatches: onFindAiCandidateMatches, assignCandidateFromAIPool: onAssignCandidateFromAIPool, removeCandidateFromPool: onRemoveCandidateFromPool, moveCandidateToRequisition: onMoveCandidateToRequisition } = useAppData();
  const { openCandidateModal: onOpenCandidateModal, openTalentPoolFormModal: onOpenTalentPoolFormModal, openAddCandidateToPoolModal: onOpenAddCandidateToPoolModal, openLogOutreachModal: onOpenLogOutreachModal, openCandidateAIDashboardModal: onOpenCandidateAIDashboardModal, openOutreachDraftModal: onOpenOutreachDraftModal } = useModalState();
  const [mainTab, setMainTab] = useState<'hub' | 'kpis'>('hub');
  const [selectedView, setSelectedView] = useState<'requisitions' | 'talentPools'>('requisitions');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [candidateToMove, setCandidateToMove] = useState<{candidateId: string; poolId?: string} | null>(null);
  const [targetRequisitionForMove, setTargetRequisitionForMove] = useState<string>('');
  const [actionContext, setActionContext] = useState<{action: 'draft' | 'insights', candidate: Candidate} | null>(null);
  const [isPoolSelectorOpen, setIsPoolSelectorOpen] = useState(false);
  const [pendingMatchRequisition, setPendingMatchRequisition] = useState<Requisition | null>(null);
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);


  const openRequisitions = useMemo(() => 
    requisitions.filter(r => r.reqStatus === RequisitionStatus.OPEN || r.reqStatus === RequisitionStatus.OFFERED)
      .sort((a,b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime()), 
    [requisitions]
  );

  const sortedTalentPools = useMemo(() => 
    [...talentPools].sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
    [talentPools]
  );
  
  const selectedRequisition = useMemo(() => 
    selectedView === 'requisitions' ? openRequisitions.find(r => r.id === selectedItemId) : null,
  [selectedView, selectedItemId, openRequisitions]);

  const selectedTalentPool = useMemo(() =>
    selectedView === 'talentPools' ? sortedTalentPools.find(p => p.id === selectedItemId) : null,
  [selectedView, selectedItemId, sortedTalentPools]);

  const candidatesToDisplay = useMemo(() => {
    if (selectedView === 'requisitions' && selectedRequisition) {
       const SOURCER_RELEVANT_STAGES = [CandidateStage.APPLIED, CandidateStage.SCREENING];
       return allCandidates.filter(c => c.requisitionId === selectedRequisition.id && SOURCER_RELEVANT_STAGES.includes(c.stage))
        .sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
    }
    if (selectedView === 'talentPools' && selectedTalentPool) {
      return allCandidates.filter(c => c.talentPoolIds?.includes(selectedTalentPool.id))
        .sort((a,b) => (b.name || "").localeCompare(a.name || ""));
    }
    return [];
  }, [selectedView, selectedRequisition, selectedTalentPool, allCandidates]);


  const handleStartMoveCandidate = (candidateId: string, poolId?: string) => {
    setTargetRequisitionForMove(''); // Reset previous selection
    setCandidateToMove({ candidateId, poolId });
  };
  const handleConfirmMoveCandidate = () => {
    if (candidateToMove && targetRequisitionForMove) {
      onMoveCandidateToRequisition(candidateToMove.candidateId, targetRequisitionForMove, candidateToMove.poolId);
      setCandidateToMove(null);
      setTargetRequisitionForMove('');
    }
  };

  const handleCloseMoveModal = () => {
    setCandidateToMove(null);
    setTargetRequisitionForMove('');
  };

  const renderCandidateItem = (candidate: Candidate, currentPoolId?: string) => {
    const requisitionForCandidateContext = selectedRequisition;

    return (
        <Card key={candidate.id} className="mb-3 hover:shadow-md transition-shadow">
            <div className="p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h5 className="font-semibold text-indigo-700 text-sm">{candidate.name}</h5>
                        <p className="text-xs text-gray-500">{candidate.email}</p>
                        <p className="text-xs text-gray-500">Stage: {candidate.stage} | Source: {candidate.source}</p>
                    </div>
                    {currentPoolId && (
                        <button
                            onClick={() => onRemoveCandidateFromPool(candidate.id, currentPoolId)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                            title="Remove from this pool"
                        >
                            <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                 {candidate.notes && <p className="mt-1 text-xs p-1.5 bg-gray-50 rounded border border-gray-100">{candidate.notes}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5 justify-end text-xs">
                     <button
                        onClick={() => {
                            if (requisitionForCandidateContext) {
                                onOpenCandidateAIDashboardModal({candidate, requisition: requisitionForCandidateContext});
                            } else {
                                setActionContext({ action: 'insights', candidate });
                            }
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium py-1 px-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="View AI Insights Dashboard"
                    >
                        <EyeIcon className="w-3.5 h-3.5 mr-1" /> AI Insights
                    </button>
                    <button
                        onClick={() => {
                            if (requisitionForCandidateContext) {
                                onOpenOutreachDraftModal(candidate, requisitionForCandidateContext);
                            } else {
                                setActionContext({ action: 'draft', candidate });
                            }
                        }}
                        disabled={!requisitionForCandidateContext && selectedView === 'requisitions'}
                        className="flex items-center text-purple-600 hover:text-purple-800 font-medium py-1 px-1.5 rounded-md hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={requisitionForCandidateContext && !requisitionForCandidateContext.jobDescription?.trim() ? "Add a Job Description to the requisition for AI Drafts" : "AI Draft Outreach Message"}
                    >
                        <PencilSparklesIcon className="w-3.5 h-3.5 mr-1" /> AI Draft
                    </button>
                    <button 
                        onClick={() => onOpenLogOutreachModal(candidate)}
                        className="flex items-center text-green-600 hover:text-green-800 font-medium py-1 px-1.5 rounded-md hover:bg-green-50 transition-colors"
                        title="Log Outreach"
                    >
                         <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 mr-1" /> Log
                    </button>
                    <button 
                        onClick={() => onOpenCandidateModal(candidate, undefined, currentPoolId)}
                        className="flex items-center text-gray-600 hover:text-gray-800 font-medium py-1 px-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Edit Candidate"
                    >
                        <PencilIcon className="w-3.5 h-3.5 mr-1" /> Edit
                    </button>
                    {currentPoolId && ( // Show "Move to Requisition" only for candidates in a talent pool
                        <button 
                            onClick={() => handleStartMoveCandidate(candidate.id, currentPoolId)}
                            className="flex items-center text-teal-600 hover:text-teal-800 font-medium py-1 px-1.5 rounded-md hover:bg-teal-50 transition-colors"
                            title="Move to Requisition"
                        >
                            <PaperAirplaneIcon className="w-3.5 h-3.5 mr-1" /> Move
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
  };
  
  const buttonBaseClass = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 w-full text-center transition-colors";
  const activeTabClass = "bg-indigo-600 text-white focus:ring-indigo-500";
  const inactiveTabClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400";

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
      {/* Main Tab Bar */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 shrink-0">
        <button
          onClick={() => setMainTab('hub')}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${mainTab === 'hub' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <UserMagnifyingGlassIcon className="w-4 h-4" /> Sourcer Hub
        </button>
        <button
          onClick={() => setMainTab('kpis')}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${mainTab === 'kpis' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <BarChartIcon className="w-4 h-4" /> Sourcer KPIs
        </button>
      </div>

      {mainTab === 'kpis' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <SourcerDashboardView />
        </div>
      )}

      {mainTab === 'hub' && (
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
      {/* Left Panel: Navigation & Item List */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-3 min-h-0">
        <div className="grid grid-cols-2 gap-2 shrink-0">
            <button onClick={() => { setSelectedView('requisitions'); setSelectedItemId(null); }} className={`${buttonBaseClass} ${selectedView === 'requisitions' ? activeTabClass : inactiveTabClass}`}>
                Active Requisitions
            </button>
            <button onClick={() => { setSelectedView('talentPools'); setSelectedItemId(null); }} className={`${buttonBaseClass} ${selectedView === 'talentPools' ? activeTabClass : inactiveTabClass}`}>
                Talent Pools
            </button>
        </div>
        <Card
            title={selectedView === 'requisitions' ? "Select Requisition" : "Select Talent Pool"}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
            bodyClassName="flex-grow min-h-0 overflow-y-auto p-2 custom-scrollbar"
            titleRightElement={selectedView === 'talentPools' ? 
                <button onClick={() => onOpenTalentPoolFormModal()} className="text-teal-500 hover:text-teal-700 p-1" title="New Talent Pool"><PlusIcon className="w-5 h-5"/></button> : null
            }
        >
          {selectedView === 'requisitions' && (openRequisitions.length > 0 ? (
            <ul className="space-y-1.5">
              {openRequisitions.map(req => (
                <li key={req.id}>
                  <button onClick={() => setSelectedItemId(req.id)} className={`w-full text-left p-2.5 rounded-md border text-xs ${selectedItemId === req.id ? 'bg-indigo-100 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                    <p className={`font-semibold ${selectedItemId === req.id ? 'text-indigo-700' : 'text-gray-700'}`}>{req.role}</p>
                    <p className="text-gray-500">{req.function} - {req.location}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4 text-xs">No open requisitions.</p>)}
          
          {selectedView === 'talentPools' && (sortedTalentPools.length > 0 ? (
            <ul className="space-y-1.5">
              {sortedTalentPools.map(pool => (
                <li key={pool.id}>
                  <button onClick={() => setSelectedItemId(pool.id)} className={`w-full text-left p-2.5 rounded-md border text-xs ${selectedItemId === pool.id ? 'bg-indigo-100 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                    <p className={`font-semibold ${selectedItemId === pool.id ? 'text-indigo-700' : 'text-gray-700'}`}>{pool.name}</p>
                    <p className="text-gray-500 truncate">{pool.description || "No description"}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4 text-xs">No talent pools created.</p>)}
        </Card>
      </div>

      {/* Main Panel: Candidates & Actions */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-3 min-h-0 overflow-hidden">
        {selectedView === 'talentPools' && selectedTalentPool && (
            <div className="flex justify-end space-x-2 items-center">
                 <button 
                    onClick={() => onOpenCandidateModal(undefined, undefined, selectedTalentPool.id)} 
                    className="flex items-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-md shadow-sm"
                    title="Add New Candidate directly to this pool"
                >
                    <UserPlusIcon className="w-4 h-4 mr-1.5"/> New Candidate to Pool
                </button>
                 <button 
                    onClick={() => onOpenAddCandidateToPoolModal(selectedTalentPool)} 
                    className="flex items-center text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-md shadow-sm"
                    title="Add Existing Candidate to this pool"
                >
                   <DatabaseIcon className="w-4 h-4 mr-1.5"/> Add Existing Candidate
                </button>
            </div>
        )}
        {selectedView === 'requisitions' && selectedRequisition && (
            <div className="flex justify-between items-center">
                <button
                    onClick={() => { setPendingMatchRequisition(selectedRequisition); setSelectedPoolIds([]); setIsPoolSelectorOpen(true); }}
                    disabled={isLoadingAiMatches}
                    className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm text-xs transition-all disabled:opacity-50"
                    title="Find matching candidates from Talent Pools using AI for this requisition"
                >
                    <UserMagnifyingGlassIcon className="w-4 h-4 mr-1.5" />
                    AI Matches from Pools
                </button>
                 <button 
                    onClick={() => onOpenCandidateModal(undefined, selectedRequisition.id)} 
                    className="flex items-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-md shadow-sm"
                >
                    <UserPlusIcon className="w-4 h-4 mr-1.5"/> Add Candidate to Requisition
                </button>
            </div>
        )}

        {currentRequisitionForAIMatches && selectedRequisition?.id === currentRequisitionForAIMatches.id && (
             <div className="overflow-y-auto flex-shrink max-h-[40vh] p-1 rounded-md bg-indigo-50 border border-indigo-100">
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
        
        <Card 
            title={
                selectedView === 'requisitions' ? (selectedRequisition ? `Top of Funnel for: ${selectedRequisition.role}` : "Select Requisition") :
                (selectedTalentPool ? `Candidates in: ${selectedTalentPool.name}` : "Select Talent Pool")
            } 
            className="flex-1 min-h-0 flex flex-col overflow-hidden" bodyClassName="flex-grow min-h-0 overflow-y-auto p-2 custom-scrollbar"
        >
          {candidatesToDisplay.length > 0 ? (
            candidatesToDisplay.map(cand => renderCandidateItem(cand, selectedTalentPool?.id))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">
                {selectedItemId ? "No candidates to display." : (selectedView === 'requisitions' ? "Select a requisition to see its candidates." : "Select a talent pool to see its candidates.")}
            </p>
          )}
        </Card>
      </div>

      {/* Pool Selector for AI Matching */}
      {isPoolSelectorOpen && pendingMatchRequisition && (
        <Modal
          isOpen={isPoolSelectorOpen}
          onClose={() => setIsPoolSelectorOpen(false)}
          title={`Select Talent Pools for AI Matching: ${pendingMatchRequisition.role}`}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose which talent pools to search for AI-matched candidates. Leave all unchecked to search across all pools.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sortedTalentPools.map(pool => (
                <label key={pool.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:bg-indigo-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedPoolIds.includes(pool.id)}
                    onChange={(e) => {
                      setSelectedPoolIds(prev =>
                        e.target.checked ? [...prev, pool.id] : prev.filter(id => id !== pool.id)
                      );
                    }}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{pool.name}</p>
                    {pool.description && <p className="text-xs text-gray-500">{pool.description}</p>}
                  </div>
                </label>
              ))}
              {sortedTalentPools.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No talent pools available.</p>}
            </div>
            <p className="text-xs text-indigo-600 font-medium">
              {selectedPoolIds.length === 0 ? 'All pools will be searched.' : `${selectedPoolIds.length} pool(s) selected.`}
            </p>
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsPoolSelectorOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  onFindAiCandidateMatches(pendingMatchRequisition, selectedPoolIds.length > 0 ? selectedPoolIds : undefined);
                  setIsPoolSelectorOpen(false);
                }}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Run AI Match
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Selecting Requisition Context */}
      {actionContext && (
        <Modal
            isOpen={!!actionContext}
            onClose={() => setActionContext(null)}
            title={`Select Requisition for: ${actionContext.candidate.name}`}
            size="lg"
        >
            <div className="space-y-3">
                <p className="text-sm text-gray-600">
                    Please select an open requisition to provide context for the AI {actionContext.action === 'draft' ? 'outreach message' : 'insights dashboard'}.
                </p>
                <ul className="max-h-60 overflow-y-auto space-y-1 pr-2">
                    {openRequisitions.filter(r => r.jobDescription?.trim()).map(req => (
                        <li key={req.id}>
                            <button
                                onClick={() => {
                                    if (actionContext.action === 'draft') {
                                        onOpenOutreachDraftModal(actionContext.candidate, req);
                                    } else {
                                        onOpenCandidateAIDashboardModal({ candidate: actionContext.candidate, requisition: req });
                                    }
                                    setActionContext(null);
                                }}
                                className="w-full text-left p-2 rounded-md border text-xs bg-white hover:bg-indigo-50 border-gray-200 transition-colors"
                            >
                                <p className="font-semibold text-gray-700">{req.role}</p>
                                <p className="text-gray-500">{req.function} - {req.location}</p>
                            </button>
                        </li>
                    ))}
                </ul>
                {openRequisitions.filter(r => r.jobDescription?.trim()).length === 0 && <p className="text-sm text-gray-500 text-center py-4">No open requisitions with a job description are available to provide context.</p>}
            </div>
        </Modal>
      )}

      {/* Modal for Moving Candidate */}
      {candidateToMove && (
        <Modal
            isOpen={!!candidateToMove}
            onClose={handleCloseMoveModal}
            title="Move Candidate to Requisition"
            size="lg"
        >
          <div className="space-y-4">
              <div>
                  <p className="text-sm mb-2">Moving Candidate: <span className="font-semibold">{candidateToMove ? allCandidates.find(c=>c.id === candidateToMove.candidateId)?.name : ''}</span></p>
                  {candidateToMove.poolId && <p className="text-xs text-gray-500 mb-3">From Talent Pool: {talentPools.find(p=>p.id === candidateToMove.poolId)?.name}</p>}
              </div>
              <div className="mb-4">
                  <label htmlFor="targetRequisition" className="block text-sm font-medium text-gray-700">Select Target Requisition:</label>
                  <select 
                      id="targetRequisition" 
                      value={targetRequisitionForMove} 
                      onChange={(e) => setTargetRequisitionForMove(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                      <option value="">-- Select Requisition --</option>
                      {openRequisitions.map(req => (
                          <option key={req.id} value={req.id}>{req.role} (ID: {req.id})</option>
                      ))}
                  </select>
              </div>
              <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
                  <button type="button" onClick={handleCloseMoveModal} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Cancel</button>
                  <button type="button" onClick={handleConfirmMoveCandidate} disabled={!targetRequisitionForMove} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50">Confirm Move</button>
              </div>
          </div>
        </Modal>
      )}
      </div>
      )}
    </div>
  );
};

export default SourcerHubView;