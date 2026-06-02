import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '../types';
import { getViewForRole } from '../utils/viewUtils';
import { View } from '../components/Navigation';
import { createUser, fetchCurrentUser, fetchUsers, login, logout, deleteUser as apiDeleteUser } from '../services/authApi';

interface UseAuthOptions {
  onViewChange?: (view: View) => void;
}

export const useAuth = ({ onViewChange }: UseAuthOptions = {}) => {
  const queryClient = useQueryClient();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const onViewChangeRef = useRef(onViewChange);

  useEffect(() => {
    onViewChangeRef.current = onViewChange;
  }, [onViewChange]);

  useEffect(() => {
    void fetchCurrentUser()
      .then((user) => {
        if (user) {
          setLoggedInUser(user);
          onViewChangeRef.current?.(getViewForRole(user.role));
        }
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: loggedInUser?.role === UserRole.ADMIN,
  });

  const setUsers = useCallback(
    (updater: User[] | ((prev: User[]) => User[])) => {
      queryClient.setQueryData<User[]>(['users'], (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    [queryClient]
  );

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await login({ email, password });
      setLoggedInUser(user);
      onViewChangeRef.current?.(getViewForRole(user.role));
      if (user.role === UserRole.ADMIN) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [queryClient]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      setLoggedInUser(null);
      queryClient.removeQueries({ queryKey: ['users'] });
    }
  }, [queryClient]);

  const refreshUsers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [queryClient]);

  const createBackendUser = useCallback(async (payload: Parameters<typeof createUser>[0]) => {
    const user = await createUser(payload);
    queryClient.setQueryData<User[]>(['users'], (prev = []) => [...prev, user]);
    return user;
  }, [queryClient]);

  const deleteBackendUser = useCallback(async (userId: string) => {
    await apiDeleteUser(userId);
    queryClient.setQueryData<User[]>(['users'], (prev = []) =>
      prev.filter((user) => user.id !== userId)
    );
  }, [queryClient]);

  return {
    loggedInUser,
    isCheckingAuth,
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
