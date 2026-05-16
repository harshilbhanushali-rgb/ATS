import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Navigation, { View } from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import RequisitionList from '../components/RequisitionList';
import { RecruiterView } from '../components/RecruiterView';
import SourcerHubView from '../components/SourcerHubView';
import HiringManagerView from '../components/HiringManagerView';
import OfferHubView from '../components/OfferHubView';
import TalentPoolListView from '../components/TalentPoolListView';
import AdminView from '../components/AdminView';
import { PageTransition } from '../components/ui/PageTransition';
import { Plus as PlusIcon, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { useModalState } from '../contexts/ModalStateContext';
import HelpDrawer from '../components/HelpDrawer';

interface AppShellProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Main Dashboard',
  requisitions: 'Requisitions',
  recruiter: 'Recruiter Hub',
  sourcerhub: 'Sourcer Hub',
  hmhub: 'HM Hub',
  offerhub: 'Offer Hub',
  talentpools: 'Talent Pools',
  admin: 'Administration',
};

const AppShell: React.FC<AppShellProps> = ({ currentView, onNavigate }) => {
  const { loggedInUser, handleLogout } = useAuthContext();
  const { openRequisitionModal } = useModalState();
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F0F4FF] font-sans overflow-hidden">
      {/* Subtle background mesh */}
      <div className="page-mesh" aria-hidden="true" />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>

      <Navigation currentView={currentView} onNavigate={onNavigate} userRole={loggedInUser.role} />

      <main id="main-content" className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        {/* Sticky header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                {VIEW_TITLES[currentView] ?? currentView}
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5 hidden sm:block">
                Welcome back, {loggedInUser.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentView === 'requisitions' && loggedInUser.role !== UserRole.HIRING_MANAGER && (
                <motion.button
                  onClick={() => openRequisitionModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors"
                  whileTap={{ scale: 0.96 }}
                >
                  <PlusIcon className="w-4 h-4 mr-1.5" /> New Requisition
                </motion.button>
              )}

              {/* Help button */}
              <motion.button
                onClick={() => setIsHelpOpen(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 border border-slate-200 bg-white transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label="Open user guide"
              >
                <HelpCircle className="w-4 h-4" />
              </motion.button>

              {/* User chip */}
              <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {loggedInUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-none">{loggedInUser.name}</span>
                  <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mt-0.5">
                    {loggedInUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <motion.button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-200 transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </motion.button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard'    && <PageTransition motionKey="dashboard"><Dashboard /></PageTransition>}
            {currentView === 'requisitions' && <PageTransition motionKey="requisitions"><RequisitionList /></PageTransition>}
            {currentView === 'recruiter'    && <PageTransition motionKey="recruiter"><RecruiterView /></PageTransition>}
            {currentView === 'sourcerhub'   && <PageTransition motionKey="sourcerhub"><SourcerHubView /></PageTransition>}
            {currentView === 'hmhub'        && <PageTransition motionKey="hmhub"><HiringManagerView /></PageTransition>}
            {currentView === 'offerhub'     && <PageTransition motionKey="offerhub"><OfferHubView /></PageTransition>}
            {currentView === 'talentpools'  && <PageTransition motionKey="talentpools"><TalentPoolListView /></PageTransition>}
            {currentView === 'admin'        && <PageTransition motionKey="admin"><AdminView /></PageTransition>}
          </AnimatePresence>
        </div>
      </main>

      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default AppShell;
