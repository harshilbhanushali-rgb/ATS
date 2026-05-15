import React, { useState, useMemo } from 'react';
import { Requisition, Candidate, Interview, CandidateStage } from '../types';
import Card from './Card';
import CandidateInterviewProgressCard from './CandidateInterviewProgressCard';
import { useAppData } from '../contexts/AppDataContext';
import { useModalState } from '../contexts/ModalStateContext';

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
  const { openInterviewModal: onOpenInterviewModal, openOfferModal: onOpenOfferModal, openCandidateAIDashboardModal: onOpenCandidateAIDashboardModal, openOutreachDraftModal: onOpenOutreachDraftModal, openHiringHub: onOpenHiringHub } = useModalState();
  const uniqueHiringManagers = useMemo(() => {
    const hmSet = new Set(allRequisitions.map(r => r.hiringManagerName));
    return Array.from(hmSet).sort();
  }, [allRequisitions]);

  const [selectedHiringManager, setSelectedHiringManager] = useState<string>(uniqueHiringManagers[0] || '');
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);

  const [hmCandidateSearchTerm, setHmCandidateSearchTerm] = useState('');
  const [hmCandidateStageFilter, setHmCandidateStageFilter] = useState('');

  const requisitionsForSelectedHM = useMemo(() => {
    return allRequisitions
      .filter(r => r.hiringManagerName === selectedHiringManager && 
                   (r.reqStatus === 'Open' || r.reqStatus === 'Offered' || r.reqStatus === 'Hold')
            )
      .sort((a, b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime());
  }, [allRequisitions, selectedHiringManager]);

  const selectedRequisition = useMemo(() => {
    return requisitionsForSelectedHM.find(r => r.id === selectedRequisitionId) || null;
  }, [requisitionsForSelectedHM, selectedRequisitionId]);

  const candidatesForSelectedRequisition = useMemo(() => {
    if (!selectedRequisitionId) return [];
    return allCandidates
      .filter(c => c.requisitionId === selectedRequisitionId && RELEVANT_HM_STAGES.includes(c.stage))
      .filter(c => {
        const term = hmCandidateSearchTerm.toLowerCase();
        const matchesSearch = term === '' ||
                              c.name.toLowerCase().includes(term) ||
                              c.email.toLowerCase().includes(term);
        const matchesStage = hmCandidateStageFilter === '' || c.stage === hmCandidateStageFilter;
        return matchesSearch && matchesStage;
      })
      .sort((a, b) => {
        const stageOrderA = RELEVANT_HM_STAGES.indexOf(a.stage);
        const stageOrderB = RELEVANT_HM_STAGES.indexOf(b.stage);
        if (stageOrderA !== stageOrderB) return stageOrderA - stageOrderB;
        return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
      });
  }, [allCandidates, selectedRequisitionId, hmCandidateSearchTerm, hmCandidateStageFilter]);
  
  const handleSelectRequisition = (requisitionId: string) => {
    setSelectedRequisitionId(requisitionId);
    setHmCandidateSearchTerm('');
    setHmCandidateStageFilter('');
  };
  
  const handleHMChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHiringManager(event.target.value);
    setSelectedRequisitionId(null);
    setHmCandidateSearchTerm('');
    setHmCandidateStageFilter('');
  };

  const handleClearCandidateFilters = () => {
    setHmCandidateSearchTerm('');
    setHmCandidateStageFilter('');
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1";

  if (uniqueHiringManagers.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-display mb-2">No Hiring Managers Found</h3>
        <p className="text-slate-500 max-w-xs">There are currently no hiring managers with active requisitions in the system.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
        <Card className="!p-6 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">Select Manager</h3>
          </div>
          <select 
            value={selectedHiringManager} 
            onChange={handleHMChange}
            className={inputClass}
          >
            {uniqueHiringManagers.map(hm => <option key={hm} value={hm}>{hm}</option>)}
          </select>
        </Card>

        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">My Requisitions</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
            {requisitionsForSelectedHM.length > 0 ? (
              <ul className="space-y-2">
                {requisitionsForSelectedHM.map(req => (
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

      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          {selectedRequisition ? (
            <>
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                    <div className="sm:col-span-2">
                      <label htmlFor="hmCandidateSearchTerm" className={labelClass}>Search Name/Email</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                              </svg>
                          </div>
                          <input
                            type="text"
                            id="hmCandidateSearchTerm"
                            placeholder="Search candidates..."
                            value={hmCandidateSearchTerm}
                            onChange={(e) => setHmCandidateSearchTerm(e.target.value)}
                            className={`${inputClass} pl-10`}
                          />
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-grow">
                          <label htmlFor="hmCandidateStageFilter" className={labelClass}>Stage</label>
                          <select id="hmCandidateStageFilter" value={hmCandidateStageFilter} onChange={(e) => setHmCandidateStageFilter(e.target.value)} className={inputClass}>
                            <option value="">All Relevant Stages</option>
                            {RELEVANT_HM_STAGES.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </div>
                        <button
                            onClick={handleClearCandidateFilters}
                            className="shrink-0 mt-5 p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="Clear candidate filters"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                            </svg>
                        </button>
                    </div>
                  </div>
              </div>
              <div className="p-6 flex-grow overflow-y-auto custom-scrollbar space-y-4">
                {candidatesForSelectedRequisition.length > 0 ? (
                  candidatesForSelectedRequisition.map(candidate => (
                    <CandidateInterviewProgressCard
                      key={candidate.id}
                      candidate={candidate}
                      requisition={selectedRequisition}
                      interviews={allInterviews.filter(i => i.candidateId === candidate.id)}
                      onLogInterview={onOpenInterviewModal}
                      onOpenOfferModal={onOpenOfferModal}
                      onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
                      onOpenOutreachDraftModal={onOpenOutreachDraftModal}
                      onOpenHiringHub={onOpenHiringHub}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-2">No Candidates Found</h3>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm">No candidates in the interview pipeline match your current filters.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 animate-in zoom-in duration-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-10 h-10 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m4.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display mb-3 tracking-tight">Select a Requisition</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Choose a hiring manager and one of their active requisitions from the left panel to view the interview pipeline.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HiringManagerView;
