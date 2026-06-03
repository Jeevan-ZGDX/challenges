# SpeakPro Challenge
---

SpeakPro Challenge is a production-style MVP for AI-powered English reading and pronunciation assessment designed for corporate employee training.

It combines a modern enterprise dashboard with local progress tracking, staged reading challenges, Faster-Whisper transcription, pronunciation heuristics, fluency analysis, confidence scoring, and professional coaching feedback.

## Features

- 15 progressive speaking stages
- Unlock-next-stage logic at **95%+** score
- Microphone-based audio capture
- Faster-Whisper local inference on CPU
- Accuracy, pronunciation, fluency, confidence, and WPM analysis
- Missing, extra, repeated, and difficult word tracking
- Personalized AI coaching suggestions
- Weak-word tracker
- Accuracy / fluency / confidence trend visualization
- Responsive glassmorphism enterprise UI
- Local progress persistence with `localStorage`
- Dark mode support

## Monorepo Structure

```text
speakpro/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── stages/
│   ├── .env.example
│   ├── main.py
│   └── requirements.txt
├── docs/
│   └── architecture.md
└── README.md
```

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI
- Python 3.12
- Faster-Whisper

## How It Works

1. The user opens the dashboard and selects an unlocked stage.
2. A paragraph is displayed on the challenge page.
3. The user records audio with the microphone.
4. The frontend uploads the audio to FastAPI.
5. Faster-Whisper transcribes the audio locally.
6. The backend compares the transcript with the source paragraph.
7. The system calculates:
   - Accuracy
   - Pronunciation
   - Fluency
   - Confidence
   - Reading speed
8. A final weighted score is returned.
9. If the score is **95 or higher**, the next stage becomes available.
10. The attempt is saved locally and shown in analytics.

## Frontend Setup

```bash
cd speakpro/frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Backend Setup

Use Python 3.12 if possible.

```bash
cd speakpro/backend
python -m venv .venv
source .venv/bin/activate   # macOS / Linux
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

### Backend Environment Variables

```env
WHISPER_MODEL_SIZE=base
WHISPER_COMPUTE_TYPE=int8
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## API Endpoints

### `GET /health`
Simple health check.

### `GET /api/stages`
Returns all 15 challenge stages.

### `GET /api/stages/{stage_id}`
Returns a single stage.

### `POST /api/analyze`
Accepts:
- `stage_id` as form data
- `duration_seconds` as form data
- `audio` file upload

Returns:
- transcript
- score breakdown
- missing / extra / repeated words
- difficult word list
- fluency signals
- WPM classification
- coaching suggestions

## Scoring Formula

```text
Final Score =
  (Accuracy × 0.40) +
  (Pronunciation × 0.30) +
  (Fluency × 0.20) +
  (Confidence × 0.10)
```

### Pass Rule

```text
Score >= 95
```

## Stage Progression

- Levels 1–3: Basic Professional English
- Levels 4–6: Business Communication
- Levels 7–9: Technical Communication
- Levels 10–12: Leadership Communication
- Levels 13–15: Executive Communication

## Notes for Demo Readiness

- Faster-Whisper is configured for local CPU inference.
- The first transcription request may download the selected Whisper model locally, so initial startup can take longer.
- Pronunciation analysis uses practical MVP heuristics based on token mismatch and low-confidence words.
- Progress is intentionally stored in browser local storage for fast demo setup without authentication.
- The UI is optimized for stakeholder presentations and mobile responsiveness.

## Suggested Demo Flow

1. Open dashboard
2. Start Stage 1
3. Record a sample reading
4. Review AI analysis page
5. Highlight weak words and coaching suggestions
6. Return to dashboard to show unlocked progression and trend charts

## Future Enhancements

- Live streaming transcription
- Phoneme-level pronunciation scoring
- Team and manager dashboards
- Multi-user authentication
- Cloud storage for attempt history
- LMS / HR platform integration
- Exportable reports for trainers and managers

## License

MVP demo project for evaluation and internal stakeholder review.
