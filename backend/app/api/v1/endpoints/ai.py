from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
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

router = APIRouter()


def _handle_ai_error(error: Exception) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(error),
    )


@router.post("/requisition/suggestions", response_model=AISuggestionsResponse)
async def requisition_suggestions(
    payload: AISuggestionsRequest,
    _user=Depends(get_current_user),
):
    try:
        suggestions = await ai_service.suggest_requisition(payload.requisition)
        return AISuggestionsResponse(suggestions=suggestions)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/requisition/priority", response_model=PrioritySuggestionResponse)
async def requisition_priority(
    payload: PrioritySuggestionRequest,
    _user=Depends(get_current_user),
):
    try:
        priority = await ai_service.suggest_priority(payload.role, payload.function)
        return PrioritySuggestionResponse(priority=priority)
    except Exception as error:
        raise _handle_ai_error(error)


@router.get("/dashboard/insights", response_model=DashboardInsightsResponse)
async def dashboard_insights(_user=Depends(get_current_user)):
    try:
        insights = await ai_service.dashboard_insights()
        return DashboardInsightsResponse(insights=insights)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/resume/analysis", response_model=ResumeMatchAnalysis)
async def resume_analysis(
    payload: ResumeAnalysisRequest,
    _user=Depends(get_current_user),
):
    try:
        return await ai_service.resume_analysis(payload.resume_text, payload.job_description)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/candidate-matches", response_model=CandidateMatchResponse)
async def candidate_matches(
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
async def outreach_draft(
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
    try:
        audio = await ai_service.text_to_speech(payload.text)
        return TextToSpeechResponse(audio_base64=audio)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    payload: TranscribeRequest,
    _user=Depends(get_current_user),
):
    try:
        transcript = await ai_service.transcribe_audio(payload.audio_base64, payload.mime_type)
        return TranscribeResponse(transcript=transcript)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/extract-text", response_model=ExtractTextResponse)
async def extract_text(
    payload: ExtractTextRequest,
    _user=Depends(get_current_user),
):
    try:
        text = await ai_service.extract_text_from_file(payload.file_base64, payload.mime_type)
        return ExtractTextResponse(text=text)
    except Exception as error:
        raise _handle_ai_error(error)


@router.post("/debrief-summary", response_model=DebriefSummaryResponse)
async def debrief_summary(
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
