import React from 'react';
import CandidateAIDashboardModal from '../components/CandidateAIDashboardModal';
import CandidateForm from '../components/CandidateForm';
import HiringHubView from '../components/HiringHubView';
import InterviewForm from '../components/InterviewForm';
import LogOutreachForm from '../components/LogOutreachForm';
import Modal from '../components/Modal';
import OfferForm from '../components/OfferForm';
import OutreachDraftModal from '../components/OutreachDraftModal';
import RequisitionForm from '../components/RequisitionForm';
import TalentPoolForm from '../components/TalentPoolForm';
import {
  Candidate,
  CandidateAIDashboardData,
  Interview,
  InterviewScorecardTemplate,
  OfferDetails,
  Requisition,
  ResumeMatchAnalysis,
  TalentPool,
  UserRole,
} from '../types';

interface HiringHubContext {
  candidate: Candidate;
  requisition: Requisition;
}

interface AppModalsProps {
  loggedInUserRole: UserRole;
  requisitions: Requisition[];
  candidates: Candidate[];
  interviews: Interview[];
  scorecardTemplates: InterviewScorecardTemplate[];
  dataForAIDashboard: CandidateAIDashboardData | null;
  isRequisitionModalOpen: boolean;
  editingRequisition: Requisition | null;
  onSaveRequisition: (requisition: Requisition) => void;
  onCloseRequisitionModal: () => void;
  isCandidateModalOpen: boolean;
  editingCandidate: Candidate | null;
  defaultRequisitionIdForCandidate: string | null;
  defaultTalentPoolIdForCandidate: string | null;
  onSaveCandidate: (candidate: Candidate, defaultTalentPoolIdParam?: string) => void;
  onCloseCandidateModal: () => void;
  isInterviewModalOpen: boolean;
  candidateForInterview: Candidate | null;
  requisitionForInterview: Requisition | null;
  onSaveInterview: (interview: Interview) => void;
  onCloseInterviewModal: () => void;
  isOfferModalOpen: boolean;
  candidateForOffer: Candidate | null;
  requisitionForOffer: Requisition | null;
  onSaveOffer: (candidateId: string, offerDetails: OfferDetails) => void;
  onCloseOfferModal: () => void;
  isTalentPoolFormModalOpen: boolean;
  editingTalentPool: TalentPool | null;
  onSaveTalentPool: (pool: TalentPool) => void;
  onCloseTalentPoolFormModal: () => void;
  isAddCandidateToPoolModalOpen: boolean;
  poolToAddTo: TalentPool | null;
  onCloseAddCandidateToPoolModal: () => void;
  isCandidateAIDashboardModalOpen: boolean;
  onCloseCandidateAIDashboardModal: () => void;
  onTriggerResumeAnalysis: (candidateId: string, analysis: ResumeMatchAnalysis | null) => void;
  isLogOutreachModalOpen: boolean;
  candidateForOutreachLog: Candidate | null;
  onSaveOutreachLog: (
    candidateId: string,
    channel: string,
    outreachDate: string,
    notes?: string,
    responded?: boolean,
    responseDate?: string,
    clickedLink?: boolean
  ) => void;
  onCloseLogOutreachModal: () => void;
  isOutreachDraftModalOpen: boolean;
  candidateForOutreachDraft: Candidate | null;
  currentOutreachDraft: string | null;
  isGeneratingOutreachDraft: boolean;
  outreachDraftError: string | null;
  onCloseOutreachDraftModal: () => void;
  isHiringHubOpen: boolean;
  contextForHiringHub: HiringHubContext | null;
  onSaveHiringHubComment: (candidateId: string, commentText: string) => void;
  onGenerateAISummary: (candidate: Candidate, requisition: Requisition, interviews: Interview[]) => void;
  onRecordDecision: (candidateId: string, decision: 'HIRE' | 'REJECT') => void;
  onCloseHiringHub: () => void;
}

const AppModals: React.FC<AppModalsProps> = ({
  loggedInUserRole,
  requisitions,
  interviews,
  scorecardTemplates,
  dataForAIDashboard,
  isRequisitionModalOpen,
  editingRequisition,
  onSaveRequisition,
  onCloseRequisitionModal,
  isCandidateModalOpen,
  editingCandidate,
  defaultRequisitionIdForCandidate,
  defaultTalentPoolIdForCandidate,
  onSaveCandidate,
  onCloseCandidateModal,
  isInterviewModalOpen,
  candidateForInterview,
  requisitionForInterview,
  onSaveInterview,
  onCloseInterviewModal,
  isOfferModalOpen,
  candidateForOffer,
  requisitionForOffer,
  onSaveOffer,
  onCloseOfferModal,
  isTalentPoolFormModalOpen,
  editingTalentPool,
  onSaveTalentPool,
  onCloseTalentPoolFormModal,
  isAddCandidateToPoolModalOpen,
  poolToAddTo,
  onCloseAddCandidateToPoolModal,
  isCandidateAIDashboardModalOpen,
  onCloseCandidateAIDashboardModal,
  onTriggerResumeAnalysis,
  isLogOutreachModalOpen,
  candidateForOutreachLog,
  onSaveOutreachLog,
  onCloseLogOutreachModal,
  isOutreachDraftModalOpen,
  candidateForOutreachDraft,
  currentOutreachDraft,
  isGeneratingOutreachDraft,
  outreachDraftError,
  onCloseOutreachDraftModal,
  isHiringHubOpen,
  contextForHiringHub,
  onSaveHiringHubComment,
  onGenerateAISummary,
  onRecordDecision,
  onCloseHiringHub,
}) => {
  return (
    <>
      <Modal
        isOpen={isRequisitionModalOpen}
        onClose={onCloseRequisitionModal}
        title={editingRequisition ? 'Edit Requisition' : 'New Requisition'}
        size="4xl"
      >
        <RequisitionForm
          onSubmit={onSaveRequisition}
          initialData={editingRequisition}
          onClose={onCloseRequisitionModal}
          currentUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isCandidateModalOpen}
        onClose={onCloseCandidateModal}
        title={editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
      >
        <CandidateForm
          onSubmit={onSaveCandidate}
          initialData={editingCandidate}
          requisitions={requisitions}
          defaultRequisitionId={defaultRequisitionIdForCandidate}
          defaultTalentPoolId={defaultTalentPoolIdForCandidate}
          onClose={onCloseCandidateModal}
        />
      </Modal>

      <Modal
        isOpen={isInterviewModalOpen}
        onClose={onCloseInterviewModal}
        title="Log Interview Feedback"
        size="2xl"
      >
        {candidateForInterview && requisitionForInterview && (
          <InterviewForm
            onSubmit={onSaveInterview}
            candidate={candidateForInterview}
            requisition={requisitionForInterview}
            existingInterviews={interviews}
            scorecardTemplates={scorecardTemplates}
            onClose={onCloseInterviewModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={isOfferModalOpen}
        onClose={onCloseOfferModal}
        title="Manage Offer"
        size="lg"
      >
        {candidateForOffer && requisitionForOffer && (
          <OfferForm
            onSubmit={onSaveOffer}
            candidate={candidateForOffer}
            requisition={requisitionForOffer}
            onClose={onCloseOfferModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={isTalentPoolFormModalOpen}
        onClose={onCloseTalentPoolFormModal}
        title={editingTalentPool ? 'Edit Talent Pool' : 'New Talent Pool'}
      >
        <TalentPoolForm
          onSubmit={onSaveTalentPool}
          initialData={editingTalentPool}
          onClose={onCloseTalentPoolFormModal}
        />
      </Modal>

      <Modal
        isOpen={isAddCandidateToPoolModalOpen}
        onClose={onCloseAddCandidateToPoolModal}
        title={`Add Candidate to Pool: ${poolToAddTo?.name}`}
      >
        {poolToAddTo && (
          <CandidateForm
            onSubmit={(candidate) => onSaveCandidate(candidate, poolToAddTo.id)}
            requisitions={requisitions}
            defaultTalentPoolId={poolToAddTo.id}
            onClose={onCloseAddCandidateToPoolModal}
          />
        )}
      </Modal>

      {isCandidateAIDashboardModalOpen && dataForAIDashboard && (
        <Modal
          isOpen={isCandidateAIDashboardModalOpen}
          onClose={onCloseCandidateAIDashboardModal}
          title="Candidate AI Insights Dashboard"
          size="4xl"
        >
          <CandidateAIDashboardModal
            onClose={onCloseCandidateAIDashboardModal}
            dashboardData={dataForAIDashboard}
            onTriggerResumeAnalysis={onTriggerResumeAnalysis}
          />
        </Modal>
      )}

      <Modal
        isOpen={isLogOutreachModalOpen}
        onClose={onCloseLogOutreachModal}
        title="Log Outreach Activity"
      >
        {candidateForOutreachLog && (
          <LogOutreachForm
            candidate={candidateForOutreachLog}
            onSubmit={onSaveOutreachLog}
            onClose={onCloseLogOutreachModal}
          />
        )}
      </Modal>

      {isOutreachDraftModalOpen && candidateForOutreachDraft && (
        <OutreachDraftModal
          isOpen={isOutreachDraftModalOpen}
          onClose={onCloseOutreachDraftModal}
          candidateName={candidateForOutreachDraft.name}
          draftText={currentOutreachDraft}
          isLoading={isGeneratingOutreachDraft}
          error={outreachDraftError}
        />
      )}

      <HiringHubView
        isOpen={isHiringHubOpen}
        onClose={onCloseHiringHub}
        candidate={contextForHiringHub?.candidate || null}
        requisition={contextForHiringHub?.requisition || null}
        interviews={interviews}
        onSaveComment={onSaveHiringHubComment}
        onGenerateAISummary={onGenerateAISummary}
        onRecordDecision={onRecordDecision}
      />
    </>
  );
};

export default AppModals;
