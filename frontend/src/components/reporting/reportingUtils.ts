import { CandidateSource } from '../../types';

export const COLORS = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
];

export const daysBetween = (s1: string | undefined, s2: string | undefined): number | null => {
  if (!s1 || !s2) return null;
  const t1 = new Date(s1).getTime();
  const t2 = new Date(s2).getTime();
  if (isNaN(t1) || isNaN(t2)) return null;
  return Math.max(0, Math.floor((t2 - t1) / (1000 * 60 * 60 * 24)));
};

export const getSourceCategory = (source: CandidateSource): string => {
  switch (source) {
    case CandidateSource.INDEED:
    case CandidateSource.NAUKRI:
    case CandidateSource.DIRECT_APPLICATION:
      return 'Portal';
    case CandidateSource.LINKEDIN:
      return 'Social';
    case CandidateSource.REFERRAL:
      return 'Referral';
    case CandidateSource.CAREERS_PAGE:
      return 'Company Careers Page';
    default:
      return 'Others';
  }
};

export const downloadCSV = (data: Record<string, unknown>[], headers: string[], filename: string) => {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
  data.forEach(row => {
    const rowString = headers.map(header => {
      const val = row[header] !== undefined ? String(row[header]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
    csvContent += rowString + '\n';
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
