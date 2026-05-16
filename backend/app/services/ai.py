from __future__ import annotations

import json
import base64
from typing import Any

import anyio

from app.core.config import settings
from app.schemas.ai import (
    AIDebriefSummary,
    AIRecommendedCandidate,
    AISuggestion,
    RequisitionContext,
    ResumeMatchAnalysis,
)
from app.utils.prompts import (
    REQUISITION_SUGGESTIONS_PROMPT,
    PRIORITY_SUGGESTION_PROMPT,
    DASHBOARD_INSIGHTS_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    CANDIDATE_MATCHING_PROMPT,
    OUTREACH_DRAFT_PROMPT,
    DEBRIEF_SUMMARY_PROMPT,
    TEXT_EXTRACTION_PROMPT,
    build_requisition_context_prompt,
    build_candidates_prompt_part,
    build_feedback_context,
    DEMO_COMPANY_NAME,
    DEMO_COMPANY_SELLING_POINTS,
)

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover
    genai = None
    types = None

DEFAULT_TEXT_MODEL = "gemini-3.1-flash-lite"


class AIServiceError(RuntimeError):
    pass


def _ensure_client() -> None:
    if not settings.GEMINI_API_KEY:
        raise AIServiceError("GEMINI_API_KEY is not configured")
    if genai is None:
        raise AIServiceError("google-genai is not installed")


def _get_client() -> "genai.Client":
    _ensure_client()
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _generate_sync(prompt: str, response_mime_type: str | None = None) -> str:
    client = _get_client()
    generation_config = None
    if response_mime_type:
        generation_config = types.GenerateContentConfig(response_mime_type=response_mime_type)
    response = client.models.generate_content(
        model=DEFAULT_TEXT_MODEL,
        contents=prompt,
        config=generation_config,
    )
    return (response.text or "").strip()


async def _generate_text(prompt: str, response_mime_type: str | None = None) -> str:
    return await anyio.to_thread.run_sync(_generate_sync, prompt, response_mime_type)


def _parse_json(text: str) -> Any:
    cleaned = text.strip()
    start = min([i for i in [cleaned.find("{"), cleaned.find("[")] if i != -1] or [-1])
    end = max([i for i in [cleaned.rfind("}"), cleaned.rfind("]")] if i != -1] or [-1])
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def _fallback_resume_analysis(message: str) -> ResumeMatchAnalysis:
    return ResumeMatchAnalysis(
        match_assessment="Insufficient Data to Assess",
        summary=message,
        matching_skills=[],
        missing_skills=[],
        experience_alignment={"notes": message},
        education_alignment={"notes": message},
        overall_fit_reasoning=message,
    )


async def suggest_priority(role: str, function: str) -> str:
    prompt = PRIORITY_SUGGESTION_PROMPT.format(role=role, function=function)
    try:
        text = await _generate_text(prompt)
        if "P0" in text:
            return "P0: Very Critical"
        return "P1: Critical"
    except Exception:
        return "P1: Critical"


async def suggest_requisition(requisition: RequisitionContext) -> list[AISuggestion]:
    requisition_context = build_requisition_context_prompt(requisition.model_dump())
    prompt = REQUISITION_SUGGESTIONS_PROMPT.format(requisition_context=requisition_context)
    try:
        text = await _generate_text(prompt, response_mime_type="application/json")
        data = _parse_json(text)
        if isinstance(data, list):
            return [AISuggestion(**item) for item in data if isinstance(item, dict)]
    except Exception:
        pass
    return [AISuggestion(field="general", suggestion="AI suggestions unavailable.")]


async def dashboard_insights() -> list[str]:
    prompt = DASHBOARD_INSIGHTS_PROMPT
    try:
        text = await _generate_text(prompt, response_mime_type="application/json")
        data = _parse_json(text)
        if isinstance(data, list) and all(isinstance(item, str) for item in data):
            return data
    except Exception:
        pass
    return ["AI insights are currently unavailable."]


async def resume_analysis(resume_text: str, job_description: str) -> ResumeMatchAnalysis:
    if not resume_text.strip() or not job_description.strip():
        return _fallback_resume_analysis("Resume text or job description is empty.")

    prompt = RESUME_ANALYSIS_PROMPT.format(
        job_description=job_description,
        resume_text=resume_text
    )
    try:
        text = await _generate_text(prompt, response_mime_type="application/json")
        data = _parse_json(text)
        if isinstance(data, dict):
            return ResumeMatchAnalysis(
                match_assessment=data.get("matchAssessment", "Insufficient Data to Assess"),
                summary=data.get("summary", ""),
                matching_skills=data.get("matchingSkills", []),
                missing_skills=data.get("missingSkills", []),
                experience_alignment=data.get("experienceAlignment", {}),
                education_alignment=data.get("educationAlignment", {}),
                overall_fit_reasoning=data.get("overallFitReasoning"),
            )
    except Exception:
        pass
    return _fallback_resume_analysis("AI resume analysis failed.")


async def candidate_matches(requisition: RequisitionContext, candidates: list[dict[str, Any]]) -> list[AIRecommendedCandidate]:
    candidates_prompt_part = build_candidates_prompt_part(candidates)
    prompt = CANDIDATE_MATCHING_PROMPT.format(
        role=requisition.role,
        function=requisition.function,
        location=requisition.location,
        job_description=requisition.job_description or 'No detailed job description provided.',
        candidates_prompt_part=candidates_prompt_part
    )
    try:
        text = await _generate_text(prompt, response_mime_type="application/json")
        data = _parse_json(text)
        if isinstance(data, list):
            return [
                AIRecommendedCandidate(
                    candidate_id=item.get("candidateId", ""),
                    justification=item.get("justification", ""),
                    match_score=item.get("matchScore"),
                )
                for item in data
                if isinstance(item, dict)
            ]
    except Exception:
        pass
    return []


async def outreach_draft(candidate: dict[str, Any], requisition: RequisitionContext, tone: str | None) -> str:
    resume_context = candidate.get('resume_text', '') or (
        ', '.join(candidate.get('resume_analysis', {}).get('matching_skills', [])) or "Not specified"
    )
    jd_context = requisition.job_description or requisition.role

    prompt = OUTREACH_DRAFT_PROMPT.format(
        resume_context=f'"""{resume_context[:2000]}"""',
        role=requisition.role,
        company_name=DEMO_COMPANY_NAME,
        jd_context=f'"""{jd_context[:1000]}"""',
        company_selling_points='; '.join(DEMO_COMPANY_SELLING_POINTS),
        tone=tone or 'professional and friendly'
    )
    try:
        return await _generate_text(prompt)
    except Exception:
        return "AI outreach draft unavailable."


async def debrief_summary(requisition: RequisitionContext, interviews: list[dict[str, Any]]) -> AIDebriefSummary:
    feedback_context = build_feedback_context(interviews)
    prompt = DEBRIEF_SUMMARY_PROMPT.format(
        role=requisition.role,
        job_description=requisition.job_description or 'No Job Description provided.',
        feedback_context=feedback_context
    )
    try:
        text = await _generate_text(prompt, response_mime_type="application/json")
        data = _parse_json(text)
        if isinstance(data, dict):
            return AIDebriefSummary(
                summary=data.get("summary", ""),
                points_of_consensus=data.get("pointsOfConsensus", []),
                points_of_divergence=data.get("pointsOfDivergence", []),
                generated_date=None,
            )
    except Exception:
        pass
    return AIDebriefSummary(
        summary="AI debrief summary unavailable.",
        points_of_consensus=[],
        points_of_divergence=[],
        generated_date=None,
    )


async def transcribe_audio(_audio_base64: str, _mime_type: str) -> str:
    raise NotImplementedError("Audio transcription is not yet implemented")


async def text_to_speech(_text: str) -> str | None:
    raise NotImplementedError("Text-to-speech is not yet implemented")


async def extract_text_from_file(_file_base64: str, _mime_type: str) -> str:
    _ensure_client()
    if not _file_base64:
        raise AIServiceError("No file data provided for text extraction")
    if _mime_type in {
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }:
        return (
            "Error: Microsoft Word files (.doc, .docx) are not directly supported for text extraction. "
            "Please convert the file to a PDF or a plain text (.txt) file and upload again."
        )

    prompt = TEXT_EXTRACTION_PROMPT

    def _extract_sync() -> str:
        client = _get_client()
        file_bytes = base64.b64decode(_file_base64)
        file_part = types.Part.from_bytes(data=file_bytes, mime_type=_mime_type)
        response = client.models.generate_content(
            model=DEFAULT_TEXT_MODEL,
            contents=[prompt, file_part],
        )
        return (response.text or "").strip() or "(AI could not extract text from the file or the file is empty)"

    try:
        return await anyio.to_thread.run_sync(_extract_sync)
    except Exception as error:
        raise AIServiceError(f"Error extracting text from file: {error}") from error
