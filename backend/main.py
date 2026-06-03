from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from api.routes import router

load_dotenv()

app = FastAPI(
    title="SpeakPro Challenge API",
    version="1.0.0",
    description="AI-powered reading and pronunciation assessment backend for enterprise training.",
)

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
