import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 as ChartBarIcon, List as ListBulletIcon, Users as UsersIcon, ClipboardCheck as ClipboardDocumentCheckIcon, Gift as GiftIcon, Database as DatabaseIcon, ZoomIn as MagnifyingGlassPlusIcon, Settings as Cog6ToothIcon } from 'lucide-react';
import { APP_TITLE } from '../constants';
import { UserRole } from '../types';

export type View = 'dashboard' | 'requisitions' | 'recruiter' | 'sourcerhub' | 'hmhub' | 'offerhub' | 'talentpools' | 'admin';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const ALL_NAV_ITEMS: Array<{ id: View; label: string; icon: React.ElementType; roles: UserRole[] }> = [
  { id: 'dashboard',    label: 'Main Dashboard', icon: ChartBarIcon,                  roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
  { id: 'requisitions', label: 'Requisitions',   icon: ListBulletIcon,                roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
  { id: 'sourcerhub',   label: 'Sourcer Hub',    icon: MagnifyingGlassPlusIcon,       roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.SOURCER] },
  { id: 'recruiter',    label: 'Recruiter Hub',  icon: UsersIcon,                     roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
  { id: 'hmhub',        label: 'HM Hub',         icon: ClipboardDocumentCheckIcon,    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { id: 'offerhub',     label: 'Offer Hub',      icon: GiftIcon,                      roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
  { id: 'talentpools',  label: 'Talent Pools',   icon: DatabaseIcon,                  roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.SOURCER] },
  { id: 'admin',        label: 'Admin',           icon: Cog6ToothIcon,                roles: [UserRole.ADMIN] },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, userRole }) => {
  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <nav className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-20">
      {/* Logo */}
      <div className="flex items-center px-6 h-16 border-b border-slate-100">
        <div className="bg-blue-600 p-2 rounded-xl shadow-sm mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-white" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight font-display">{APP_TITLE}</span>
      </div>

      {/* Nav items */}
      <motion.div
        className="flex-grow overflow-y-auto px-3 py-5 space-y-0.5 custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <motion.div key={item.id} variants={itemVariants} className="relative">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-blue-50 rounded-xl border border-blue-100"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={`relative w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 group z-10
                  ${isActive ? 'text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <item.icon className={`w-4.5 h-4.5 mr-3 flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} style={{ width: 18, height: 18 }} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
          <div className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-0.5">Powered by AI</div>
          <div className="text-[11px] font-medium text-slate-400">© {new Date().getFullYear()} {APP_TITLE}</div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
