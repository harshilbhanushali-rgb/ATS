import React from 'react';
import Navigation, { View } from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import RequisitionList from '../components/RequisitionList';
import { RecruiterView } from '../components/RecruiterView';
import SourcerHubView from '../components/SourcerHubView';
import SourcerDashboardView from '../components/SourcerDashboardView';
import HiringManagerView from '../components/HiringManagerView';
import OfferHubView from '../components/OfferHubView';
import TalentPoolListView from '../components/TalentPoolListView';
import AdminView from '../components/AdminView';
import PlusIcon from '../components/icons/PlusIcon';
import {
  AIRecommendedCandidate,
  Candidate,
  CandidateAIDashboardData,
  CandidateOutreachLog,
  Interview,
  InterviewScorecardTemplate,
  Requisition,
  ResumeMatchAnalysis,
  TalentPool,
  User,
  UserRole,
} from '../types';

interface AppShellProps {
  currentView: View;
  loggedInUser: User;
  users: User[];
  requisitions: Requisition[];
  candidates: Candidate[];
  interviews: Interview[];
  talentPools: TalentPool[];
  candidateOutreachLogs: CandidateOutreachLog[];
  scorecardTemplates: InterviewScorecardTemplate[];
  aiMatchedCandidates: AIRecommendedCandidate[] | null;
  isLoadingAiMatches: boolean;
  currentRequisitionForAIMatches: Requisition | null;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onOpenRequisitionModal: (requisition?: Requisition) => void;
  onOpenCandidateModal: (
    candidate?: Candidate,
    requisitionId?: string,
    talentPoolId?: string
  ) => void;
  onSaveCandidateAnalysis: (
    candidateId: string,
    analysis: ResumeMatchAnalysis | null
  ) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onFindAiCandidateMatches: (requisition: Requisition) => void;
  onAssignCandidateFromAIPool: (candidateId: string, requisitionId: string) => void;
  onOpenLogOutreachModal: (candidate: Candidate) => void;
  onOpenOutreachDraftModal: (candidate: Candidate, requisition: Requisition) => void;
  onOpenHiringHub: (candidate: Candidate, requisition: Requisition) => void;
  onOpenInterviewModal: (candidate: Candidate, requisition: Requisition) => void;
  onOpenOfferModal: (candidate: Candidate, requisition: Requisition) => void;
  onOfferAccepted: (candidateId: string) => void;
  onOfferDeclined: (candidateId: string) => void;
  onOpenTalentPoolFormModal: (pool?: TalentPool) => void;
  onOpenAddCandidateToPoolModal: (pool: TalentPool) => void;
  onRemoveCandidateFromPool: (candidateId: string, poolId: string) => void;
  onMoveCandidateToRequisition: (
    candidateId: string,
    newRequisitionId: string,
    talentPoolIdToRemoveFrom?: string
  ) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshUsers: () => Promise<void>;
  createBackendUser: (payload: { name: string; email: string; role: UserRole; password: string }) => Promise<User>;
  deleteBackendUser: (userId: string) => Promise<void>;
  onSaveTemplate: (template: InterviewScorecardTemplate) => void;
  onClearData: () => void;
  onRefetchRequisitions: (params: import('../services/crudApi').RequisitionFilterParams) => void;
}

const AppShell: React.FC<AppShellProps> = ({
  currentView,
  loggedInUser,
  users,
  requisitions,
  candidates,
  interviews,
  talentPools,
  candidateOutreachLogs,
  scorecardTemplates,
  aiMatchedCandidates,
  isLoadingAiMatches,
  currentRequisitionForAIMatches,
  onNavigate,
  onLogout,
  onOpenRequisitionModal,
  onOpenCandidateModal,
  onSaveCandidateAnalysis,
  onOpenCandidateAIDashboardModal,
  onFindAiCandidateMatches,
  onAssignCandidateFromAIPool,
  onOpenLogOutreachModal,
  onOpenOutreachDraftModal,
  onOpenHiringHub,
  onOpenInterviewModal,
  onOpenOfferModal,
  onOfferAccepted,
  onOfferDeclined,
  onOpenTalentPoolFormModal,
  onOpenAddCandidateToPoolModal,
  onRemoveCandidateFromPool,
  onMoveCandidateToRequisition,
  setUsers,
  refreshUsers,
  createBackendUser,
  deleteBackendUser,
  onSaveTemplate,
  onClearData,
  onRefetchRequisitions,
}) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Navigation
        currentView={currentView}
        onNavigate={onNavigate}
        userRole={loggedInUser.role}
      />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-20 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
                {currentView
                  .charAt(0)
                  .toUpperCase() +
                  currentView
                    .slice(1)
                    .replace('hub', ' Hub')
                    .replace('dashboard', ' Dashboard')
                    .replace('requisitions', 'Requisitions')
                    .replace('recruiter', 'Recruiter Hub')
                    .replace('sourcer', 'Sourcer ')
                    .replace('hm', 'HM ')
                    .replace('offer', 'Offer ')
                    .replace('talentpools', 'Talent Pools')
                    .replace('admin', 'Administration')}
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Welcome back, {loggedInUser.name}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-inner-soft">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs mr-3 shadow-lg shadow-indigo-500/20">
                  {loggedInUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">
                    {loggedInUser.name}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">
                    {loggedInUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentView === 'dashboard' && (
            <Dashboard
              requisitions={requisitions}
              allCandidates={candidates}
              allInterviews={interviews}
            />
          )}
          {currentView === 'requisitions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Requisitions</h2>
                {loggedInUser.role !== UserRole.HIRING_MANAGER && (
                  <button
                    onClick={() => onOpenRequisitionModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" /> New Requisition
                  </button>
                )}
              </div>
              <RequisitionList
                requisitions={requisitions}
                onEdit={onOpenRequisitionModal}
                onFilterChange={onRefetchRequisitions}
              />
            </div>
          )}
          {currentView === 'recruiter' && (
            <RecruiterView
              requisitions={requisitions}
              allCandidates={candidates}
              onOpenCandidateModal={onOpenCandidateModal}
              onSaveCandidateAnalysis={onSaveCandidateAnalysis}
              onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
              aiMatchedCandidates={aiMatchedCandidates}
              isLoadingAiMatches={isLoadingAiMatches}
              currentRequisitionForAIMatches={currentRequisitionForAIMatches}
              onFindAiCandidateMatches={onFindAiCandidateMatches}
              onAssignCandidateFromAIPool={onAssignCandidateFromAIPool}
              onOpenLogOutreachModal={onOpenLogOutreachModal}
              onOpenOutreachDraftModal={onOpenOutreachDraftModal}
              onOpenHiringHub={onOpenHiringHub}
            />
          )}
          {currentView === 'sourcerhub' && (
            <SourcerHubView
              currentUserRole={loggedInUser.role}
              requisitions={requisitions}
              allCandidates={candidates}
              talentPools={talentPools}
              onOpenCandidateModal={onOpenCandidateModal}
              onOpenTalentPoolFormModal={onOpenTalentPoolFormModal}
              onOpenAddCandidateToPoolModal={onOpenAddCandidateToPoolModal}
              onRemoveCandidateFromPool={onRemoveCandidateFromPool}
              onMoveCandidateToRequisition={onMoveCandidateToRequisition}
              onOpenLogOutreachModal={onOpenLogOutreachModal}
              aiMatchedCandidates={aiMatchedCandidates}
              isLoadingAiMatches={isLoadingAiMatches}
              currentRequisitionForAIMatches={currentRequisitionForAIMatches}
              onFindAiCandidateMatches={onFindAiCandidateMatches}
              onAssignCandidateFromAIPool={onAssignCandidateFromAIPool}
              onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
              onOpenOutreachDraftModal={onOpenOutreachDraftModal}
            />
          )}
          {currentView === 'sourcerdashboard' && (
            <SourcerDashboardView
              allCandidates={candidates}
              candidateOutreachLogs={candidateOutreachLogs}
              allInterviews={interviews}
              sourcerId={loggedInUser.id}
              allRequisitions={requisitions}
            />
          )}
          {currentView === 'hmhub' && (
            <HiringManagerView
              allRequisitions={requisitions}
              allCandidates={candidates}
              allInterviews={interviews}
              onOpenInterviewModal={onOpenInterviewModal}
              onOpenOfferModal={onOpenOfferModal}
              onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
              onOpenOutreachDraftModal={onOpenOutreachDraftModal}
              onOpenHiringHub={onOpenHiringHub}
            />
          )}
          {currentView === 'offerhub' && (
            <OfferHubView
              allCandidates={candidates}
              allRequisitions={requisitions}
              onOfferAccepted={onOfferAccepted}
              onOfferDeclined={onOfferDeclined}
              onEditOffer={onOpenOfferModal}
            />
          )}
          {currentView === 'talentpools' && (
            <TalentPoolListView
              talentPools={talentPools}
              allCandidates={candidates}
              onOpenTalentPoolFormModal={onOpenTalentPoolFormModal}
              onOpenManageCandidatesModal={() => onNavigate('sourcerhub')}
            />
          )}
          {currentView === 'admin' && (
            <AdminView
              users={users}
              setUsers={setUsers}
              refreshUsers={refreshUsers}
              createBackendUser={createBackendUser}
              deleteBackendUser={deleteBackendUser}
              templates={scorecardTemplates}
              onSaveTemplate={onSaveTemplate}
              onClearData={onClearData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
