
import { Requisition, Candidate, Interview, TalentPool, InterviewScorecardTemplate, User, UserRole } from './types';

export const DEMO_COMPANY_NAME = "";
export const DEMO_COMPANY_SELLING_POINTS: string[] = [];
export const APP_TITLE = "AI Hiring System";

// --- SAMPLE DATA POPULATION ---

export const SAMPLE_USERS: User[] = [
  { id: 'admin-user-01', name: 'Sanjay Chandel', email: 'sanjay123chandel@gmail.com', role: UserRole.ADMIN },
];

export const SAMPLE_SCORECARD_TEMPLATES: InterviewScorecardTemplate[] = [];

export const SAMPLE_TALENT_POOLS: TalentPool[] = [];

export const SAMPLE_REQUISITIONS: Requisition[] = [];

export const SAMPLE_CANDIDATES: Candidate[] = [];

export const SAMPLE_INTERVIEWS: Interview[] = [];
