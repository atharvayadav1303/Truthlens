from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from pathlib import Path

from services.news_service import fetch_comparison_articles
from services.embedding_service import best_matches
from services.ocr_service import extract_text_from_image
from services.url_extractor import extract_text_from_url
from services.verdict import classify
from config import ARTICLES_TO_COMPARE

app = FastAPI(title="TruthLens AI API")

# Loosen this to your actual frontend origin(s) before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextAnalyzeRequest(BaseModel):
    content: str
    input_type: str = "text"  # "text" | "url"


class AnalyzeResponse(BaseModel):
    claim: str
    credibility_score: float
    verdict: str
    risk_level: str
    explanation: str
    source_used: str
    matched_articles: list


def _run_pipeline(claim_text: str) -> AnalyzeResponse:
    if not claim_text or not claim_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted to analyze.")

    articles, source_used = fetch_comparison_articles(claim_text)
    ranked = best_matches(claim_text, articles, top_k=5)

    top_score = ranked[0]["similarity"] if ranked else 0.0
    verdict_info = classify(top_score)

    return AnalyzeResponse(
        claim=claim_text,
        credibility_score=top_score,
        verdict=verdict_info["verdict"],
        risk_level=verdict_info["risk_level"],
        explanation=verdict_info["explanation"],
        source_used=source_used,
        matched_articles=ranked,
    )


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_text(req: TextAnalyzeRequest):
    """Handles the 'Text Input' and 'News Link' tabs."""
    if req.input_type == "url":
        claim_text = extract_text_from_url(req.content)
    else:
        claim_text = req.content
    return _run_pipeline(claim_text)


@app.post("/api/analyze/image", response_model=AnalyzeResponse)
async def analyze_image(file: UploadFile = File(...)):
    """Handles the 'Screenshot OCR' tab."""
    image_bytes = await file.read()
    claim_text = extract_text_from_image(image_bytes)
    return _run_pipeline(claim_text)


@app.get("/api/health")
def health():
    return {"status": "ok", "articles_per_check": ARTICLES_TO_COMPARE}


FRONTEND_DIST = Path(__file__).resolve().parent / "frontend-dist"
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
