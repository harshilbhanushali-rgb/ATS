export enum Priority {
  P0 = "P0: Very Critical",
  P1 = "P1: Critical",
}

export enum HireType {
  FULL_TIME = "Full Time",
  INTERN = "Intern",
  CONTRACT = "Contract",
}

export enum RequisitionStatus {
  OPEN = "Open",
  OFFERED = "Offered", // Indicates at least one candidate has an offer extended
  JOINED = "Joined", // Indicates a candidate has accepted and joined
  HOLD = "Hold",
  CANCELLED = "Cancelled",
  ARCHIVED = "Archived",
}

export enum Location {
  INDIA = "India",
  US = "US",
  CANADA = "Canada",
  UK = "UK",
}

export enum FunctionArea {
  SALES = "Sales",
  CUSTOMER_SUCCESS = "Customer Success",
  MARKETING = "Marketing",
  SUPPLY = "Supply",
  FINANCE_LEGAL = "Finance & Legal",
  PEOPLE_CULTURE = "People and Culture",
  PRODUCT = "Product",
  ENGINEERING = "Engineering",
  OPERATIONS_STRATEGY = "Operations & Strategy",
}

export enum NewOrBackfill {
  NEW = "New",
  BACKFILL = "Backfill",
}

export interface Cost {
  amount: number;
  currency: "INR" | "USD";
}

export interface BackfillDetails {
  employeeName: string;
  previousSalary?: number;
}

export interface Metadata {
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  createdBy: string; // userId
  lastModifiedBy: string; // userId
}

export interface Requisition {
  id: string;
  reqApprovalDate: string; // ISO Date string
  priority: Priority;
  role: string;
  hireType: HireType;
  cost: Cost;
  reqStatus: RequisitionStatus;
  location: Location;
  function: FunctionArea;
  newOrBackfill: NewOrBackfill;
  backfillDetails?: BackfillDetails;
  hiringManagerName: string;
  functionHeadName: string;
  assignedRecruiterName: string;
  jobDescription?: string; // Added field for Job Description
  metadata?: Metadata;
}

export interface AISuggestion {
  field: keyof Requisition | 'general' | 'cost' | 'priority';
  suggestion: string;
  reasoning?: string;
}

// ===== RECRUITER MODULE TYPES =====

export enum CandidateStage {
  APPLIED = "Applied",
  POOLED = "Talent Pool Prospect",
  SCREENING = "Screening",
  SHORTLISTED = "Shortlisted", // Recruiter hands off to HM
  AI_SOURCED_POOL = "AI Sourced (Pool)", // New stage for this feature
  INTERVIEW_ROUND_1 = "Interview - Round 1",
  INTERVIEW_ROUND_2 = "Interview - Round 2",
  INTERVIEW_ROUND_3 = "Interview - Round 3",
  INTERVIEW_ROUND_4 = "Interview - Round 4",
  HM_DECISION_PENDING = "HM Decision Pending", 
  OFFER_EXTENDED = "Offer Extended", 
  OFFER_ACCEPTED = "Offer Accepted", 
  OFFER_DECLINED = "Offer Declined", 
  HIRED = "Hired", 
  REJECTED = "Rejected", 
  ON_HOLD = "On Hold",
}

export interface StageHistoryEntry {
  stage: CandidateStage;
  date: string; // ISO Date string
  changedByUserId?: string; 
}

export enum CandidateSource {
  LINKEDIN = "LinkedIn",
  INDEED = "Indeed",
  NAUKRI = "Naukri.com",
  REFERRAL = "Referral",
  DIRECT_APPLICATION = "Direct Application",
  CAREERS_PAGE = "Company Careers Page",
  OTHER = "Other",
}

export interface OfferDetails {
  salary: Cost;
  startDate: string; // ISO Date string
  offerLetterUrl?: string;
  offerNotes?: string;
}

// ===== RESUME ANALYSIS TYPES =====
export enum ResumeMatchAssessment {
    STRONG_MATCH = "Strong Match",
    GOOD_MATCH = "Good Match",
    PARTIAL_MATCH = "Partial Match",
    LOW_MATCH = "Low Match",
    NOT_A_FIT = "Not a Fit",
    INSUFFICIENT_DATA = "Insufficient Data to Assess"
}

export interface ResumeMatchAnalysis {
    matchAssessment: ResumeMatchAssessment;
    summary: string; 
    matchingSkills: string[];
    missingSkills: string[];
    experienceAlignment: {
        overallYears?: string | null; 
        relevantRoles?: string[] | null; 
        notes?: string | null; 
    };
    educationAlignment: {
        degree?: string | null; 
        institution?: string | null;
        notes?: string | null; 
    };
    overallFitReasoning?: string | null; 
}

// ===== HIRING HUB & STRUCTURED FEEDBACK TYPES (NEW) =====
export interface InterviewCompetency {
  id: string;
  name: string;
  description: string;
}

export interface InterviewScorecardTemplate {
  id: string;
  name: string;
  competencies: InterviewCompetency[];
  createdDate: string; // ISO Date string
  createdBy?: string;
  createdByName?: string;
}

export interface InterviewScorecardResult {
  competencyId: string;
  competencyName: string;
  score: number; // 1-5
  evidence: string; // Qualitative notes from interviewer
}

export interface HiringHubComment {
  id: string;
  authorId: string;
  authorName: string;
  timestamp: string; // ISO Date string
  text: string;
}

export interface AIDebriefSummary {
  summary: string;
  pointsOfConsensus: string[];
  pointsOfDivergence: string[];
  generatedDate: string; // ISO Date string
}

// =========================================================

export interface Candidate {
  id: string;
  requisitionId?: string; 
  name: string;
  email: string;
  phone?: string;
  applicationDate: string; 
  stage: CandidateStage;
  source: CandidateSource;
  resumeUrl?: string;
  resumeText?: string; 
  notes?: string;
  offerDetails?: OfferDetails; 
  resumeAnalysis?: ResumeMatchAnalysis | null;
  talentPoolIds?: string[]; 
  sourcedByUserId?: string; 
  sourcedDate?: string; 
  stageHistory?: StageHistoryEntry[]; 
  hiringHubComments?: HiringHubComment[]; // NEW
  aiDebriefSummary?: AIDebriefSummary | null; // NEW
  metadata?: Metadata;
}

// ===== HIRING MANAGER MODULE TYPES =====

export enum InterviewRound {
  ROUND_1 = "Interview - Round 1",
  ROUND_2 = "Interview - Round 2",
  ROUND_3 = "Interview - Round 3",
  ROUND_4 = "Interview - Round 4",
}

export enum InterviewDecision {
  PROCEED = "Proceed to Next Stage",
  RECOMMEND_HIRE = "Recommend for Hire", 
  HOLD = "Put On Hold",
  REJECT = "Reject Candidate",
}

export interface Interview {
  id: string;
  candidateId: string;
  requisitionId: string;
  round: InterviewRound;
  interviewerName: string;
  interviewDate: string; // ISO Date string
  decision: InterviewDecision;
  // DEPRECATED: score: number;
  // DEPRECATED: feedback: string;
  scorecardTemplateId?: string; // NEW: Link to the template used
  results: InterviewScorecardResult[]; // NEW: Structured feedback
}

// ===== AI INTERVIEW CO-PILOT TYPES =====
export interface AIFeedbackAnalysis {
  summary: string;
  keyPositivePoints: string[];
  keyNegativePoints: string[];
  areasToProbeFurther?: string[];
}


// ===== USER ROLE TYPES =====
export enum UserRole {
  ADMIN = "Admin",
  LEAD_RECRUITER = "Lead Recruiter",
  RECRUITER = "Recruiter",
  SOURCER = "Sourcer",
  HIRING_MANAGER = "Hiring Manager",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}


// ===== TALENT POOL TYPES =====
export interface TalentPool {
  id: string;
  name: string;
  description: string;
  createdDate: string; // ISO Date string
  tags?: string[];
}

// ===== AI INSIGHTS DASHBOARD =====
export interface CandidateAIDashboardData {
  candidate: Candidate;
  requisition: Requisition;
}

// ===== SOURCER KPI MODULE TYPES =====
export enum OutreachChannel {
  LINKEDIN_INMAIL = "LinkedIn InMail",
  EMAIL = "Email",
  PHONE_CALL = "Phone Call",
  OTHER = "Other",
}

export interface CandidateOutreachLog {
  id: string;
  candidateId: string;
  sourcerUserId: string; 
  channel: OutreachChannel;
  outreachDate: string; // ISO Date string
  notes?: string;
  responded: boolean; 
  responseDate?: string; 
  clickedLink?: boolean; 
}

// ===== AI CANDIDATE MATCHING TYPES =====
export interface AIRecommendedCandidate {
  candidateId: string;
  justification: string;
  matchScore?: number; // Optional, e.g., 1-5
}

// Props for components that need to open OutreachDraftModal
export interface OutreachDraftHandlerProps {
  onOpenOutreachDraftModal: (candidate: Candidate, requisition: Requisition) => void;
}
