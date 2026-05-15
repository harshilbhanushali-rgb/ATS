import React, { useState, useMemo } from 'react';
import { Requisition, Candidate, RequisitionStatus, ResumeMatchAnalysis, CandidateStage } from '../types';
import Card from './Card';
import { CandidateList } from './CandidateList';
import { Plus as PlusIcon, UserSearch as UserMagnifyingGlassIcon } from 'lucide-react';
import Modal from './Modal';
import ResumeAnalysisDisplay from './ResumeAnalysisDisplay';
import AIRecommendationsDisplay from './AIRecommendationsDisplay';
import { useAppData } from '../contexts/AppDataContext';
import { useModalState } from '../contexts/ModalStateContext';

export const RecruiterView: React.FC = () => {
  const { requisitions, candidates: allCandidates, aiMatchedCandidates, isLoadingAiMatches, currentRequisitionForAIMatches, findAiCandidateMatches: onFindAiCandidateMatches, assignCandidateFromAIPool: onAssignCandidateFromAIPool } = useAppData();
  const { openCandidateModal: onOpenCandidateModal, openCandidateAIDashboardModal: onOpenCandidateAIDashboardModal, openLogOutreachModal: onOpenLogOutreachModal, openOutreachDraftModal: onOpenOutreachDraftModal, openHiringHub: onOpenHiringHub } = useModalState();
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisForModal, setAnalysisForModal] = useState<ResumeMatchAnalysis | null>(null);
  const [contextForAnalysisModal, setContextForAnalysisModal] = useState<{candidateName: string, requisitionRole: string} | null>(null);

  const [reqSearchTerm, setReqSearchTerm] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('');
  
  const [candSearchTerm, setCandSearchTerm] = useState('');
  const [candStageFilter, setCandStageFilter] = useState('');

  const openRequisitions = useMemo(() => {
    return requisitions
      .filter(r => r.reqStatus === RequisitionStatus.OPEN || r.reqStatus === RequisitionStatus.OFFERED)
      .filter(r => {
        const term = reqSearchTerm.toLowerCase();
        const matchesSearch = term === '' || r.role.toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
        const matchesStatus = reqStatusFilter === '' || r.reqStatus === reqStatusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a,b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime());
  }, [requisitions, reqSearchTerm, reqStatusFilter]);

  const selectedRequisition = useMemo(() => {
    return requisitions.find(r => r.id === selectedRequisitionId) || null;
  }, [requisitions, selectedRequisitionId]);

  const candidatesForSelectedRequisition = useMemo(() => {
    if (!selectedRequisitionId) return [];
    return allCandidates
      .filter(c => c.requisitionId === selectedRequisitionId)
      .filter(c => {
        const term = candSearchTerm.toLowerCase();
        const matchesSearch = term === '' || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
        const matchesStage = candStageFilter === '' || c.stage === candStageFilter;
        return matchesSearch && matchesStage;
      })
      .sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
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

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1";

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Left Panel: Requisitions */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
        <Card className="!p-6 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">Filter Requisitions</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="reqSearchTerm" className={labelClass}>Search Role/ID</label>
              <input type="text" id="reqSearchTerm" value={reqSearchTerm} onChange={(e) => setReqSearchTerm(e.target.value)} className={inputClass} placeholder="Role or ID..." />
            </div>
            <div>
              <label htmlFor="reqStatusFilter" className={labelClass}>Status</label>
              <select id="reqStatusFilter" value={reqStatusFilter} onChange={(e) => setReqStatusFilter(e.target.value)} className={inputClass}>
                <option value="">All Open/Offered</option>
                <option value={RequisitionStatus.OPEN}>Open</option>
                <option value={RequisitionStatus.OFFERED}>Offered</option>
              </select>
            </div>
             <button onClick={handleClearReqFilters} className="w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest py-2.5 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                </svg>
                Clear Filters
            </button>
          </div>
        </Card>

        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">Active Requisitions</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
            {openRequisitions.length > 0 ? (
              <ul className="space-y-2">
                {openRequisitions.map(req => (
                  <li key={req.id}>
                    <button
                      onClick={() => handleSelectRequisition(req.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group
                                  ${selectedRequisitionId === req.id 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                                  }`}
                    >
                      <p className={`font-bold text-sm tracking-tight mb-1 ${selectedRequisitionId === req.id ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'}`}>{req.role}</p>
                      <div className={`flex items-center text-[10px] font-bold uppercase tracking-wider ${selectedRequisitionId === req.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                        <span>{req.function}</span>
                        <span className="mx-2 opacity-30">•</span>
                        <span>{req.location}</span>
                      </div>
                      <p className={`text-[10px] mt-2 font-medium ${selectedRequisitionId === req.id ? 'text-indigo-200' : 'text-slate-400'}`}>ID: {req.id}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-xs font-medium">No active requisitions found.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel: Candidates for Selected Requisition */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-6">
        {selectedRequisition && (
            <Card className="shrink-0 !p-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="candSearchTerm" className={labelClass}>Search Name/Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input type="text" id="candSearchTerm" value={candSearchTerm} onChange={(e) => setCandSearchTerm(e.target.value)} className={`${inputClass} pl-10`} placeholder="Name or email..." />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="candStageFilter" className={labelClass}>Stage</label>
                        <select id="candStageFilter" value={candStageFilter} onChange={(e) => setCandStageFilter(e.target.value)} className={inputClass}>
                            <option value="">All Stages</option>
                            {Object.values(CandidateStage).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button onClick={handleClearCandFilters} className="flex items-center justify-center text-[10px] font-bold uppercase tracking-widest py-3 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                        </svg>
                        Clear Filters
                    </button>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-start">
                    <button
                        onClick={() => onOpenCandidateModal(undefined, selectedRequisition.id)}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" /> Add Candidate
                    </button>
                    <button
                        onClick={() => onFindAiCandidateMatches(selectedRequisition)}
                        disabled={isLoadingAiMatches || !selectedRequisition.jobDescription?.trim()}
                        className="flex items-center bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50 text-purple-600 font-bold py-2.5 px-5 rounded-xl shadow-sm text-xs transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                        title={!selectedRequisition.jobDescription?.trim() ? "Add Job Description to Requisition to enable AI Matching" : "Find matching candidates from Talent Pools using AI"}
                    >
                        <UserMagnifyingGlassIcon className="w-4 h-4 mr-2" />
                        AI Matches from Pools
                    </button>
                </div>
            </Card>
        )}

        {selectedRequisition && currentRequisitionForAIMatches?.id === selectedRequisition.id && (
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
            title={selectedRequisition ? `Candidate Pipeline: ${selectedRequisition.role}` : "Select a Requisition"} 
            className="flex-1 flex flex-col" 
            bodyClassName="flex-grow overflow-y-auto p-2"
        >
          {selectedRequisition ? (
            candidatesForSelectedRequisition.length > 0 ? (
              <CandidateList 
                candidates={candidatesForSelectedRequisition} 
                selectedRequisition={selectedRequisition}
                onEditCandidate={onOpenCandidateModal}
                onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
                onOpenLogOutreachModal={onOpenLogOutreachModal}
                onOpenOutreachDraftModal={onOpenOutreachDraftModal}
                onOpenHiringHub={onOpenHiringHub}
              />
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">
                {allCandidates.filter(c => c.requisitionId === selectedRequisitionId).length === 0 
                  ? "No candidates added to this requisition yet." 
                  : "No candidates match current filters."}
              </p>
            )
          ) : (
            <p className="text-gray-500 text-center py-10 text-sm">Select a requisition from the left to view its candidates.</p>
          )}
        </Card>
      </div>

      {isAnalysisModalOpen && analysisForModal && contextForAnalysisModal && (
        <Modal isOpen={isAnalysisModalOpen} onClose={handleCloseAnalysisModal} title={`Resume Analysis: ${contextForAnalysisModal.candidateName}`} size="4xl">
            <ResumeAnalysisDisplay 
                analysis={analysisForModal} 
                candidateName={contextForAnalysisModal.candidateName}
                requisitionRole={contextForAnalysisModal.requisitionRole}
            />
        </Modal>
      )}
    </div>
  );
};
