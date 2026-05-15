import React from 'react';
import { BarChart3 as ChartBarIcon, List as ListBulletIcon, Users as UsersIcon, ClipboardCheck as ClipboardDocumentCheckIcon, ClipboardList as ClipboardDocumentListIcon, Gift as GiftIcon, Database as DatabaseIcon, ZoomIn as MagnifyingGlassPlusIcon, Settings as Cog6ToothIcon } from 'lucide-react';
import { APP_TITLE } from '../constants';
import { UserRole } from '../types';

export type View = 'dashboard' | 'requisitions' | 'recruiter' | 'sourcerhub' | 'sourcerdashboard' | 'hmhub' | 'offerhub' | 'talentpools' | 'admin';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  userRole: UserRole;
}

const ALL_NAV_ITEMS: Array<{ id: View; label: string; icon: React.ElementType; roles: UserRole[] }> = [
    { id: 'dashboard', label: 'Main Dashboard', icon: ChartBarIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
    { id: 'requisitions', label: 'Requisitions', icon: ListBulletIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
    { id: 'sourcerhub', label: 'Sourcer Hub', icon: MagnifyingGlassPlusIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.SOURCER] },
    { id: 'sourcerdashboard', label: 'Sourcer KPIs', icon: ClipboardDocumentListIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.SOURCER] },
    { id: 'recruiter', label: 'Recruiter Hub', icon: UsersIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
    { id: 'hmhub', label: 'HM Hub', icon: ClipboardDocumentCheckIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
    { id: 'offerhub', label: 'Offer Hub', icon: GiftIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER] },
    { id: 'talentpools', label: 'Talent Pools', icon: DatabaseIcon, roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.SOURCER] },
    { id: 'admin', label: 'Admin', icon: Cog6ToothIcon, roles: [UserRole.ADMIN] },
];


const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, userRole }) => {

  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <nav className="w-72 bg-slate-900 text-slate-400 flex flex-col shrink-0 shadow-2xl z-20">
      <div className="flex items-center px-8 h-24 border-b border-slate-800/50">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
            </div>
            <span className="font-bold text-xl text-white tracking-tight font-display">{APP_TITLE}</span>
      </div>
      <div className="flex-grow overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200 ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              <span>{item.label}</span>
              {currentView === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm"></div>
              )}
            </button>
          ))}
      </div>
       <div className="p-8 border-t border-slate-800/50">
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Powered by AI</div>
                <div className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} {APP_TITLE}</div>
            </div>
        </div>
    </nav>
  );
};

export default Navigation;