// frontend/src/data/helpContent.ts
import {
  BarChart3, List, Users, ZoomIn, ClipboardCheck,
  Gift, Database, Settings, GitBranch, TrendingUp, LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';

export interface HelpFeature {
  title: string;
  description: string;
}

export interface HelpSection {
  id: string;
  label: string;
  icon: LucideIcon;
  intro: string;
  features: HelpFeature[];
  roles?: UserRole[];
  tip?: string;
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'pipeline',
    label: 'Hiring Pipeline',
    icon: GitBranch,
    intro: 'The end-to-end hiring funnel — understand how candidates move from sourcing to hire and which team is responsible at each stage.',
    features: [
      {
        title: 'Source',
        description: 'Sourcers find and add candidates to Talent Pools. Outreach campaigns are drafted with AI and logged here.',
      },
      {
        title: 'AI Match',
        description: 'Gemini AI scores candidates against open requisitions — surfacing the best matches from your talent pools without manual screening.',
      },
      {
        title: 'Interview',
        description: 'Recruiters schedule interviews and collect scorecards via the HM Hub. Each interviewer submits a structured scorecard.',
      },
      {
        title: 'Offer',
        description: 'Lead Recruiters extend offers in the Offer Hub. Candidates move through Offer Extended → Offer Accepted → Awaiting Joining.',
      },
      {
        title: 'Hired',
        description: "Hiring Managers confirm joining in the \"Awaiting Joining\" tab. The candidate is marked Hired and KPIs update immediately.",
      },
    ],
    tip: 'AI assists at three stages: Sourcing (outreach drafts), Matching (resume scoring), and Interviews (debrief summary synthesis).',
  },
  {
    id: 'dashboard',
    label: 'Main Dashboard',
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER],
    intro: 'A real-time view of your entire hiring operation — open roles, active candidates, pipeline health, and AI-generated strategic insights.',
    features: [
      {
        title: 'KPI Cards',
        description: 'Five headline metrics at a glance: Open Requisitions, Active Candidates, Interviews Scheduled, Offers Extended, and Total Hired. Each refreshes with live data on page load.',
      },
      {
        title: 'Pipeline Funnel Chart',
        description: 'A visual breakdown of how many candidates sit at each stage — helps spot bottlenecks (e.g., lots of candidates stuck in Screening).',
      },
      {
        title: 'On-Demand AI Insights',
        description: 'Click "Generate Report" to trigger a Gemini analysis of your current pipeline. The report highlights trends, risks, and recommendations. It does not run automatically — click when you need a fresh read.',
      },
      {
        title: 'Reading AI Insights',
        description: 'Each insight is formatted as "Label: Explanation". The label renders bold. Insights are grouped by theme — pipeline health, time-to-fill risk, team workload.',
      },
    ],
    tip: 'The AI report is generated fresh each time — refresh it weekly or before a leadership sync for the most relevant insights.',
  },
  {
    id: 'requisitions',
    label: 'Requisitions',
    icon: List,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER],
    intro: 'Create and manage open job requisitions. Every candidate pipeline starts with a requisition — it defines the role, department, and hiring criteria.',
    features: [
      {
        title: 'Creating a Requisition',
        description: 'Click "New Requisition" in the top bar. Fill in Title, Department, Location, and Description. All fields are required before saving.',
      },
      {
        title: 'AI Suggestions',
        description: 'Click "Get AI Suggestions" inside the form to have Gemini pre-fill the job description and requirements based on the role title. You can edit the suggestions before saving.',
      },
      {
        title: 'Status Lifecycle',
        description: 'Requisitions move through Open → Closed → Archived. Open reqs accept new candidates. Closed reqs are inactive but editable. Archived reqs are read-only and show an amber banner.',
      },
      {
        title: 'Archiving',
        description: 'Only Admins and Lead Recruiters can archive a requisition. Archived reqs disable the Edit button. Use "Reactivate" to re-open an archived req.',
      },
    ],
    tip: 'Use AI Suggestions as a starting point, then customise — it saves ~10 minutes per req and keeps descriptions consistent across the team.',
  },
  {
    id: 'recruiter',
    label: 'Recruiter Hub',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER],
    intro: 'Your day-to-day workspace for managing candidates across all open roles. A Kanban board shows every candidate and their current pipeline stage.',
    features: [
      {
        title: 'Kanban Pipeline Board',
        description: 'Candidates are shown as cards grouped by stage: Applied, Screening, Interview, Offer, Hired, Rejected. Select a requisition from the dropdown to filter the board.',
      },
      {
        title: 'Moving Candidates',
        description: 'Use the stage buttons on each card to advance or move a candidate. Stage changes save immediately and update KPIs on the Dashboard.',
      },
      {
        title: 'Resume Upload & AI Analysis',
        description: 'Open a candidate card and upload their resume (PDF). Click "Analyse with AI" to get a Gemini-powered match score (0–100) and a written summary of strengths and gaps against the requisition.',
      },
      {
        title: 'Adding to Talent Pool',
        description: 'From any candidate card, use "Add to Pool" to place them in one or more talent pools — making them available for future AI matching even after the current req closes.',
      },
    ],
    tip: 'Filter by requisition first — the full unfiltered board across all roles can be overwhelming with many open positions.',
  },
  {
    id: 'sourcerhub',
    label: 'Sourcer Hub',
    icon: ZoomIn,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.SOURCER],
    intro: "Where Sourcers build talent pipelines and run AI-powered candidate discovery. Connect your pools to open requisitions and let Gemini surface the best matches.",
    features: [
      {
        title: 'AI Candidate Matching',
        description: 'Select one or more talent pools, choose a target requisition, and click "Find Matches". Gemini ranks candidates from your pools by fit, returning match scores and reasons.',
      },
      {
        title: 'Pool Selector',
        description: 'Leave all pools unselected to search across every pool. Select specific pools to narrow the match scope — useful when you know which pool has the right skill set.',
      },
      {
        title: 'Outreach Campaigns',
        description: "Select a candidate and click \"Draft Outreach\" to generate a personalised email using AI. The draft pre-fills their name, the role, and tailored selling points. Edit and log the send once you've contacted them.",
      },
      {
        title: 'KPI Tab',
        description: "Switch to the KPIs tab to see your sourcing metrics: candidates sourced, outreach sent, response rate, and pool growth over time. Admins can view any sourcer's KPIs using the sourcer switcher.",
      },
    ],
    tip: 'Run AI matching before building a new pool — you may already have strong candidates sitting in existing pools.',
  },
  {
    id: 'hmhub',
    label: 'HM Hub',
    icon: ClipboardCheck,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.HIRING_MANAGER],
    intro: "The Hiring Manager's workspace for reviewing interview feedback, submitting scorecards, and making hiring decisions with AI-assisted debrief summaries.",
    features: [
      {
        title: 'Interview Scorecards',
        description: 'After each interview, submit a structured scorecard: rate competencies, add written comments, and give an overall hire/no-hire recommendation. Scorecards are visible to all interviewers on the panel.',
      },
      {
        title: 'Viewing All Feedback',
        description: 'The candidate panel shows every submitted scorecard side by side — names, ratings, and comments. Useful for spotting consensus or divergence across the interview panel.',
      },
      {
        title: 'AI Debrief Summary',
        description: 'Click "Generate Debrief Summary" to have Gemini read all submitted scorecards and produce a synthesised hiring recommendation with supporting evidence. Saves 30+ minutes in debrief meetings.',
      },
      {
        title: 'Hiring Decision',
        description: 'Hiring Managers use the Advance or Reject buttons to make the final call. Advancing a candidate moves them to the Offer stage. Recruiters can view decisions but cannot make them.',
      },
    ],
    tip: 'Generate the AI debrief after all interviewers have submitted — it works best with at least two scorecards to synthesise.',
  },
  {
    id: 'offerhub',
    label: 'Offer Hub',
    icon: Gift,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.HIRING_MANAGER],
    intro: 'Manage the offer process from extension to confirmed joining. Two tabs track candidates through the final stages of the hiring funnel.',
    features: [
      {
        title: 'Offers Extended Tab',
        description: 'Shows all candidates in the Offer Extended stage. Use "Mark Accepted" when the candidate accepts. Use "Mark Declined" if they decline — this moves them back for review.',
      },
      {
        title: 'Edit Offer Details',
        description: 'Add or update compensation, start date, and offer notes using the "Edit Offer" button. Offer details persist and are visible in the candidate record and on the Dashboard KPIs.',
      },
      {
        title: 'Awaiting Joining Tab',
        description: "Shows all candidates who have accepted their offer and are due to join. Once the candidate's start date arrives and they show up, click \"Confirm Joined\" to mark them as Hired.",
      },
      {
        title: 'Confirm Joined',
        description: "Only Hiring Managers can confirm joining — this ensures someone with first-hand knowledge makes the call. Confirming moves the candidate to Hired and updates all KPI counters.",
      },
    ],
    tip: 'Always fill in offer details before marking accepted — compensation data feeds the Dashboard offer analytics.',
  },
  {
    id: 'talentpools',
    label: 'Talent Pools',
    icon: Database,
    roles: [UserRole.ADMIN, UserRole.LEAD_RECRUITER, UserRole.RECRUITER, UserRole.SOURCER],
    intro: 'Curated collections of candidates organised by skill set, location, or hiring initiative. Pools are the foundation of AI-powered sourcing.',
    features: [
      {
        title: 'Creating a Pool',
        description: "Click \"New Pool\" and give it a descriptive name (e.g., \"Senior React Engineers — Remote 2026\"). Add an optional description to explain the pool's purpose and criteria.",
      },
      {
        title: 'Adding Candidates',
        description: "Candidates are added to pools from the Recruiter Hub — open a candidate card and use \"Add to Pool\". A candidate can belong to multiple pools.",
      },
      {
        title: 'Using Pools for AI Matching',
        description: "Pools feed directly into the Sourcer Hub's AI matching engine. The more complete the candidate profiles in a pool (resume uploaded, notes added), the better the match quality.",
      },
      {
        title: 'Removing Candidates',
        description: 'Use "Remove from Pool" on a candidate card inside a pool. This only removes the pool association — it does not delete the candidate from the system.',
      },
    ],
    tip: 'Name pools by skill + seniority + time horizon — this makes the pool selector in Sourcer Hub much easier to navigate at scale.',
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: TrendingUp,
    intro: 'Five analytics tabs giving you end-to-end visibility into sourcing effectiveness, pipeline health, hiring speed, candidate history, and team productivity.',
    features: [
      {
        title: 'Source Performance',
        description: 'Shows how many candidates entered via each source (LinkedIn, Naukri, Referral, etc.) and how many converted through the pipeline. Use this to double down on channels that deliver quality hires.',
      },
      {
        title: 'Pipeline Status',
        description: 'A funnel breakdown of candidates at every stage right now. Spots bottlenecks — e.g., a large Screening pool with few moving to Interview signals a review capacity problem.',
      },
      {
        title: 'Velocity Metrics',
        description: 'Time-to-hire analytics — average days between key stage transitions (Applied → Screened, Interview → Offer, etc.). Tracks whether hiring is speeding up or slowing down over time.',
      },
      {
        title: 'Applications Audit',
        description: 'A searchable, filterable log of every candidate and their full stage history. Export to CSV for external reporting or compliance purposes.',
      },
      {
        title: 'Team Productivity',
        description: 'Per-user counts of outreach sent, candidates sourced, and interviews logged. Admins and Lead Recruiters use this to balance workload and recognise high output.',
      },
    ],
    tip: 'All five tabs use live data — no need to refresh. Export the Applications Audit to CSV before leadership reviews for a clean offline snapshot.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    roles: [UserRole.ADMIN],
    intro: 'System administration for user management. Only Admin-role accounts can access this section.',
    features: [
      {
        title: 'Creating Users',
        description: 'Click "New User" and fill in name, email (must be @joveo.com), and role. The user can log in immediately with the credentials set at creation time.',
      },
      {
        title: 'Assigning Roles',
        description: 'Roles determine which pages and actions a user can access. Lead Recruiter has broader permissions than Recruiter; Hiring Manager has access to Offer Hub confirmation.',
      },
      {
        title: 'Deleting Users',
        description: 'Deleted users lose access immediately. Their historical data (candidates created, scorecards submitted) is preserved in the system.',
      },
      {
        title: 'Bootstrap Admin',
        description: 'The first Admin account is created automatically from the ADMIN_EMAIL and ADMIN_PASSWORD environment variables on first server startup. This account cannot be deleted.',
      },
      {
        title: 'Scorecard Template Builder',
        description: 'Create reusable interview competency templates that interviewers can select when submitting scorecards. Add competencies, write descriptions, and save — the template is immediately available across all hiring rounds.',
      },
      {
        title: 'Data Import',
        description: 'Bulk-import candidates from a CSV file via the Import tab. Use this to seed the system from a legacy ATS or spreadsheet export.',
      },
    ],
    tip: 'Assign the most restrictive role that covers what the user needs — you can always promote later.',
  },
];
