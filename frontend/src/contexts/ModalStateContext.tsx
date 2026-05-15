import { createContext, useContext } from 'react';
import { Candidate, CandidateAIDashboardData, Requisition, TalentPool } from '../types';

interface HiringHubContext {
  candidate: Candidate;
  requisition: Requisition;
}

export interface ModalStateContextValue {
  isRequisitionModalOpen: boolean;
  editingRequisition: Requisition | null;
  openRequisitionModal: (requisition?: Requisition) => void;
  closeRequisitionModal: () => void;
  isCandidateModalOpen: boolean;
  editingCandidate: Candidate | null;
  defaultRequisitionIdForCandidate: string | null;
  defaultTalentPoolIdForCandidate: string | null;
  openCandidateModal: (candidate?: Candidate, requisitionId?: string, talentPoolId?: string) => void;
  closeCandidateModal: () => void;
  isInterviewModalOpen: boolean;
  candidateForInterview: Candidate | null;
  requisitionForInterview: Requisition | null;
  openInterviewModal: (candidate: Candidate, requisition: Requisition) => void;
  closeInterviewModal: () => void;
  isOfferModalOpen: boolean;
  candidateForOffer: Candidate | null;
  requisitionForOffer: Requisition | null;
  openOfferModal: (candidate: Candidate, requisition: Requisition) => void;
  closeOfferModal: () => void;
  isTalentPoolFormModalOpen: boolean;
  editingTalentPool: TalentPool | null;
  openTalentPoolFormModal: (pool?: TalentPool) => void;
  closeTalentPoolFormModal: () => void;
  isAddCandidateToPoolModalOpen: boolean;
  poolToAddTo: TalentPool | null;
  openAddCandidateToPoolModal: (pool: TalentPool) => void;
  closeAddCandidateToPoolModal: () => void;
  isLogOutreachModalOpen: boolean;
  candidateForOutreachLog: Candidate | null;
  openLogOutreachModal: (candidate: Candidate) => void;
  closeLogOutreachModal: () => void;
  isOutreachDraftModalOpen: boolean;
  candidateForOutreachDraft: Candidate | null;
  currentOutreachDraft: string | null;
  isGeneratingOutreachDraft: boolean;
  outreachDraftError: string | null;
  openOutreachDraftModal: (candidate: Candidate, requisition: Requisition) => void;
  closeOutreachDraftModal: () => void;
  isHiringHubOpen: boolean;
  contextForHiringHub: HiringHubContext | null;
  openHiringHub: (candidate: Candidate, requisition: Requisition) => void;
  closeHiringHub: () => void;
  isCandidateAIDashboardModalOpen: boolean;
  dataForAIDashboard: CandidateAIDashboardData | null;
  openCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  closeCandidateAIDashboardModal: () => void;
}

const ModalStateContext = createContext<ModalStateContextValue | null>(null);

export function useModalState(): ModalStateContextValue {
  const ctx = useContext(ModalStateContext);
  if (!ctx) throw new Error('useModalState must be used within ModalStateContext.Provider');
  return ctx;
}

export default ModalStateContext;
