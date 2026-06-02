from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import get_current_user
from app.core.limiter import limiter
from app.schemas.ai import (
    AISuggestionsRequest,
    AISuggestionsResponse,
    PrioritySuggestionRequest,
    PrioritySuggestionResponse,
    DashboardInsightsResponse,
    ResumeAnalysisRequest,
    ResumeMatchAnalysis,
    CandidateMatchRequest,
    CandidateMatchResponse,
    OutreachDraftRequest,
    OutreachDraftResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    TranscribeRequest,
    TranscribeResponse,
    ExtractTextRequest,
    ExtractTextResponse,
    DebriefSummaryRequest,
    DebriefSummaryResponse,
)
from app.services import ai as ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _handle_ai_error(error: Exception) -> HTTPException:
    if isinstance(error, NotImplementedError):
        return HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(error),
        )
    logger.error("AI service error: %s", error, exc_info=True)
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="AI service temporarily unavailable. Please try again.",
    )


@router.post("/requisition/suggestions", response_model=AISuggestionsResponse)
@limiter.limit("10/minute")
async def requisition_suggestions(
    request: Request,
    payload: AISuggestionsRequest,
    _user=Depends(get_current_user),
):
    try:
        suggestions = await ai_service.suggest_requisition(payload.requisition)
        return AISuggestionsResponse(suggestions=suggestions)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/requisition/priority", response_model=PrioritySuggestionResponse)
@limiter.limit("10/minute")
async def requisition_priority(
    request: Request,
    payload: PrioritySuggestionRequest,
    _user=Depends(get_current_user),
):
    try:
        priority = await ai_service.suggest_priority(payload.role, payload.function)
        return PrioritySuggestionResponse(priority=priority)
    except Exception as error:
        raise _handle_ai_error(error)


@router.get("/dashboard/insights", response_model=DashboardInsightsResponse)
@limiter.limit("10/minute")
async def dashboard_insights(request: Request, _user=Depends(get_current_user)):
    try:
        insights = await ai_service.dashboard_insights()
        return DashboardInsightsResponse(insights=insights)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/resume/analysis", response_model=ResumeMatchAnalysis)
@limiter.limit("10/minute")
async def resume_analysis(
    request: Request,
    payload: ResumeAnalysisRequest,
    _user=Depends(get_current_user),
):
    try:
        return await ai_service.resume_analysis(payload.resume_text, payload.job_description)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/candidate-matches", response_model=CandidateMatchResponse)
@limiter.limit("10/minute")
async def candidate_matches(
    request: Request,
    payload: CandidateMatchRequest,
    _user=Depends(get_current_user),
):
    try:
        candidates = [candidate.model_dump() for candidate in payload.candidates]
        matches = await ai_service.candidate_matches(payload.requisition, candidates)
        return CandidateMatchResponse(matches=matches)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/outreach/draft", response_model=OutreachDraftResponse)
@limiter.limit("10/minute")
async def outreach_draft(
    request: Request,
    payload: OutreachDraftRequest,
    _user=Depends(get_current_user),
):
    try:
        draft = await ai_service.outreach_draft(
            payload.candidate.model_dump(),
            payload.requisition,
            payload.tone,
        )
        return OutreachDraftResponse(draft=draft)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(
    payload: TextToSpeechRequest,
    _user=Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Text-to-speech is not yet implemented.",
    )


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    payload: TranscribeRequest,
    _user=Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Audio transcription is not yet implemented.",
    )


@router.post("/extract-text", response_model=ExtractTextResponse)
@limiter.limit("10/minute")
async def extract_text(
    request: Request,
    payload: ExtractTextRequest,
    _user=Depends(get_current_user),
):
    try:
        text = await ai_service.extract_text_from_file(payload.file_base64, payload.mime_type)
        return ExtractTextResponse(text=text)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/debrief-summary", response_model=DebriefSummaryResponse)
@limiter.limit("10/minute")
async def debrief_summary(
    request: Request,
    payload: DebriefSummaryRequest,
    _user=Depends(get_current_user),
):
    try:
        summary = await ai_service.debrief_summary(
            payload.requisition,
            [item.model_dump() for item in payload.interviews],
        )
        return DebriefSummaryResponse(summary=summary)
    except Exception as error:
        raise _handle_ai_error(error)
