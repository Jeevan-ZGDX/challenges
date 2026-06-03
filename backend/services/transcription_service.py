from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_model() -> WhisperModel:
    model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
    compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    return WhisperModel(model_size, device="cpu", compute_type=compute_type)



def transcribe_audio(audio_path: str) -> dict[str, Any]:
    model = get_model()
    segments, info = model.transcribe(
        audio_path,
        beam_size=1,
        language="en",
        vad_filter=True,
        word_timestamps=True,
    )

    collected_segments: list[dict[str, Any]] = []
    words: list[dict[str, Any]] = []

    for segment in segments:
        segment_words = []
        for word in segment.words or []:
            word_payload = {
                "word": word.word.strip(),
                "start": float(word.start or 0.0),
                "end": float(word.end or 0.0),
                "probability": float(getattr(word, "probability", 0.0) or 0.0),
            }
            segment_words.append(word_payload)
            words.append(word_payload)

        collected_segments.append(
            {
                "start": float(segment.start),
                "end": float(segment.end),
                "text": segment.text.strip(),
                "avg_logprob": float(getattr(segment, "avg_logprob", 0.0) or 0.0),
                "words": segment_words,
            }
        )

    transcript = " ".join(segment["text"] for segment in collected_segments).strip()

    return {
        "transcript": transcript,
        "language": getattr(info, "language", "en"),
        "duration": float(getattr(info, "duration", 0.0) or 0.0),
        "segments": collected_segments,
        "words": words,
    }
