from __future__ import annotations

from statistics import mean, pstdev

from models.schemas import AnalysisResponse, FluencySignals, PronunciationIssue, ReadingSpeed, Stage
from utils.text_utils import (
    TECHNICAL_KEYWORDS,
    classify_wpm,
    compare_tokens,
    detect_fillers,
    normalize_text,
    safe_round,
    syllable_split,
    tokenize,
    word_error_rate,
)


def _long_pause_count(words: list[dict]) -> int:
    pauses = 0
    for index in range(1, len(words)):
        gap = float(words[index].get("start", 0.0)) - float(words[index - 1].get("end", 0.0))
        if gap >= 0.85:
            pauses += 1
    return pauses



def _consistency_score(words: list[dict]) -> float:
    if len(words) < 3:
        return 82.0
    durations = [
        max(0.05, float(word.get("end", 0.0)) - float(word.get("start", 0.0)))
        for word in words
    ]
    variability = pstdev(durations) if len(durations) > 1 else 0.0
    return max(55.0, 100.0 - min(35.0, variability * 120.0))



def _build_pronunciation_issues(
    compare_result: dict,
    low_confidence_words: list[str],
) -> list[PronunciationIssue]:
    issues: list[PronunciationIssue] = []
    seen: set[str] = set()

    for reference, _spoken in compare_result["replaced_pairs"]:
        if reference in seen:
            continue
        if len(reference) >= 8 or reference in TECHNICAL_KEYWORDS:
            issues.append(
                PronunciationIssue(
                    word=reference,
                    status="mispronounced",
                    suggestion=f"Practice syllable separation: {syllable_split(reference)}",
                )
            )
            seen.add(reference)

    for word in compare_result["missing_words"]:
        if word in seen:
            continue
        if len(word) >= 9 or word in TECHNICAL_KEYWORDS:
            issues.append(
                PronunciationIssue(
                    word=word,
                    status="needs_practice",
                    suggestion="Slow down slightly and articulate each syllable clearly.",
                )
            )
            seen.add(word)

    for word in low_confidence_words:
        normalized = normalize_text(word)
        if not normalized or normalized in seen:
            continue
        if len(normalized) >= 7 or normalized in TECHNICAL_KEYWORDS:
            issues.append(
                PronunciationIssue(
                    word=normalized,
                    status="needs_practice",
                    suggestion=f"Repeat the word several times: {syllable_split(normalized)}",
                )
            )
            seen.add(normalized)

    return issues[:8]



def _generate_suggestions(
    compare_result: dict,
    pronunciation_issues: list[PronunciationIssue],
    fluency_signals: FluencySignals,
    reading_speed: ReadingSpeed,
) -> list[str]:
    suggestions: list[str] = []

    if pronunciation_issues:
        lead = pronunciation_issues[0]
        suggestions.append(
            f'You frequently struggled with the word "{lead.word}". Practice it as {syllable_split(lead.word)} before your next attempt.'
        )

    if compare_result["missing_words"]:
        suggestions.append(
            f"You skipped {len(compare_result['missing_words'])} important word(s). Focus on tracking each line carefully while reading."
        )

    if fluency_signals.long_pauses >= 2:
        suggestions.append("Your fluency is affected by long pauses. Try smaller breathing groups to maintain smoother delivery.")

    if fluency_signals.fillers >= 2:
        suggestions.append("Reduce fillers such as 'um' or 'like' by pausing silently instead of speaking while planning the next word.")

    if fluency_signals.repetitions >= 2:
        suggestions.append("You repeated several words. Aim for a steady rhythm and restart only at the end of a sentence if needed.")

    if reading_speed.classification == "Slow":
        suggestions.append("Your pace is slower than the target range. Practice scanning the sentence first, then read with more momentum.")
    elif reading_speed.classification == "Fast":
        suggestions.append("Your pace is fast. Slow down slightly to improve clarity and pronunciation precision.")
    else:
        suggestions.append("Your reading speed is in a healthy range. Keep balancing pace with precise articulation.")

    if not suggestions:
        suggestions.append("Strong attempt overall. Keep refining pronunciation on technical words and maintain consistent pacing.")

    return suggestions[:5]



def analyze_attempt(
    stage: Stage,
    transcript: str,
    words: list[dict],
    duration_seconds: float | None = None,
) -> AnalysisResponse:
    reference_tokens = tokenize(stage.paragraph)
    transcript_tokens = tokenize(transcript)
    normalized_transcript = normalize_text(transcript)

    edits, wer = word_error_rate(reference_tokens, transcript_tokens)
    compare_result = compare_tokens(reference_tokens, transcript_tokens)

    match_percentage = max(0.0, (1 - wer) * 100)
    accuracy_score = max(0.0, min(100.0, match_percentage - min(10.0, len(compare_result["extra_words"]) * 1.5)))

    low_confidence_words = [
        word["word"]
        for word in words
        if normalize_text(word.get("word", "")) and float(word.get("probability", 1.0)) < 0.55
    ]
    avg_confidence = mean([float(word.get("probability", 0.8)) for word in words]) if words else 0.0

    pronunciation_issues = _build_pronunciation_issues(compare_result, low_confidence_words)
    pronunciation_penalty = len(pronunciation_issues) * 4.5 + len(compare_result["replaced_pairs"]) * 1.5
    pronunciation_score = max(0.0, min(100.0, 100.0 - pronunciation_penalty + avg_confidence * 12.0))

    long_pauses = _long_pause_count(words)
    fillers = detect_fillers(transcript_tokens, normalized_transcript)
    repetitions = compare_result["repeated_words"]
    hesitations = max(0, len(fillers) + len(repetitions) // 2)

    fluency_score = max(
        0.0,
        min(
            100.0,
            100.0
            - long_pauses * 7.5
            - len(fillers) * 6.0
            - len(repetitions) * 4.0
            - max(0, edits - 2) * 1.4,
        ),
    )

    continuity_score = max(0.0, 100.0 - long_pauses * 9.0 - len(fillers) * 5.0)
    confidence_score = max(
        0.0,
        min(
            100.0,
            continuity_score * 0.45
            + _consistency_score(words) * 0.25
            + max(50.0, avg_confidence * 100.0) * 0.20
            + max(40.0, accuracy_score) * 0.10,
        ),
    )

    measured_duration = duration_seconds or (words[-1]["end"] if words else 0.0)
    measured_duration = max(1.0, float(measured_duration))
    wpm = len(transcript_tokens) / (measured_duration / 60.0)
    reading_speed = ReadingSpeed(
        wpm=safe_round(wpm),
        classification=classify_wpm(wpm),
    )

    final_score = (
        accuracy_score * 0.40
        + pronunciation_score * 0.30
        + fluency_score * 0.20
        + confidence_score * 0.10
    )

    fluency_signals = FluencySignals(
        long_pauses=long_pauses,
        repetitions=len(repetitions),
        hesitations=hesitations,
        fillers=len(fillers),
    )

    suggestions = _generate_suggestions(compare_result, pronunciation_issues, fluency_signals, reading_speed)

    passed = final_score >= 90.0 and reading_speed.classification != "Slow"

    return AnalysisResponse(
        stage_id=stage.id,
        stage_title=stage.title,
        difficulty=stage.difficulty,
        transcript=transcript.strip(),
        duration_seconds=safe_round(measured_duration),
        accuracy_score=safe_round(accuracy_score),
        pronunciation_score=safe_round(pronunciation_score),
        fluency_score=safe_round(fluency_score),
        confidence_score=safe_round(confidence_score),
        final_score=safe_round(final_score),
        passed=passed,
        word_error_rate=safe_round(wer, 4),
        match_percentage=safe_round(match_percentage),
        reading_speed=reading_speed,
        missing_words=compare_result["missing_words"][:12],
        extra_words=compare_result["extra_words"][:12],
        repeated_words=compare_result["repeated_words"][:8],
        difficult_words=pronunciation_issues,
        fluency_signals=fluency_signals,
        suggestions=suggestions,
        low_confidence_words=[normalize_text(word) for word in low_confidence_words[:10]],
        raw_confidence_average=safe_round(avg_confidence * 100.0),
    )
