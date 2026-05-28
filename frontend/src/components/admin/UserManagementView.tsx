import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import Card from '../Card';
import { Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';

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

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <div className="space-y-8">
      <Card className="!p-8 border-dashed border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm shadow-blue-200">
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
          <button type="submit" disabled={isSubmitting} className="h-[46px] flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-60">
            {isSubmitting ? 'Saving...' : 'Add User'}
          </button>
        </form>
        {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
            </div>
        )}
      </Card>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-display">Current Users</h3>
            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{users.length} Total</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xs">
                              {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{user.name}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === UserRole.RECRUITER ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                          {user.role}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        aria-label={`Delete ${user.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
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
