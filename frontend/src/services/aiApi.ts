import { apiFetch } from './apiClient';
import {
  AIDebriefSummary,
  AIRecommendedCandidate,
  AISuggestion,
  Candidate,
  Interview,
  Priority,
  Requisition,
  ResumeMatchAnalysis,
} from '../types';

type ApiResumeMatchAnalysis = {
  match_assessment: ResumeMatchAnalysis['matchAssessment'];
  summary: string;
  matching_skills: string[];
  missing_skills: string[];
  experience_alignment: {
    overall_years?: string | null;
    relevant_roles?: string[] | null;
    notes?: string | null;
  };
  education_alignment: {
    degree?: string | null;
    institution?: string | null;
    notes?: string | null;
  };
  overall_fit_reasoning?: string | null;
};

type ApiRecommendedCandidate = {
  candidate_id: string;
  justification: string;
  match_score?: number | null;
};

type ApiDebriefSummary = {
  summary: string;
  points_of_consensus: string[];
  points_of_divergence: string[];
  generated_date?: string | null;
};

const parseError = async (response: Response, fallback: string) => {
  if (response.status === 429) {
    return new Error('AI is a bit busy right now — please wait a moment and try again.');
  }
  const payload = await response.json().catch(() => null);
  return new Error(payload?.detail || fallback);
};

const postJson = async <T>(path: string, body: unknown, fallbackError: string): Promise<T> => {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response, fallbackError);
  }

  return response.json() as Promise<T>;
};

const getJson = async <T>(path: string, fallbackError: string): Promise<T> => {
  const response = await apiFetch(path);
  if (!response.ok) {
    throw await parseError(response, fallbackError);
  }
  return response.json() as Promise<T>;
};

const toRequisitionContext = (requisition: Partial<Requisition>) => ({
  role: requisition.role || '',
  function: requisition.function || '',
  priority: requisition.priority,
  hire_type: requisition.hireType,
  location: requisition.location,
  cost: requisition.cost,
  job_description: requisition.jobDescription,
});

const toCandidateProfile = (candidate: Candidate) => ({
  id: candidate.id,
  name: candidate.name,
  resume_text: candidate.resumeText,
  notes: candidate.notes,
  source: candidate.source,
  stage_history: candidate.stageHistory?.map((entry) => ({
    stage: entry.stage,
    date: entry.date,
    changed_by_user_id: entry.changedByUserId,
  })),
  talent_pool_ids: candidate.talentPoolIds,
});

const toInterviewFeedback = (interview: Interview) => ({
  interviewer_name: interview.interviewerName,
  round: interview.round,
  decision: interview.decision,
  results: interview.results.map((result) => ({
    competency_name: result.competencyName,
    score: result.score,
    evidence: result.evidence,
  })),
});

const fromResumeAnalysis = (analysis: ApiResumeMatchAnalysis): ResumeMatchAnalysis => ({
  matchAssessment: analysis.match_assessment,
  summary: analysis.summary,
  matchingSkills: analysis.matching_skills,
  missingSkills: analysis.missing_skills,
  experienceAlignment: {
    overallYears: analysis.experience_alignment?.overall_years,
    relevantRoles: analysis.experience_alignment?.relevant_roles,
    notes: analysis.experience_alignment?.notes,
  },
  educationAlignment: {
    degree: analysis.education_alignment?.degree,
    institution: analysis.education_alignment?.institution,
    notes: analysis.education_alignment?.notes,
  },
  overallFitReasoning: analysis.overall_fit_reasoning,
});

const fromRecommendedCandidate = (candidate: ApiRecommendedCandidate): AIRecommendedCandidate => ({
  candidateId: candidate.candidate_id,
  justification: candidate.justification,
  matchScore: candidate.match_score ?? undefined,
});

const fromDebriefSummary = (summary: ApiDebriefSummary): AIDebriefSummary => ({
  summary: summary.summary,
  pointsOfConsensus: summary.points_of_consensus,
  pointsOfDivergence: summary.points_of_divergence,
  generatedDate: summary.generated_date || new Date().toISOString(),
});

export const getAISuggestionsForRequisition = async (
  requisitionPartial: Partial<Requisition>
): Promise<AISuggestion[]> => {
  const data = await postJson<{ suggestions: AISuggestion[] }>(
    '/api/v1/ai/requisition/suggestions',
    { requisition: toRequisitionContext(requisitionPartial) },
    'Failed to generate requisition suggestions.'
  );
  return data.suggestions;
};

export const getAIPrioritySuggestion = async (role: string, func: string): Promise<Priority> => {
  const data = await postJson<{ priority: Priority }>(
    '/api/v1/ai/requisition/priority',
    { role, function: func },
    'Failed to generate priority suggestion.'
  );
  return data.priority;
};

export const getDashboardInsights = async (): Promise<string[]> => {
  const data = await getJson<{ insights: string[] }>(
    '/api/v1/ai/dashboard/insights',
    'Failed to load dashboard insights.'
  );
  return data.insights;
};

export const getResumeMatchAnalysis = async (
  resumeText: string,
  jobDescription: string
): Promise<ResumeMatchAnalysis | null> => {
  const data = await postJson<ApiResumeMatchAnalysis>(
    '/api/v1/ai/resume/analysis',
    { resume_text: resumeText, job_description: jobDescription },
    'Failed to generate resume analysis.'
  );
  return fromResumeAnalysis(data);
};

export const getAICandidateMatchesFromPools = async (
  requisition: Requisition,
  candidatesInPools: Candidate[]
): Promise<AIRecommendedCandidate[]> => {
  const data = await postJson<{ matches: ApiRecommendedCandidate[] }>(
    '/api/v1/ai/candidate-matches',
    {
      requisition: toRequisitionContext(requisition),
      candidates: candidatesInPools.map(toCandidateProfile),
    },
    'Failed to generate candidate matches.'
  );
  return data.matches.map(fromRecommendedCandidate);
};

export const getAIOutreachMessageDraft = async (
  candidate: Candidate,
  requisition: Requisition,
  tone = 'professional and engaging'
): Promise<string> => {
  const data = await postJson<{ draft: string }>(
    '/api/v1/ai/outreach/draft',
    {
      candidate: toCandidateProfile(candidate),
      requisition: toRequisitionContext(requisition),
      tone,
    },
    'Failed to generate outreach draft.'
  );
  return data.draft;
};

export interface ExtractedResumeData {
  text: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

type ApiExtractTextResponse = {
  text: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export const extractTextFromFile = async (
  fileBase64: string,
  mimeType: string,
  extractContactInfo = false
): Promise<ExtractedResumeData> => {
  const data = await postJson<ApiExtractTextResponse>(
    '/api/v1/ai/extract-text',
    { file_base64: fileBase64, mime_type: mimeType, extract_contact_info: extractContactInfo },
    'Failed to extract text from file.'
  );
  return {
    text: data.text,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
  };
};

export const getAIDebriefSummary = async (
  requisition: Requisition,
  interviews: Interview[]
): Promise<AIDebriefSummary | null> => {
  const data = await postJson<{ summary: ApiDebriefSummary }>(
    '/api/v1/ai/debrief-summary',
    {
      requisition: toRequisitionContext(requisition),
      interviews: interviews.map(toInterviewFeedback),
    },
    'Failed to generate debrief summary.'
  );
  return fromDebriefSummary(data.summary);
};
