
import React, { useState } from 'react';
import Card from '../Card';
import UserManagementView from './UserManagementView';
import AdminImportView from './AdminImportView';
import { Trash2 as TrashIcon } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

type AdminTab = 'users' | 'imports' | 'system';

const AdminView: React.FC = () => {
  const { users, setUsers, refreshUsers, createBackendUser, deleteBackendUser } = useAuthContext();
  const { clearData: onClearData } = useAppData();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabButtonClass = (tabName: AdminTab) =>
    `px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 font-display ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
    }`;

    const handleClearData = async () => {
        if (window.confirm("Are you sure you want to CLEAR ALL DATA? This action is permanent and cannot be undone.")) {
            await onClearData();
        }
    };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="!p-8">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-5 mb-6">
          <button onClick={() => setActiveTab('users')} className={tabButtonClass('users')}>
            User Management
          </button>
          <button onClick={() => setActiveTab('imports')} className={tabButtonClass('imports')}>
            Imports
          </button>
          <button onClick={() => setActiveTab('system')} className={tabButtonClass('system')}>
            System Maintenance
          </button>
        </div>

        <div className="mt-4">
            {activeTab === 'users' && (
              <UserManagementView
                users={users}
                setUsers={setUsers}
                refreshUsers={refreshUsers}
                onCreateUser={createBackendUser}
                onDeleteUser={deleteBackendUser}
              />
            )}
            {activeTab === 'imports' && <AdminImportView />}
            {activeTab === 'system' && (
                <div className="max-w-2xl mx-auto py-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-rose-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-10 h-10 text-rose-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 font-display tracking-tight mb-3">System Maintenance</h3>
                        <p className="text-slate-500">Perform critical system operations and data management tasks.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex-grow">
                                    <h4 className="text-lg font-bold text-slate-900 font-display tracking-tight mb-2">Clear All Data</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Permanently delete all candidates, requisitions, and interview logs.
                                        <span className="block mt-2 text-rose-600 font-bold text-xs uppercase tracking-wider">This action cannot be undone.</span>
                                    </p>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    className="px-6 py-3 bg-rose-600 text-white text-sm font-bold rounded-2xl hover:bg-rose-700 transition-all duration-300 shadow-lg shadow-rose-600/20 flex items-center gap-2 shrink-0"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    Clear Data
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note: Users and scorecard templates will be preserved.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default AdminView;
