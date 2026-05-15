import React from 'react';
import Navigation, { View } from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import RequisitionList from '../components/RequisitionList';
import { RecruiterView } from '../components/RecruiterView';
import SourcerHubView from '../components/SourcerHubView';
import HiringManagerView from '../components/HiringManagerView';
import OfferHubView from '../components/OfferHubView';
import TalentPoolListView from '../components/TalentPoolListView';
import AdminView from '../components/AdminView';
import { Plus as PlusIcon } from 'lucide-react';
import { UserRole } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { useModalState } from '../contexts/ModalStateContext';

interface AppShellProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const AppShell: React.FC<AppShellProps> = ({ currentView, onNavigate }) => {
  const { loggedInUser, handleLogout } = useAuthContext();
  const { openRequisitionModal } = useModalState();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <Navigation currentView={currentView} onNavigate={onNavigate} userRole={loggedInUser.role} />

      <main id="main-content" className="flex-1 overflow-y-auto relative custom-scrollbar">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-20 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
                {({
                  dashboard: 'Main Dashboard',
                  requisitions: 'Requisitions',
                  recruiter: 'Recruiter Hub',
                  sourcerhub: 'Sourcer Hub',
                  hmhub: 'HM Hub',
                  offerhub: 'Offer Hub',
                  talentpools: 'Talent Pools',
                  admin: 'Administration',
                } as Record<string, string>)[currentView] ?? currentView}
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Welcome back, {loggedInUser.name}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-inner-soft">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs mr-3 shadow-lg shadow-indigo-500/20">
                  {loggedInUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">{loggedInUser.name}</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">
                    {loggedInUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'requisitions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Requisitions</h2>
                {loggedInUser.role !== UserRole.HIRING_MANAGER && (
                  <button
                    onClick={() => openRequisitionModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" /> New Requisition
                  </button>
                )}
              </div>
              <RequisitionList />
            </div>
          )}
          {currentView === 'recruiter' && <RecruiterView />}
          {currentView === 'sourcerhub' && <SourcerHubView />}
          {currentView === 'hmhub' && <HiringManagerView />}
          {currentView === 'offerhub' && <OfferHubView />}
          {currentView === 'talentpools' && <TalentPoolListView />}
          {currentView === 'admin' && <AdminView />}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
