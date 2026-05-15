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
import { useAppData } from '../contexts/AppDataContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useModalState } from '../contexts/ModalStateContext';

const AppModals: React.FC = () => {
  const { loggedInUser } = useAuthContext();
  const {
    requisitions, interviews, scorecardTemplates,
    saveCandidate, saveRequisition, saveInterview, saveTalentPool, saveOffer,
    saveOutreachLog, saveCandidateAnalysis,
    saveHiringHubComment, generateAIDebriefSummary, recordFinalDecision,
  } = useAppData();
  const {
    isRequisitionModalOpen, editingRequisition, closeRequisitionModal,
    isCandidateModalOpen, editingCandidate, defaultRequisitionIdForCandidate,
    defaultTalentPoolIdForCandidate, closeCandidateModal,
    isInterviewModalOpen, candidateForInterview, requisitionForInterview, closeInterviewModal,
    isOfferModalOpen, candidateForOffer, requisitionForOffer, closeOfferModal,
    isTalentPoolFormModalOpen, editingTalentPool, closeTalentPoolFormModal,
    isAddCandidateToPoolModalOpen, poolToAddTo, closeAddCandidateToPoolModal,
    isCandidateAIDashboardModalOpen, dataForAIDashboard, closeCandidateAIDashboardModal,
    isLogOutreachModalOpen, candidateForOutreachLog, closeLogOutreachModal,
    isOutreachDraftModalOpen, candidateForOutreachDraft, currentOutreachDraft,
    isGeneratingOutreachDraft, outreachDraftError, closeOutreachDraftModal,
    isHiringHubOpen, contextForHiringHub, closeHiringHub,
  } = useModalState();

  return (
    <>
      <Modal isOpen={isRequisitionModalOpen} onClose={closeRequisitionModal} title={editingRequisition ? 'Edit Requisition' : 'New Requisition'} size="4xl">
        <RequisitionForm onSubmit={saveRequisition} initialData={editingRequisition} onClose={closeRequisitionModal} currentUserRole={loggedInUser.role} />
      </Modal>

      <Modal isOpen={isCandidateModalOpen} onClose={closeCandidateModal} title={editingCandidate ? 'Edit Candidate' : 'Add Candidate'}>
        <CandidateForm onSubmit={saveCandidate} initialData={editingCandidate} requisitions={requisitions} defaultRequisitionId={defaultRequisitionIdForCandidate} defaultTalentPoolId={defaultTalentPoolIdForCandidate} onClose={closeCandidateModal} />
      </Modal>

      <Modal isOpen={isInterviewModalOpen} onClose={closeInterviewModal} title="Log Interview Feedback" size="2xl">
        {candidateForInterview && requisitionForInterview && (
          <InterviewForm onSubmit={saveInterview} candidate={candidateForInterview} requisition={requisitionForInterview} existingInterviews={interviews} scorecardTemplates={scorecardTemplates} onClose={closeInterviewModal} />
        )}
      </Modal>

      <Modal isOpen={isOfferModalOpen} onClose={closeOfferModal} title="Manage Offer" size="lg">
        {candidateForOffer && requisitionForOffer && (
          <OfferForm onSubmit={saveOffer} candidate={candidateForOffer} requisition={requisitionForOffer} onClose={closeOfferModal} />
        )}
      </Modal>

      <Modal isOpen={isTalentPoolFormModalOpen} onClose={closeTalentPoolFormModal} title={editingTalentPool ? 'Edit Talent Pool' : 'New Talent Pool'}>
        <TalentPoolForm onSubmit={saveTalentPool} initialData={editingTalentPool} onClose={closeTalentPoolFormModal} />
      </Modal>

      <Modal isOpen={isAddCandidateToPoolModalOpen} onClose={closeAddCandidateToPoolModal} title={`Add Candidate to Pool: ${poolToAddTo?.name}`}>
        {poolToAddTo && (
          <CandidateForm onSubmit={(candidate) => saveCandidate(candidate, poolToAddTo.id)} requisitions={requisitions} defaultTalentPoolId={poolToAddTo.id} onClose={closeAddCandidateToPoolModal} />
        )}
      </Modal>

      {isCandidateAIDashboardModalOpen && dataForAIDashboard && (
        <Modal isOpen={isCandidateAIDashboardModalOpen} onClose={closeCandidateAIDashboardModal} title="Candidate AI Insights Dashboard" size="4xl">
          <CandidateAIDashboardModal onClose={closeCandidateAIDashboardModal} dashboardData={dataForAIDashboard} onTriggerResumeAnalysis={saveCandidateAnalysis} />
        </Modal>
      )}

      <Modal isOpen={isLogOutreachModalOpen} onClose={closeLogOutreachModal} title="Log Outreach Activity">
        {candidateForOutreachLog && (
          <LogOutreachForm candidate={candidateForOutreachLog} onSubmit={saveOutreachLog} onClose={closeLogOutreachModal} />
        )}
      </Modal>

      {isOutreachDraftModalOpen && candidateForOutreachDraft && (
        <OutreachDraftModal isOpen={isOutreachDraftModalOpen} onClose={closeOutreachDraftModal} candidateName={candidateForOutreachDraft.name} draftText={currentOutreachDraft} isLoading={isGeneratingOutreachDraft} error={outreachDraftError} />
      )}

      <HiringHubView isOpen={isHiringHubOpen} onClose={closeHiringHub} candidate={contextForHiringHub?.candidate || null} requisition={contextForHiringHub?.requisition || null} interviews={interviews} onSaveComment={saveHiringHubComment} onGenerateAISummary={generateAIDebriefSummary} onRecordDecision={recordFinalDecision} />
    </>
  );
};

export default AppModals;
