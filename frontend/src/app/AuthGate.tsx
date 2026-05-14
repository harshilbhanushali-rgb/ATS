import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { User } from '../types';

interface AuthGateProps {
  loggedInUser: User | null;
  users: User[];
  onLogin: (email: string, password: string) => Promise<boolean>;
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({
  loggedInUser,
  users,
  onLogin,
  children,
}) => {
  if (!loggedInUser) {
    return <LoginScreen onLogin={onLogin} users={users} />;
  }

  return <>{children}</>;
};

export default AuthGate;
