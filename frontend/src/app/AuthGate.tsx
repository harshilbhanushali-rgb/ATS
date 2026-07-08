import React from 'react';
import { motion } from 'framer-motion';
import LoginScreen from '../components/LoginScreen';
import { User } from '../types';

interface AuthGateProps {
  loggedInUser: User | null;
  isCheckingAuth: boolean;
  users: User[];
  onLogin: (email: string, password: string) => Promise<boolean>;
  onGoogleLogin: (credential: string) => Promise<boolean>;
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({
  loggedInUser,
  isCheckingAuth,
  users,
  onLogin,
  onGoogleLogin,
  children,
}) => {
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F8FF]">
        <div className="flex flex-col items-center gap-3">
          <motion.span
            className="block w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return <LoginScreen onLogin={onLogin} onGoogleLogin={onGoogleLogin} users={users} />;
  }

  return <>{children}</>;
};

export default AuthGate;
