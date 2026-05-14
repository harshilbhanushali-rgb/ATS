import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Card from './Card';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface UserManagementViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshUsers: () => Promise<void>;
  onCreateUser: (payload: { name: string; email: string; role: UserRole; password: string }) => Promise<User>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, setUsers: _setUsers, refreshUsers, onCreateUser, onDeleteUser }) => {
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.RECRUITER, password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setError('Name, Email, and Password are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onCreateUser(newUser);
      setNewUser({ name: '', email: '', role: UserRole.RECRUITER, password: '' });
      await refreshUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.role === UserRole.ADMIN) {
        alert("This is a protected Admin account and cannot be deleted.");
        return;
    }

    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await onDeleteUser(userId);
        await refreshUsers();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <div className="space-y-8">
      <Card className="!p-8 bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight">Add New User</h3>
        </div>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className={labelClass}>Full Name</label>
            <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className={inputClass} placeholder="John Doe" required />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>Email Address</label>
            <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className={inputClass} placeholder="user@example.com" required />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select name="role" value={newUser.role} onChange={handleInputChange} className={inputClass}>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>Password</label>
            <input type="password" name="password" value={newUser.password} onChange={handleInputChange} className={inputClass} placeholder="Set password" required />
          </div>
          <button type="submit" disabled={isSubmitting} className="h-[46px] flex items-center justify-center bg-slate-900 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-600/20 transition-all duration-300 text-sm disabled:opacity-60">
            {isSubmitting ? 'Saving...' : 'Add User'}
          </button>
        </form>
        {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
            </div>
        )}
      </Card>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">Current Users</h3>
            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{users.length} Total</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{user.name}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">{user.email}</td>
                  <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          user.role === UserRole.RECRUITER ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                          {user.role}
                      </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200" 
                        aria-label={`Delete ${user.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;
