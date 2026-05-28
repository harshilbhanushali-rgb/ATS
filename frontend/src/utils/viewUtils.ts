import { UserRole } from '../types';
import { View } from '../components/Navigation';

export const getViewForRole = (role: UserRole): View => {
  if (role === UserRole.SOURCER) return 'sourcerhub';
  if (role === UserRole.RECRUITER || role === UserRole.LEAD_RECRUITER) return 'recruiter';
  if (role === UserRole.HIRING_MANAGER) return 'hmhub';
  if (role === UserRole.ADMIN) return 'admin';
  return 'dashboard';
};

const VIEW_PATHS: Record<View, string> = {
  dashboard: '/',
  requisitions: '/requisitions',
  recruiter: '/recruiter',
  sourcerhub: '/sourcer',
  hmhub: '/hm',
  offerhub: '/offers',
  talentpools: '/talent-pools',
  reporting: '/reporting',
  admin: '/admin',
};

export const getPathForView = (view: View): string => VIEW_PATHS[view] ?? '/';

export const getViewForPath = (pathname: string): View => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') return 'dashboard';
  if (normalized.startsWith('/requisitions')) return 'requisitions';
  if (normalized.startsWith('/recruiter')) return 'recruiter';
  if (normalized.startsWith('/sourcer')) return 'sourcerhub';
  if (normalized.startsWith('/hm')) return 'hmhub';
  if (normalized.startsWith('/offers')) return 'offerhub';
  if (normalized.startsWith('/talent-pools')) return 'talentpools';
  if (normalized.startsWith('/reporting')) return 'reporting';
  if (normalized.startsWith('/admin')) return 'admin';
  return 'dashboard';
};
