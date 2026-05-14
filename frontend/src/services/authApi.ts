import { apiFetch } from './apiClient';
import { User, UserRole } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
  is_active?: boolean;
}

const toUser = (user: AuthUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const login = async (payload: LoginRequest): Promise<User> => {
  const response = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail || 'Login failed.');
  }

  const data = (await response.json()) as { user: AuthUser };
  return toUser(data.user);
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json().catch(() => null)) as ForgotPasswordResponse | null;
  if (!response.ok) {
    throw new Error((data as { detail?: string } | null)?.detail || 'Failed to request password reset.');
  }

  return data || { message: 'If the email exists, a password reset message has been sent.' };
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const response = await apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail || 'Failed to reset password.');
  }
};

export const logout = async (): Promise<void> => {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  const response = await apiFetch('/api/v1/auth/me');
  if (!response.ok) return null;
  const data = (await response.json()) as AuthUser;
  return toUser(data);
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiFetch('/api/v1/users');
  if (!response.ok) {
    throw new Error('Failed to load users.');
  }
  const data = (await response.json()) as AuthUser[];
  return data.map(toUser);
};

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
  const response = await apiFetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail || 'Failed to create user.');
  }

  const data = (await response.json()) as AuthUser;
  return toUser(data);
};

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await apiFetch(`/api/v1/users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail || 'Failed to delete user.');
  }
};
