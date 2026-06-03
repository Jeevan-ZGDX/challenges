from typing import Literal
from pydantic import BaseModel, Field


class Stage(BaseModel):
    id: int
    role: str = "employee"
    difficulty: str
    title: str
    paragraph: str


class RoleOption(BaseModel):
    id: str
    label: str
    description: str | None = None


class RoleListResponse(BaseModel):
    roles: list[RoleOption]


class PronunciationIssue(BaseModel):
    word: str
    status: Literal["mispronounced", "needs_practice"]
    suggestion: str


class FluencySignals(BaseModel):
    long_pauses: int = 0
    repetitions: int = 0
    hesitations: int = 0
    fillers: int = 0


class ReadingSpeed(BaseModel):
    wpm: float
    classification: Literal["Slow", "Normal", "Fast"]


class AnalysisResponse(BaseModel):
    stage_id: int
    stage_title: str
    difficulty: str
    transcript: str
    duration_seconds: float
    accuracy_score: float
    pronunciation_score: float
    fluency_score: float
    confidence_score: float
    final_score: float
    passed: bool
    word_error_rate: float
    match_percentage: float
    reading_speed: ReadingSpeed
    missing_words: list[str] = Field(default_factory=list)
    extra_words: list[str] = Field(default_factory=list)
    repeated_words: list[str] = Field(default_factory=list)
    difficult_words: list[PronunciationIssue] = Field(default_factory=list)
    fluency_signals: FluencySignals
    suggestions: list[str] = Field(default_factory=list)
    low_confidence_words: list[str] = Field(default_factory=list)
    raw_confidence_average: float = 0.0


class StageListResponse(BaseModel):
    stages: list[Stage]


class StageResponse(BaseModel):
    stage: Stage
