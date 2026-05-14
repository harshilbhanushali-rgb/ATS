export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiFetch = async (path: string, options: Parameters<typeof fetch>[1] = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });

  return response;
};
