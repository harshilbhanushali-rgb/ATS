import { apiFetch } from './apiClient';
import {
  AIDebriefSummary,
  Candidate,
  CandidateOutreachLog,
  HiringHubComment,
  Interview,
  InterviewScorecardTemplate,
  OfferDetails,
  Requisition,
  ResumeMatchAnalysis,
  StageHistoryEntry,
  TalentPool,
} from '../types';

// ---- Shared helpers ----

const parseError = async (response: Response, fallback: string): Promise<Error> => {
  const payload = await response.json().catch(() => null);
  return new Error(payload?.detail || fallback);
};

async function getJson<T>(path: string, fallback: string): Promise<T> {
  const response = await apiFetch(path);
  if (!response.ok) throw await parseError(response, fallback);
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown, fallback: string): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseError(response, fallback);
  return response.json() as Promise<T>;
}

async function patchJson<T>(path: string, body: unknown, fallback: string): Promise<T> {
  const response = await apiFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseError(response, fallback);
  return response.json() as Promise<T>;
}

async function deleteReq(path: string, fallback: string): Promise<void> {
  const response = await apiFetch(path, { method: 'DELETE' });
  if (!response.ok) throw await parseError(response, fallback);
}

// ============================================================
// Requisition
// ============================================================

export interface RequisitionFilterParams {
  search?: string;
  status?: string;
  hiringManager?: string;
  functionArea?: string;
}

type ApiRequisition = {
  id: string;
  req_approval_date: string;
  priority: string;
  role: string;
  hire_type: string;
  cost: { amount: number; currency: 'INR' | 'USD' };
  req_status: string;
  location: string;
  function: string;
  new_or_backfill: string;
  backfill_details?: { employeeName: string; previousSalary?: number } | null;
  hiring_manager_name: string;
  function_head_name: string;
  assigned_recruiter_name: string;
  job_description?: string | null;
  metadata?: Requisition['metadata'] | null;
};

const fromReq = (r: ApiRequisition): Requisition => ({
  id: r.id,
  reqApprovalDate: r.req_approval_date,
  priority: r.priority as Requisition['priority'],
  role: r.role,
  hireType: r.hire_type as Requisition['hireType'],
  cost: r.cost,
  reqStatus: r.req_status as Requisition['reqStatus'],
  location: r.location as Requisition['location'],
  function: r.function as Requisition['function'],
  newOrBackfill: r.new_or_backfill as Requisition['newOrBackfill'],
  backfillDetails: r.backfill_details ?? undefined,
  hiringManagerName: r.hiring_manager_name,
  functionHeadName: r.function_head_name,
  assignedRecruiterName: r.assigned_recruiter_name,
  jobDescription: r.job_description ?? undefined,
  metadata: r.metadata ?? undefined,
});

const toReq = (r: Requisition): Record<string, unknown> => ({
  id: r.id,
  req_approval_date: r.reqApprovalDate,
  priority: r.priority,
  role: r.role,
  hire_type: r.hireType,
  cost: r.cost,
  req_status: r.reqStatus,
  location: r.location,
  function: r.function,
  new_or_backfill: r.newOrBackfill,
  backfill_details: r.backfillDetails ?? null,
  hiring_manager_name: r.hiringManagerName,
  function_head_name: r.functionHeadName,
  assigned_recruiter_name: r.assignedRecruiterName,
  job_description: r.jobDescription ?? null,
  metadata: r.metadata ?? null,
});

export const listRequisitions = (params?: RequisitionFilterParams): Promise<Requisition[]> => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  if (params?.hiringManager) qs.set('hiring_manager', params.hiringManager);
  if (params?.functionArea) qs.set('function_area', params.functionArea);
  const query = qs.toString();
  return getJson<ApiRequisition[]>(
    `/api/v1/requisitions/${query ? `?${query}` : ''}`,
    'Failed to load requisitions.'
  ).then((data) => data.map(fromReq));
};

export const createRequisition = (r: Requisition): Promise<Requisition> =>
  postJson<ApiRequisition>('/api/v1/requisitions/', toReq(r), 'Failed to create requisition.').then(fromReq);

export const updateRequisition = (r: Requisition): Promise<Requisition> =>
  patchJson<ApiRequisition>(`/api/v1/requisitions/${r.id}`, toReq(r), 'Failed to update requisition.').then(fromReq);

export const deleteRequisition = (id: string): Promise<void> =>
  deleteReq(`/api/v1/requisitions/${id}`, 'Failed to delete requisition.');

// ============================================================
// Candidate
// ============================================================

type ApiCandidate = {
  id: string;
  requisition_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  application_date: string;
  stage: string;
  source: string;
  resume_url?: string | null;
  resume_text?: string | null;
  notes?: string | null;
  offer_details?: OfferDetails | null;
  resume_analysis?: ResumeMatchAnalysis | null;
  talent_pool_ids?: string[] | null;
  sourced_by_user_id?: string | null;
  sourced_date?: string | null;
  stage_history?: StageHistoryEntry[] | null;
  hiring_hub_comments?: HiringHubComment[] | null;
  ai_debrief_summary?: AIDebriefSummary | null;
  metadata?: Candidate['metadata'] | null;
};

const fromCand = (c: ApiCandidate): Candidate => ({
  id: c.id,
  requisitionId: c.requisition_id ?? undefined,
  name: c.name,
  email: c.email,
  phone: c.phone ?? undefined,
  applicationDate: c.application_date,
  stage: c.stage as Candidate['stage'],
  source: c.source as Candidate['source'],
  resumeUrl: c.resume_url ?? undefined,
  resumeText: c.resume_text ?? undefined,
  notes: c.notes ?? undefined,
  offerDetails: c.offer_details ?? undefined,
  resumeAnalysis: c.resume_analysis ?? undefined,
  talentPoolIds: c.talent_pool_ids ?? undefined,
  sourcedByUserId: c.sourced_by_user_id ?? undefined,
  sourcedDate: c.sourced_date ?? undefined,
  stageHistory: c.stage_history ?? undefined,
  hiringHubComments: c.hiring_hub_comments ?? undefined,
  aiDebriefSummary: c.ai_debrief_summary ?? undefined,
  metadata: c.metadata ?? undefined,
});

const toCand = (c: Partial<Candidate>): Record<string, unknown> => ({
  ...(c.id !== undefined && { id: c.id }),
  requisition_id: c.requisitionId ?? null,
  name: c.name,
  email: c.email,
  phone: c.phone ?? null,
  application_date: c.applicationDate,
  stage: c.stage,
  source: c.source,
  resume_url: c.resumeUrl ?? null,
  resume_text: c.resumeText ?? null,
  notes: c.notes ?? null,
  offer_details: c.offerDetails ?? null,
  resume_analysis: c.resumeAnalysis ?? null,
  talent_pool_ids: c.talentPoolIds ?? null,
  sourced_by_user_id: c.sourcedByUserId ?? null,
  sourced_date: c.sourcedDate ?? null,
  stage_history: c.stageHistory ?? null,
  hiring_hub_comments: c.hiringHubComments ?? null,
  ai_debrief_summary: c.aiDebriefSummary ?? null,
  metadata: c.metadata ?? null,
});

export const listCandidates = (): Promise<Candidate[]> =>
  getJson<ApiCandidate[]>('/api/v1/candidates/', 'Failed to load candidates.').then((data) =>
    data.map(fromCand)
  );

export const createCandidate = (c: Candidate): Promise<Candidate> =>
  postJson<ApiCandidate>('/api/v1/candidates/', toCand(c), 'Failed to create candidate.').then(fromCand);

export const updateCandidate = (c: Candidate): Promise<Candidate> =>
  patchJson<ApiCandidate>(`/api/v1/candidates/${c.id}`, toCand(c), 'Failed to update candidate.').then(fromCand);

export const patchCandidate = (id: string, fields: Partial<Candidate>): Promise<Candidate> =>
  patchJson<ApiCandidate>(`/api/v1/candidates/${id}`, toCand(fields), 'Failed to update candidate.').then(fromCand);

export const deleteCandidate = (id: string): Promise<void> =>
  deleteReq(`/api/v1/candidates/${id}`, 'Failed to delete candidate.');

// ============================================================
// Interview
// ============================================================

type ApiInterview = {
  id: string;
  candidate_id: string;
  requisition_id: string;
  round: string;
  interviewer_name: string;
  interview_date: string;
  decision: string;
  scorecard_template_id?: string | null;
  results?: Interview['results'] | null;
};

const fromInterview = (i: ApiInterview): Interview => ({
  id: i.id,
  candidateId: i.candidate_id,
  requisitionId: i.requisition_id,
  round: i.round as Interview['round'],
  interviewerName: i.interviewer_name,
  interviewDate: i.interview_date,
  decision: i.decision as Interview['decision'],
  scorecardTemplateId: i.scorecard_template_id ?? undefined,
  results: i.results ?? [],
});

const toInterview = (i: Interview): Record<string, unknown> => ({
  id: i.id,
  candidate_id: i.candidateId,
  requisition_id: i.requisitionId,
  round: i.round,
  interviewer_name: i.interviewerName,
  interview_date: i.interviewDate,
  decision: i.decision,
  scorecard_template_id: i.scorecardTemplateId ?? null,
  results: i.results,
});

export const listInterviews = (): Promise<Interview[]> =>
  getJson<ApiInterview[]>('/api/v1/interviews/', 'Failed to load interviews.').then((data) =>
    data.map(fromInterview)
  );

export const createInterview = (i: Interview): Promise<Interview> =>
  postJson<ApiInterview>('/api/v1/interviews/', toInterview(i), 'Failed to create interview.').then(fromInterview);

export const deleteInterview = (id: string): Promise<void> =>
  deleteReq(`/api/v1/interviews/${id}`, 'Failed to delete interview.');

// ============================================================
// TalentPool
// ============================================================

type ApiTalentPool = {
  id: string;
  name: string;
  description: string;
  created_date: string;
  tags?: string[] | null;
};

const fromPool = (p: ApiTalentPool): TalentPool => ({
  id: p.id,
  name: p.name,
  description: p.description,
  createdDate: p.created_date,
  tags: p.tags ?? undefined,
});

const toPool = (p: TalentPool): Record<string, unknown> => ({
  id: p.id,
  name: p.name,
  description: p.description,
  created_date: p.createdDate,
  tags: p.tags ?? null,
});

export const listTalentPools = (): Promise<TalentPool[]> =>
  getJson<ApiTalentPool[]>('/api/v1/talent-pools/', 'Failed to load talent pools.').then((data) =>
    data.map(fromPool)
  );

export const createTalentPool = (p: TalentPool): Promise<TalentPool> =>
  postJson<ApiTalentPool>('/api/v1/talent-pools/', toPool(p), 'Failed to create talent pool.').then(fromPool);

export const updateTalentPool = (p: TalentPool): Promise<TalentPool> =>
  patchJson<ApiTalentPool>(`/api/v1/talent-pools/${p.id}`, toPool(p), 'Failed to update talent pool.').then(fromPool);

export const deleteTalentPool = (id: string): Promise<void> =>
  deleteReq(`/api/v1/talent-pools/${id}`, 'Failed to delete talent pool.');

// ============================================================
// ScorecardTemplate
// ============================================================

type ApiScorecard = {
  id: string;
  name: string;
  competencies: InterviewScorecardTemplate['competencies'];
  created_date: string;
};

const fromScorecard = (s: ApiScorecard): InterviewScorecardTemplate => ({
  id: s.id,
  name: s.name,
  competencies: s.competencies,
  createdDate: s.created_date,
});

const toScorecard = (s: InterviewScorecardTemplate): Record<string, unknown> => ({
  id: s.id,
  name: s.name,
  competencies: s.competencies,
  created_date: s.createdDate,
});

export const listScorecards = (): Promise<InterviewScorecardTemplate[]> =>
  getJson<ApiScorecard[]>('/api/v1/scorecards/', 'Failed to load scorecard templates.').then((data) =>
    data.map(fromScorecard)
  );

export const createScorecard = (s: InterviewScorecardTemplate): Promise<InterviewScorecardTemplate> =>
  postJson<ApiScorecard>('/api/v1/scorecards/', toScorecard(s), 'Failed to create scorecard.').then(fromScorecard);

export const updateScorecard = (s: InterviewScorecardTemplate): Promise<InterviewScorecardTemplate> =>
  patchJson<ApiScorecard>(
    `/api/v1/scorecards/${s.id}`,
    toScorecard(s),
    'Failed to update scorecard.'
  ).then(fromScorecard);

export const deleteScorecard = (id: string): Promise<void> =>
  deleteReq(`/api/v1/scorecards/${id}`, 'Failed to delete scorecard.');

// ============================================================
// OutreachLog
// ============================================================

type ApiOutreachLog = {
  id: string;
  candidate_id: string;
  sourcer_user_id: string;
  channel: string;
  outreach_date: string;
  notes?: string | null;
  responded: boolean;
  response_date?: string | null;
  clicked_link: boolean;
};

const fromLog = (l: ApiOutreachLog): CandidateOutreachLog => ({
  id: l.id,
  candidateId: l.candidate_id,
  sourcerUserId: l.sourcer_user_id,
  channel: l.channel as CandidateOutreachLog['channel'],
  outreachDate: l.outreach_date,
  notes: l.notes ?? undefined,
  responded: l.responded,
  responseDate: l.response_date ?? undefined,
  clickedLink: l.clicked_link,
});

const toLog = (l: CandidateOutreachLog): Record<string, unknown> => ({
  id: l.id,
  candidate_id: l.candidateId,
  sourcer_user_id: l.sourcerUserId,
  channel: l.channel,
  outreach_date: l.outreachDate,
  notes: l.notes ?? null,
  responded: l.responded,
  response_date: l.responseDate ?? null,
  clicked_link: l.clickedLink ?? false,
});

export const listOutreachLogs = (): Promise<CandidateOutreachLog[]> =>
  getJson<ApiOutreachLog[]>('/api/v1/outreach-logs/', 'Failed to load outreach logs.').then((data) =>
    data.map(fromLog)
  );

export const createOutreachLog = (l: CandidateOutreachLog): Promise<CandidateOutreachLog> =>
  postJson<ApiOutreachLog>('/api/v1/outreach-logs/', toLog(l), 'Failed to create outreach log.').then(fromLog);

export const deleteOutreachLog = (id: string): Promise<void> =>
  deleteReq(`/api/v1/outreach-logs/${id}`, 'Failed to delete outreach log.');
