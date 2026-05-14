import { useCallback, useEffect, useRef, useState } from 'react';
import { User, UserRole } from '../types';
import { getViewForRole } from '../utils/viewUtils';
import { View } from '../components/Navigation';
import { createUser, fetchCurrentUser, fetchUsers, login, logout, deleteUser as apiDeleteUser } from '../services/authApi';

interface UseAuthOptions {
  onViewChange?: (view: View) => void;
}

export const useAuth = ({ onViewChange }: UseAuthOptions = {}) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    return null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const onViewChangeRef = useRef(onViewChange);

  useEffect(() => {
    onViewChangeRef.current = onViewChange;
  }, [onViewChange]);

  useEffect(() => {
    void fetchCurrentUser().then((user) => {
      if (user) {
        setLoggedInUser(user);
        onViewChangeRef.current?.(getViewForRole(user.role));
        if (user.role === UserRole.ADMIN) {
          void fetchUsers().then(setUsers).catch(() => setUsers([]));
        }
      }
    });
  }, []);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await login({ email, password });
      setLoggedInUser(user);
      onViewChangeRef.current?.(getViewForRole(user.role));
      if (user.role === UserRole.ADMIN) {
        const adminUsers = await fetchUsers();
        setUsers(adminUsers);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    void logout();
    setLoggedInUser(null);
    setUsers([]);
  }, []);

  const refreshUsers = useCallback(async () => {
    const nextUsers = await fetchUsers();
    setUsers(nextUsers);
  }, []);

  const createBackendUser = useCallback(async (payload: Parameters<typeof createUser>[0]) => {
    const user = await createUser(payload);
    setUsers((prev) => [...prev, user]);
    return user;
  }, []);

  const deleteBackendUser = useCallback(async (userId: string) => {
    await apiDeleteUser(userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  return {
    loggedInUser,
    users,
    setUsers,
    setLoggedInUser,
    handleLogin,
    handleLogout,
    refreshUsers,
    createBackendUser,
    deleteBackendUser,
  };
};
