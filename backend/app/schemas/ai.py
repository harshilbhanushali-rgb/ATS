from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class AISuggestion(BaseModel):
    field: str
    suggestion: str
    reasoning: str | None = None


class Cost(BaseModel):
    amount: float
    currency: str


class RequisitionContext(BaseModel):
    role: str
    function: str
    priority: str | None = None
    hire_type: str | None = None
    location: str | None = None
    cost: Cost | None = None
    job_description: str | None = None


class AISuggestionsRequest(BaseModel):
    requisition: RequisitionContext


class AISuggestionsResponse(BaseModel):
    suggestions: list[AISuggestion]


class PrioritySuggestionRequest(BaseModel):
    role: str
    function: str


class PrioritySuggestionResponse(BaseModel):
    priority: str


class DashboardInsightsResponse(BaseModel):
    insights: list[str]


class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str


class ExperienceAlignment(BaseModel):
    overall_years: str | None = None
    relevant_roles: list[str] | None = None
    notes: str | None = None


class EducationAlignment(BaseModel):
    degree: str | None = None
    institution: str | None = None
    notes: str | None = None


class ResumeMatchAnalysis(BaseModel):
    match_assessment: str
    summary: str
    matching_skills: list[str]
    missing_skills: list[str]
    experience_alignment: ExperienceAlignment
    education_alignment: EducationAlignment
    overall_fit_reasoning: str | None = None


class AIRecommendedCandidate(BaseModel):
    candidate_id: str
    justification: str
    match_score: int | None = None


class StageHistoryEntry(BaseModel):
    stage: str
    date: str
    changed_by_user_id: str | None = None


class CandidateProfile(BaseModel):
    id: str
    name: str
    resume_text: str | None = None
    notes: str | None = None
    source: str | None = None
    stage_history: list[StageHistoryEntry] | None = None
    talent_pool_ids: list[str] | None = None


class CandidateMatchRequest(BaseModel):
    requisition: RequisitionContext
    candidates: list[CandidateProfile]


class CandidateMatchResponse(BaseModel):
    matches: list[AIRecommendedCandidate]


class OutreachDraftRequest(BaseModel):
    candidate: CandidateProfile
    requisition: RequisitionContext
    tone: str | None = None


class OutreachDraftResponse(BaseModel):
    draft: str


class TextToSpeechRequest(BaseModel):
    text: str


class TextToSpeechResponse(BaseModel):
    audio_base64: str | None = None


class TranscribeRequest(BaseModel):
    audio_base64: str
    mime_type: str


class TranscribeResponse(BaseModel):
    transcript: str


class ExtractTextRequest(BaseModel):
    file_base64: str
    mime_type: str
    extract_contact_info: bool = False


class ExtractTextResponse(BaseModel):
    text: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None


class InterviewResult(BaseModel):
    competency_name: str
    score: int
    evidence: str


class InterviewFeedback(BaseModel):
    interviewer_name: str
    round: str
    decision: str
    results: list[InterviewResult]


class DebriefSummaryRequest(BaseModel):
    requisition: RequisitionContext
    interviews: list[InterviewFeedback]


class AIDebriefSummary(BaseModel):
    summary: str
    points_of_consensus: list[str]
    points_of_divergence: list[str]
    generated_date: datetime | None = None


class DebriefSummaryResponse(BaseModel):
    summary: AIDebriefSummary
