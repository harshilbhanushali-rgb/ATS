import React, { createContext, useContext } from 'react';
import {
  AIRecommendedCandidate,
  Candidate,
  CandidateOutreachLog,
  CandidateStage,
  Interview,
  InterviewScorecardTemplate,
  OfferDetails,
  Requisition,
  ResumeMatchAnalysis,
  TalentPool,
} from '../types';
import { RequisitionFilterParams } from '../services/crudApi';

export interface AppDataContextValue {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  requisitions: Requisition[];
  interviews: Interview[];
  talentPools: TalentPool[];
  candidateOutreachLogs: CandidateOutreachLog[];
  scorecardTemplates: InterviewScorecardTemplate[];
  aiMatchedCandidates: AIRecommendedCandidate[] | null;
  isLoadingAiMatches: boolean;
  currentRequisitionForAIMatches: Requisition | null;
  saveCandidate: (candidate: Candidate, defaultTalentPoolId?: string) => void;
  updateCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
  saveCandidateAnalysis: (candidateId: string, analysis: ResumeMatchAnalysis | null) => void;
  removeCandidateFromPool: (candidateId: string, poolId: string) => void;
  moveCandidateToRequisition: (candidateId: string, newRequisitionId: string, talentPoolIdToRemoveFrom?: string) => void;
  saveRequisition: (requisition: Requisition) => void;
  refetchWithFilters: (params: RequisitionFilterParams) => void;
  saveInterview: (interview: Interview) => void;
  saveTalentPool: (pool: TalentPool) => void;
  saveScorecardTemplate: (template: InterviewScorecardTemplate) => void;
  saveOutreachLog: (candidateId: string, channel: string, outreachDate: string, notes?: string, responded?: boolean, responseDate?: string, clickedLink?: boolean) => void;
  saveOffer: (candidateId: string, offerDetails: OfferDetails) => void;
  offerAccepted: (candidateId: string) => void;
  offerDeclined: (candidateId: string) => void;
  confirmJoined: (candidateId: string) => void;
  findAiCandidateMatches: (requisition: Requisition, poolIds?: string[]) => void;
  assignCandidateFromAIPool: (candidateId: string, requisitionId: string) => void;
  saveHiringHubComment: (candidateId: string, commentText: string) => void;
  generateAIDebriefSummary: (candidate: Candidate, requisition: Requisition, interviews: Interview[]) => void;
  recordFinalDecision: (candidateId: string, decision: 'HIRE' | 'REJECT') => void;
  archiveRequisition: (id: string) => Promise<void>;
  reactivateRequisition: (id: string) => Promise<void>;
  clearData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataContext.Provider');
  return ctx;
}

export default AppDataContext;
