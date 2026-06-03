from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from models.schemas import AnalysisResponse, StageListResponse, StageResponse, RoleListResponse
from services.analysis_service import analyze_attempt
from services.stage_service import get_stage_by_id, load_stages, load_roles
from services.transcription_service import transcribe_audio

router = APIRouter(tags=["speakpro"])


@router.get("/stages", response_model=StageListResponse)
def list_stages(role: str | None = Query(default=None)) -> StageListResponse:
    return StageListResponse(stages=load_stages())


@router.get("/roles", response_model=RoleListResponse)
def list_roles() -> RoleListResponse:
    return RoleListResponse(roles=load_roles())


@router.get("/stages/{stage_id}", response_model=StageResponse)
def get_stage(stage_id: int, role: str | None = Query(default=None)) -> StageResponse:
    try:
        return StageResponse(stage=get_stage_by_id(stage_id))
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(
    stage_id: int = Form(...),
    role: str | None = Form(default=None),
    duration_seconds: float | None = Form(default=None),
    audio: UploadFile = File(...),
) -> AnalysisResponse:
    try:
        stage = get_stage_by_id(stage_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    suffix = Path(audio.filename or "attempt.webm").suffix or ".webm"
    temp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file_path = temp_file.name
            content = await audio.read()
            temp_file.write(content)

        transcription = transcribe_audio(temp_file_path)
        if role:
            stage.role = role
        result = analyze_attempt(
            stage=stage,
            transcript=transcription["transcript"],
            words=transcription["words"],
            duration_seconds=duration_seconds or transcription["duration"],
        )
        return result
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {error}") from error
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
