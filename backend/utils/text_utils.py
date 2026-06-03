import math
import re
from collections import Counter
from difflib import SequenceMatcher

FILLERS = {"um", "uh", "ah", "like", "basically"}
MULTI_FILLERS = {"you know"}
TECHNICAL_KEYWORDS = {
    "architecture",
    "infrastructure",
    "governance",
    "analytics",
    "stakeholders",
    "cybersecurity",
    "transformation",
    "compliance",
    "innovation",
    "resilience",
    "cross-functional",
    "implementation",
    "optimization",
    "productivity",
    "accountability",
    "escalation",
    "prioritization",
    "confidentiality",
}


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s']", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()



def tokenize(text: str) -> list[str]:
    normalized = normalize_text(text)
    return [token for token in normalized.split(" ") if token]



def syllable_split(word: str) -> str:
    word = word.lower()
    chunks = re.findall(r"[^aeiouy]*[aeiouy]+(?:[^aeiouy]|$)", word)
    if not chunks:
        return word
    return "-".join(chunk.strip() for chunk in chunks if chunk.strip())



def word_error_rate(reference_tokens: list[str], hypothesis_tokens: list[str]) -> tuple[int, float]:
    rows = len(reference_tokens) + 1
    cols = len(hypothesis_tokens) + 1
    dp = [[0 for _ in range(cols)] for _ in range(rows)]

    for i in range(rows):
        dp[i][0] = i
    for j in range(cols):
        dp[0][j] = j

    for i in range(1, rows):
        for j in range(1, cols):
            if reference_tokens[i - 1] == hypothesis_tokens[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1,
                )

    edits = dp[-1][-1]
    wer = edits / max(1, len(reference_tokens))
    return edits, wer



def compare_tokens(reference_tokens: list[str], hypothesis_tokens: list[str]) -> dict:
    matcher = SequenceMatcher(a=reference_tokens, b=hypothesis_tokens)
    missing_words: list[str] = []
    extra_words: list[str] = []
    replaced_pairs: list[tuple[str, str]] = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "delete":
            missing_words.extend(reference_tokens[i1:i2])
        elif tag == "insert":
            extra_words.extend(hypothesis_tokens[j1:j2])
        elif tag == "replace":
            ref_slice = reference_tokens[i1:i2]
            hyp_slice = hypothesis_tokens[j1:j2]
            shared = min(len(ref_slice), len(hyp_slice))
            for index in range(shared):
                replaced_pairs.append((ref_slice[index], hyp_slice[index]))
            if len(ref_slice) > shared:
                missing_words.extend(ref_slice[shared:])
            if len(hyp_slice) > shared:
                extra_words.extend(hyp_slice[shared:])

    repeated_words = [
        hypothesis_tokens[index]
        for index in range(1, len(hypothesis_tokens))
        if hypothesis_tokens[index] == hypothesis_tokens[index - 1]
    ]

    return {
        "missing_words": missing_words,
        "extra_words": extra_words,
        "replaced_pairs": replaced_pairs,
        "repeated_words": list(dict.fromkeys(repeated_words)),
    }



def detect_fillers(tokens: list[str], normalized_text: str) -> list[str]:
    found = [token for token in tokens if token in FILLERS]
    for multi in MULTI_FILLERS:
        if multi in normalized_text:
            found.append(multi)
    return found



from typing import Literal

ReadingSpeedClassification = Literal["Slow", "Normal", "Fast"]

def classify_wpm(wpm: float) -> ReadingSpeedClassification:
    if wpm < 90:
        return "Slow"
    if wpm <= 140:
        return "Normal"
    return "Fast"



def safe_round(value: float, places: int = 2) -> float:
    if math.isnan(value) or math.isinf(value):
        return 0.0
    return round(value, places)



def most_common(items: list[str], limit: int = 5) -> list[tuple[str, int]]:
    return Counter(items).most_common(limit)
