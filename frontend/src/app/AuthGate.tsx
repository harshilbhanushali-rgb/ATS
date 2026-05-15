import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { User } from '../types';

interface AuthGateProps {
  loggedInUser: User | null;
  isCheckingAuth: boolean;
  users: User[];
  onLogin: (email: string, password: string) => Promise<boolean>;
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({
  loggedInUser,
  isCheckingAuth,
  users,
  onLogin,
  children,
}) => {
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400 text-base">Loading...</div>
      </div>
    );
  }

  if (!loggedInUser) {
    return <LoginScreen onLogin={onLogin} users={users} />;
  }

  return <>{children}</>;
};

export default AuthGate;
