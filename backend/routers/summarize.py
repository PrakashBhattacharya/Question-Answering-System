"""
Summarization router — uses facebook/bart-large-cnn to produce TL;DR summaries.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

_summarizer = None

def get_summarizer():
    global _summarizer
    if _summarizer is None:
        try:
            from transformers import pipeline
            _summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=-1,  # CPU
            )
            print("[ContextIQ] ✅ Summarizer model loaded.")
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Summarization model unavailable: {e}",
            )
    return _summarizer


class SummarizeRequest(BaseModel):
    text: str
    max_length: int = 150
    min_length: int = 40

class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    compression_ratio: float


@router.post("/text", response_model=SummarizeResponse)
def summarize_text(req: SummarizeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty.")
    if len(req.text.split()) < 30:
        raise HTTPException(status_code=422, detail="Text too short to summarize (need at least 30 words).")

    summarizer = get_summarizer()

    try:
        # BART supports up to 1024 tokens; truncate if needed
        words = req.text.split()
        truncated_text = " ".join(words[:900]) if len(words) > 900 else req.text

        result = summarizer(
            truncated_text,
            max_length=req.max_length,
            min_length=req.min_length,
            do_sample=False,
        )
        summary = result[0]["summary_text"]

        return SummarizeResponse(
            summary=summary,
            original_length=len(req.text.split()),
            summary_length=len(summary.split()),
            compression_ratio=round(len(summary.split()) / max(len(req.text.split()), 1), 3),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {e}")
