import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import AppModals from './app/AppModals';
import AppShell from './app/AppShell';
import AuthGate from './app/AuthGate';
import AuthContext from './contexts/AuthContext';
import AppDataContext from './contexts/AppDataContext';
import ModalStateContext from './contexts/ModalStateContext';
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
import * as crudApi from './services/crudApi';

const App: React.FC = () => {
  const [contextForAIDashboard, setContextForAIDashboard] = useState<CandidateAIDashboardData | null>(null);
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const location = useLocation();
  const currentView = useMemo(() => getViewForPath(location.pathname), [location.pathname]);

  const navigateToView = useCallback(
    (view: View) => {
      navigate(getPathForView(view));
    },
    [navigate]
  );

  const { loggedInUser, isCheckingAuth, users, setUsers, handleLogin, handleGoogleLogin, handleLogout: authHandleLogout, refreshUsers, createBackendUser, deleteBackendUser } = useAuth({
    onViewChange: navigateToView,
  });

  const handleLogout = useCallback(() => {
    authHandleLogout();
    navigate('/');
  }, [authHandleLogout, navigate]);

  const getCurrentUserId = useCallback(() => loggedInUser?.id || 'system', [loggedInUser]);
  const getCurrentUserName = useCallback(() => loggedInUser?.name || 'System', [loggedInUser]);

  const { requisitions, isRequisitionModalOpen, editingRequisition, openRequisitionModal, closeRequisitionModal, saveRequisition, refetchWithFilters, archiveRequisition, reactivateRequisition } =
    useRequisitions({ getCurrentUserId, loggedInUserId: loggedInUser?.id });

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
    addCandidateToPool,
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
  } = useInterviews({ loggedInUserId: loggedInUser?.id });

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
  } = useTalentPools({ loggedInUserId: loggedInUser?.id });

  const { candidateOutreachLogs, isLogOutreachModalOpen, candidateForOutreachLog, openLogOutreachModal, closeLogOutreachModal, saveOutreachLog } =
    useOutreachLogs({ getCurrentUserId, loggedInUserId: loggedInUser?.id });

  const { scorecardTemplates, saveScorecardTemplate, deleteScorecardTemplate } = useScorecards({ loggedInUserId: loggedInUser?.id });

  const {
    isOfferModalOpen,
    candidateForOffer,
    requisitionForOffer,
    openOfferModal,
    closeOfferModal,
    saveOffer,
    offerAccepted,
    offerDeclined,
    confirmJoined,
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

  const handleClearData = useCallback(async () => {
    await crudApi.clearAllData();
    queryClient.clear();
    setContextForAIDashboard(null);
    navigateToView('dashboard');
    alert('System data has been cleared.');
  }, [navigateToView, queryClient]);

  const appDataValue = useMemo(() => ({
    candidates, setCandidates, requisitions, interviews, talentPools,
    candidateOutreachLogs, scorecardTemplates, aiMatchedCandidates,
    isLoadingAiMatches, currentRequisitionForAIMatches,
    saveCandidate, updateCandidateStage, saveCandidateAnalysis,
    removeCandidateFromPool, addCandidateToPool, moveCandidateToRequisition,
    saveRequisition, refetchWithFilters, saveInterview,
    saveTalentPool, saveScorecardTemplate, deleteScorecardTemplate, saveOutreachLog,
    saveOffer, offerAccepted, offerDeclined, confirmJoined,
    findAiCandidateMatches, assignCandidateFromAIPool,
    saveHiringHubComment, generateAIDebriefSummary, recordFinalDecision,
    archiveRequisition,
    reactivateRequisition,
    clearData: handleClearData,
  }), [
    candidates, setCandidates, requisitions, interviews, talentPools,
    candidateOutreachLogs, scorecardTemplates, aiMatchedCandidates,
    isLoadingAiMatches, currentRequisitionForAIMatches,
    saveCandidate, updateCandidateStage, saveCandidateAnalysis,
    removeCandidateFromPool, addCandidateToPool, moveCandidateToRequisition,
    saveRequisition, refetchWithFilters, saveInterview,
    saveTalentPool, saveScorecardTemplate, deleteScorecardTemplate, saveOutreachLog,
    saveOffer, offerAccepted, offerDeclined, confirmJoined,
    findAiCandidateMatches, assignCandidateFromAIPool,
    saveHiringHubComment, generateAIDebriefSummary, recordFinalDecision,
    archiveRequisition, reactivateRequisition, handleClearData,
  ]);

  const modalStateValue = useMemo(() => ({
    isRequisitionModalOpen, editingRequisition, openRequisitionModal, closeRequisitionModal,
    isCandidateModalOpen, editingCandidate, defaultRequisitionIdForCandidate,
    defaultTalentPoolIdForCandidate, openCandidateModal, closeCandidateModal,
    isInterviewModalOpen, candidateForInterview, requisitionForInterview,
    openInterviewModal, closeInterviewModal,
    isOfferModalOpen, candidateForOffer, requisitionForOffer, openOfferModal, closeOfferModal,
    isTalentPoolFormModalOpen, editingTalentPool, openTalentPoolFormModal, closeTalentPoolFormModal,
    isAddCandidateToPoolModalOpen, poolToAddTo, openAddCandidateToPoolModal, closeAddCandidateToPoolModal,
    isLogOutreachModalOpen, candidateForOutreachLog, openLogOutreachModal, closeLogOutreachModal,
    isOutreachDraftModalOpen, candidateForOutreachDraft, currentOutreachDraft,
    isGeneratingOutreachDraft, outreachDraftError, openOutreachDraftModal, closeOutreachDraftModal,
    isHiringHubOpen, contextForHiringHub, openHiringHub, closeHiringHub,
    isCandidateAIDashboardModalOpen: !!dataForAIDashboard,
    dataForAIDashboard,
    openCandidateAIDashboardModal: handleOpenCandidateAIDashboardModal,
    closeCandidateAIDashboardModal: handleCloseCandidateAIDashboardModal,
  }), [
    isRequisitionModalOpen, editingRequisition, openRequisitionModal, closeRequisitionModal,
    isCandidateModalOpen, editingCandidate, defaultRequisitionIdForCandidate,
    defaultTalentPoolIdForCandidate, openCandidateModal, closeCandidateModal,
    isInterviewModalOpen, candidateForInterview, requisitionForInterview,
    openInterviewModal, closeInterviewModal,
    isOfferModalOpen, candidateForOffer, requisitionForOffer, openOfferModal, closeOfferModal,
    isTalentPoolFormModalOpen, editingTalentPool, openTalentPoolFormModal, closeTalentPoolFormModal,
    isAddCandidateToPoolModalOpen, poolToAddTo, openAddCandidateToPoolModal, closeAddCandidateToPoolModal,
    isLogOutreachModalOpen, candidateForOutreachLog, openLogOutreachModal, closeLogOutreachModal,
    isOutreachDraftModalOpen, candidateForOutreachDraft, currentOutreachDraft,
    isGeneratingOutreachDraft, outreachDraftError, openOutreachDraftModal, closeOutreachDraftModal,
    isHiringHubOpen, contextForHiringHub, openHiringHub, closeHiringHub,
    dataForAIDashboard, handleOpenCandidateAIDashboardModal, handleCloseCandidateAIDashboardModal,
  ]);

  return (
    <AuthGate
      loggedInUser={loggedInUser}
      isCheckingAuth={isCheckingAuth}
      users={users}
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
    >
      {loggedInUser && (
        <AuthContext.Provider value={{ loggedInUser, users, setUsers, handleLogout, refreshUsers, createBackendUser, deleteBackendUser }}>
          <AppDataContext.Provider value={appDataValue}>
            <ModalStateContext.Provider value={modalStateValue}>
              <AppShell currentView={currentView} onNavigate={navigateToView} />
              <AppModals />
            </ModalStateContext.Provider>
          </AppDataContext.Provider>
        </AuthContext.Provider>
      )}
    </AuthGate>
  );
};

export default App;
