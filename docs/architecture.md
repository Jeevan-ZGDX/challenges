# SpeakPro Challenge Architecture

## Overview

SpeakPro Challenge is structured as a decoupled MVP with a Next.js frontend and a FastAPI backend.

- **Frontend** handles recording, UI, progress tracking, gamification, and local analytics persistence.
- **Backend** handles stage delivery, audio transcription, scoring, and AI coaching analysis.

## Frontend

### Stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion

### Responsibilities
- Render the dashboard, challenge page, and analysis page
- Capture microphone audio with `MediaRecorder`
- Send recorded audio to the backend for analysis
- Save attempts and unlock progression in `localStorage`
- Display charts, weak-word insights, and stage state

### Client Storage
Progress is stored under a localStorage key:

- `highestUnlockedStage`
- `bestScore`
- `totalAttempts`
- `completionPercentage`
- `attempts`
- `weakWords`
- `stageStats`
- `latestAnalysis`

## Backend

### Stack
- FastAPI
- Python 3.12
- Faster-Whisper

### Responsibilities
- Serve stage metadata from `backend/stages/stages.json`
- Accept uploaded microphone audio
- Transcribe speech locally using Faster-Whisper on CPU
- Compare transcription against the reference paragraph
- Generate accuracy, pronunciation, fluency, confidence, and reading-speed metrics
- Return professional coaching suggestions

### API Endpoints
- `GET /health`
- `GET /api/stages`
- `GET /api/stages/{stage_id}`
- `POST /api/analyze`

## Scoring Model

Final score weighting:

- Accuracy: 40%
- Pronunciation: 30%
- Fluency: 20%
- Confidence: 10%

Unlock rule:

- Score must be **95 or higher**

## Analysis Heuristics

### Accuracy
- Normalized token comparison
- Word Error Rate
- Missing words
- Extra words
- Repeated words

### Pronunciation
- Flags difficult technical words
- Uses token replacements and low-confidence word probabilities
- Adds syllable-based coaching suggestions

### Fluency
- Detects long pauses using word timestamps
- Detects repetitions and filler words
- Produces a fluency score from 0–100

### Confidence
- Combines continuity, pause density, fillers, average confidence, and timing consistency

## Tradeoffs for MVP

This build is designed for rapid stakeholder demos and local execution:

- Pronunciation analysis is heuristic rather than phoneme-level
- Real-time streaming is simulated through fast upload + inference after recording
- Charts are rendered using lightweight SVG components instead of external chart libraries

These choices keep the MVP simple, CPU-friendly, and easy to run in one day.
