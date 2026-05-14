import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppModals from './app/AppModals';
import AppShell from './app/AppShell';
import AuthGate from './app/AuthGate';
import { useAiMatches } from './hooks/useAiMatches';
import { useAuth } from './hooks/useAuth';
import { useCandidates } from './hooks/useCandidates';
import { useHiringHub } from './hooks/useHiringHub';
import { useInterviews } from './hooks/useInterviews';
import { useOffers } from './hooks/useOffers';
import { useOutreachDraft } from './hooks/useOutreachDraft';
import { useOutreachLogs } from './hooks/useOutreachLogs';
import { useRequisitions } from './hooks/useRequisitions';
import { useScorecards } from './hooks/useScorecards';
import { useTalentPools } from './hooks/useTalentPools';
import { View } from './components/Navigation';
import { CandidateAIDashboardData } from './types';
import { getPathForView, getViewForPath } from './utils/viewUtils';

const App: React.FC = () => {
  const [contextForAIDashboard, setContextForAIDashboard] = useState<CandidateAIDashboardData | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const currentView = useMemo(() => getViewForPath(location.pathname), [location.pathname]);

  const navigateToView = useCallback(
    (view: View) => {
      navigate(getPathForView(view));
    },
    [navigate]
  );

  const { loggedInUser, users, setUsers, handleLogin, handleLogout, refreshUsers, createBackendUser, deleteBackendUser } = useAuth({
    onViewChange: navigateToView,
  });

  const getCurrentUserId = useCallback(() => loggedInUser?.id || 'system', [loggedInUser]);
  const getCurrentUserName = useCallback(() => loggedInUser?.name || 'System', [loggedInUser]);

  const { requisitions, isRequisitionModalOpen, editingRequisition, openRequisitionModal, closeRequisitionModal, saveRequisition, refetchWithFilters } =
    useRequisitions({ getCurrentUserId });

  const {
    candidates,
    setCandidates,
    isCandidateModalOpen,
    editingCandidate,
    defaultRequisitionIdForCandidate,
    defaultTalentPoolIdForCandidate,
    openCandidateModal,
    closeCandidateModal,
    saveCandidate,
    updateCandidateStage,
    saveCandidateAnalysis,
    removeCandidateFromPool,
    moveCandidateToRequisition,
  } = useCandidates({ loggedInUser, getCurrentUserId });

  const {
    interviews,
    isInterviewModalOpen,
    candidateForInterview,
    requisitionForInterview,
    openInterviewModal,
    closeInterviewModal,
    saveInterview,
  } = useInterviews();

  const {
    talentPools,
    isTalentPoolFormModalOpen,
    editingTalentPool,
    isAddCandidateToPoolModalOpen,
    poolToAddTo,
    openTalentPoolFormModal,
    closeTalentPoolFormModal,
    saveTalentPool,
    openAddCandidateToPoolModal,
    closeAddCandidateToPoolModal,
  } = useTalentPools();

  const { candidateOutreachLogs, isLogOutreachModalOpen, candidateForOutreachLog, openLogOutreachModal, closeLogOutreachModal, saveOutreachLog } =
    useOutreachLogs({ getCurrentUserId });

  const { scorecardTemplates, saveScorecardTemplate, setScorecardTemplates } = useScorecards();

  const {
    isOfferModalOpen,
    candidateForOffer,
    requisitionForOffer,
    openOfferModal,
    closeOfferModal,
    saveOffer,
    offerAccepted,
    offerDeclined,
  } = useOffers({ updateCandidateStage, setCandidates });

  const { aiMatchedCandidates, isLoadingAiMatches, currentRequisitionForAIMatches, findAiCandidateMatches, assignCandidateFromAIPool } =
    useAiMatches({ candidates, onAssignCandidateFromAIPool: moveCandidateToRequisition });

  const { isOutreachDraftModalOpen, candidateForOutreachDraft, currentOutreachDraft, isGeneratingOutreachDraft, outreachDraftError, openOutreachDraftModal, closeOutreachDraftModal } =
    useOutreachDraft();

  const {
    isHiringHubOpen,
    contextForHiringHub,
    openHiringHub,
    closeHiringHub,
    saveHiringHubComment,
    generateAIDebriefSummary,
    recordFinalDecision,
  } = useHiringHub({
    setCandidates,
    getCurrentUserId,
    getCurrentUserName,
    updateCandidateStage,
  });

  const dataForAIDashboard = useMemo(() => {
    if (!contextForAIDashboard) return null;
    const candidate = candidates.find((item) => item.id === contextForAIDashboard.candidate.id);
    const requisition = requisitions.find((item) => item.id === contextForAIDashboard.requisition.id);
    if (!candidate || !requisition) return null;
    return { candidate, requisition };
  }, [candidates, contextForAIDashboard, requisitions]);

  const handleOpenCandidateAIDashboardModal = useCallback((data: CandidateAIDashboardData) => {
    setContextForAIDashboard(data);
  }, []);

  const handleCloseCandidateAIDashboardModal = useCallback(() => {
    setContextForAIDashboard(null);
  }, []);

  const handleClearData = useCallback(() => {
    setCandidates([]);
    setScorecardTemplates([]);
    setUsers([]);
    navigateToView('dashboard');
    setContextForAIDashboard(null);
    localStorage.removeItem('app_requisitions');
    localStorage.removeItem('app_candidates');
    localStorage.removeItem('app_interviews');
    localStorage.removeItem('app_talent_pools');
    localStorage.removeItem('app_candidate_outreach_logs');
    localStorage.removeItem('app_scorecard_templates');
    localStorage.removeItem('app_users');
    alert('System data has been cleared.');
  }, [navigateToView, setCandidates, setScorecardTemplates, setUsers]);

  return (
    <AuthGate
      loggedInUser={loggedInUser}
      users={users}
      onLogin={handleLogin}
    >
      {loggedInUser && (
        <>
          <AppShell
            currentView={currentView}
            loggedInUser={loggedInUser}
            users={users}
            requisitions={requisitions}
            candidates={candidates}
            interviews={interviews}
            talentPools={talentPools}
            candidateOutreachLogs={candidateOutreachLogs}
            scorecardTemplates={scorecardTemplates}
            aiMatchedCandidates={aiMatchedCandidates}
            isLoadingAiMatches={isLoadingAiMatches}
            currentRequisitionForAIMatches={currentRequisitionForAIMatches}
            onNavigate={navigateToView}
            onLogout={handleLogout}
            onOpenRequisitionModal={openRequisitionModal}
            onOpenCandidateModal={openCandidateModal}
            onSaveCandidateAnalysis={saveCandidateAnalysis}
            onOpenCandidateAIDashboardModal={handleOpenCandidateAIDashboardModal}
            onFindAiCandidateMatches={findAiCandidateMatches}
            onAssignCandidateFromAIPool={assignCandidateFromAIPool}
            onOpenLogOutreachModal={openLogOutreachModal}
            onOpenOutreachDraftModal={openOutreachDraftModal}
            onOpenHiringHub={openHiringHub}
            onOpenInterviewModal={openInterviewModal}
            onOpenOfferModal={openOfferModal}
            onOfferAccepted={offerAccepted}
            onOfferDeclined={offerDeclined}
            onOpenTalentPoolFormModal={openTalentPoolFormModal}
            onOpenAddCandidateToPoolModal={openAddCandidateToPoolModal}
            onRemoveCandidateFromPool={removeCandidateFromPool}
            onMoveCandidateToRequisition={moveCandidateToRequisition}
            onRefetchRequisitions={refetchWithFilters}
            setUsers={setUsers}
            onSaveTemplate={saveScorecardTemplate}
            onClearData={handleClearData}
            refreshUsers={refreshUsers}
            createBackendUser={createBackendUser}
            deleteBackendUser={deleteBackendUser}
          />

          <AppModals
            loggedInUserRole={loggedInUser.role}
            requisitions={requisitions}
            candidates={candidates}
            interviews={interviews}
            scorecardTemplates={scorecardTemplates}
            dataForAIDashboard={dataForAIDashboard}
            isRequisitionModalOpen={isRequisitionModalOpen}
            editingRequisition={editingRequisition}
            onSaveRequisition={saveRequisition}
            onCloseRequisitionModal={closeRequisitionModal}
            isCandidateModalOpen={isCandidateModalOpen}
            editingCandidate={editingCandidate}
            defaultRequisitionIdForCandidate={defaultRequisitionIdForCandidate}
            defaultTalentPoolIdForCandidate={defaultTalentPoolIdForCandidate}
            onSaveCandidate={saveCandidate}
            onCloseCandidateModal={closeCandidateModal}
            isInterviewModalOpen={isInterviewModalOpen}
            candidateForInterview={candidateForInterview}
            requisitionForInterview={requisitionForInterview}
            onSaveInterview={saveInterview}
            onCloseInterviewModal={closeInterviewModal}
            isOfferModalOpen={isOfferModalOpen}
            candidateForOffer={candidateForOffer}
            requisitionForOffer={requisitionForOffer}
            onSaveOffer={saveOffer}
            onCloseOfferModal={closeOfferModal}
            isTalentPoolFormModalOpen={isTalentPoolFormModalOpen}
            editingTalentPool={editingTalentPool}
            onSaveTalentPool={saveTalentPool}
            onCloseTalentPoolFormModal={closeTalentPoolFormModal}
            isAddCandidateToPoolModalOpen={isAddCandidateToPoolModalOpen}
            poolToAddTo={poolToAddTo}
            onCloseAddCandidateToPoolModal={closeAddCandidateToPoolModal}
            isCandidateAIDashboardModalOpen={!!dataForAIDashboard}
            onCloseCandidateAIDashboardModal={handleCloseCandidateAIDashboardModal}
            onTriggerResumeAnalysis={saveCandidateAnalysis}
            isLogOutreachModalOpen={isLogOutreachModalOpen}
            candidateForOutreachLog={candidateForOutreachLog}
            onSaveOutreachLog={saveOutreachLog}
            onCloseLogOutreachModal={closeLogOutreachModal}
            isOutreachDraftModalOpen={isOutreachDraftModalOpen}
            candidateForOutreachDraft={candidateForOutreachDraft}
            currentOutreachDraft={currentOutreachDraft}
            isGeneratingOutreachDraft={isGeneratingOutreachDraft}
            outreachDraftError={outreachDraftError}
            onCloseOutreachDraftModal={closeOutreachDraftModal}
            isHiringHubOpen={isHiringHubOpen}
            contextForHiringHub={contextForHiringHub}
            onCloseHiringHub={closeHiringHub}
            onSaveHiringHubComment={saveHiringHubComment}
            onGenerateAIDebriefSummary={generateAIDebriefSummary}
            onRecordFinalDecision={recordFinalDecision}
          />
        </>
      )}
    </AuthGate>
  );
};

export default App;
