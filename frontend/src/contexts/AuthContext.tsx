import React, { createContext, useContext } from 'react';
import { User, UserRole } from '../types';

export interface AuthContextValue {
  loggedInUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  handleLogout: () => void;
  refreshUsers: () => Promise<void>;
  createBackendUser: (payload: { name: string; email: string; role: UserRole; password: string }) => Promise<User>;
  deleteBackendUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthContext.Provider');
  return ctx;
}

export default AuthContext;
