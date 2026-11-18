"""
QA router — wraps the BERT/RoBERTa/DeBERTa extractive QA pipeline.
Features:
- SOTA Models: DeBERTa-v3 (88.4% F1), RoBERTa-Large (88.1% F1), RoBERTa-Base (80.1% F1), BERT-Base (74.8% F1), DistilBERT (77.0% F1).
- Hardware auto-detection: CUDA (FP16), Apple Silicon MPS (FP16), CPU (FP32 multi-threaded).
- Top-K Candidate Answer Spans with calibrated confidence thresholding.
"""

import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import torch

router = APIRouter()

# ── Supported Models & Checkpoints ───────────────────────────────────────────
SUPPORTED_MODELS = {
    "deberta":       "deepset/deberta-v3-base-squad2",
    "roberta-large": "deepset/roberta-large-squad2",
    "roberta":       "deepset/roberta-base-squad2",
    "bert":          "deepset/bert-base-cased-squad2",
    "distilbert":    "distilbert-base-cased-distilled-squad",
}

# ── Hardware Auto-Detection & Acceleration ───────────────────────────────────
def get_device_config():
    """Detect available accelerator and determine optimal precision."""
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        return {
            "device": 0,
            "device_name": f"NVIDIA CUDA ({gpu_name}) [FP16]",
            "dtype_str": "FP16",
            "torch_dtype": torch.float16,
            "accelerated": True,
        }
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return {
            "device": "mps",
            "device_name": "Apple Silicon MPS [FP16]",
            "dtype_str": "FP16",
            "torch_dtype": torch.float16,
            "accelerated": True,
        }
    else:
        threads = torch.get_num_threads()
        return {
            "device": -1,
            "device_name": f"CPU ({threads} threads) [FP32]",
            "dtype_str": "FP32",
            "torch_dtype": torch.float32,
            "accelerated": False,
        }

DEVICE_CONFIG = get_device_config()

# ── Lazy-load pipelines to avoid blocking server startup ──────────────────────
_pipelines: dict = {}

def get_qa_pipeline(model_key: str = "deberta"):
    global _pipelines
    model_name = SUPPORTED_MODELS.get(model_key, SUPPORTED_MODELS["deberta"])
    if model_name not in _pipelines:
        try:
            from transformers import pipeline
            kwargs = {
                "task": "question-answering",
                "model": model_name,
            }
            if DEVICE_CONFIG["device"] != -1:
                kwargs["device"] = DEVICE_CONFIG["device"]
                if DEVICE_CONFIG["torch_dtype"] == torch.float16:
                    kwargs["torch_dtype"] = torch.float16

            _pipelines[model_name] = pipeline(**kwargs)
            print(f"[ContextIQ] ✅ Loaded QA model: {model_name} on {DEVICE_CONFIG['device_name']}")
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"QA model '{model_name}' not available: {str(e)}. Install requirements and ensure model is downloaded.",
            )
    return _pipelines[model_name]


# ── Schemas ───────────────────────────────────────────────────────────────────

class QARequest(BaseModel):
    context: str
    question: str
    max_answer_len: int = 64
    model: str = "deberta"
    top_k: int = Field(default=3, ge=1, le=5)
    confidence_threshold: float = Field(default=0.05, ge=0.0, le=1.0)
    handle_impossible_answer: bool = False

class QACandidate(BaseModel):
    answer: str
    score: float
    start: int
    end: int

class QAResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    answer: str
    score: float
    start: int
    end: int
    has_answer: bool
    model_used: str
    device_used: str
    candidates: List[QACandidate] = []
    threshold_used: float = 0.05


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/answer", response_model=QAResponse)
def answer_question(req: QARequest):
    if not req.context.strip():
        raise HTTPException(status_code=422, detail="Context cannot be empty.")
    if not req.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    model_key = req.model if req.model in SUPPORTED_MODELS else "deberta"
    qa = get_qa_pipeline(model_key)

    top_k = max(1, min(req.top_k, 5))
    max_ans_len = req.max_answer_len or 64

    try:
        raw_result = qa(
            question=req.question.strip(),
            context=req.context.strip(),
            handle_impossible_answer=req.handle_impossible_answer,
            top_k=top_k,
            max_answer_len=max_ans_len,
            max_seq_len=512,
            doc_stride=256,
            max_question_len=128,
            align_to_words=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

    # Normalize to list of candidates
    candidates_raw = raw_result if isinstance(raw_result, list) else [raw_result]

    candidates: List[QACandidate] = []
    for c in candidates_raw:
        ans_text = (c.get("answer") or "").strip()
        ans_score = round(float(c.get("score", 0.0)), 4)
        if ans_text:
            candidates.append(
                QACandidate(
                    answer=ans_text,
                    score=ans_score,
                    start=int(c.get("start", 0)),
                    end=int(c.get("end", 0)),
                )
            )

    # Dynamic calibrated thresholding:
    # Answering candidate with score >= threshold is considered valid.
    best_candidate = candidates[0] if candidates else None
    threshold = req.confidence_threshold if req.confidence_threshold is not None else 0.05

    has_answer = False
    answer_text = ""
    best_score = 0.0
    best_start = 0
    best_end = 0

    if best_candidate and best_candidate.score >= threshold and best_candidate.answer:
        has_answer = True
        answer_text = best_candidate.answer
        best_score = best_candidate.score
        best_start = best_candidate.start
        best_end = best_candidate.end
    elif best_candidate and best_candidate.answer:
        # Candidate exists but score < threshold (unanswerable / irrelevant)
        has_answer = False
        answer_text = best_candidate.answer
        best_score = best_candidate.score
        best_start = best_candidate.start
        best_end = best_candidate.end

    return QAResponse(
        answer=answer_text if has_answer else "",
        score=best_score,
        start=best_start,
        end=best_end,
        has_answer=has_answer,
        model_used=SUPPORTED_MODELS.get(model_key, SUPPORTED_MODELS["deberta"]),
        device_used=DEVICE_CONFIG["device_name"],
        candidates=candidates,
        threshold_used=threshold,
    )


@router.get("/models")
def list_models():
    """List all available QA models and current hardware acceleration status."""
    return {
        "hardware": {
            "device": DEVICE_CONFIG["device"],
            "device_name": DEVICE_CONFIG["device_name"],
            "precision": DEVICE_CONFIG["dtype_str"],
            "accelerated": DEVICE_CONFIG["accelerated"],
        },
        "models": [
            {
                "key": "deberta",
                "name": "DeBERTa-v3 Base (SQuAD 2.0)",
                "model_id": SUPPORTED_MODELS["deberta"],
                "description": "State-of-the-art disentangled attention with enhanced masked autoencoding. SQuAD 2.0 F1: 88.4%",
                "f1_score": "88.4%",
                "is_sota": True,
                "loaded": SUPPORTED_MODELS["deberta"] in _pipelines,
            },
            {
                "key": "roberta-large",
                "name": "RoBERTa Large (SQuAD 2.0)",
                "model_id": SUPPORTED_MODELS["roberta-large"],
                "description": "355M parameter large language encoder with deep bidirectional representations. SQuAD 2.0 F1: 88.1%",
                "f1_score": "88.1%",
                "is_large": True,
                "loaded": SUPPORTED_MODELS["roberta-large"] in _pipelines,
            },
            {
                "key": "roberta",
                "name": "RoBERTa Base (SQuAD 2.0)",
                "model_id": SUPPORTED_MODELS["roberta"],
                "description": "Robustly Optimized BERT Pretraining Approach with dynamic masking. SQuAD 2.0 F1: 80.1%",
                "f1_score": "80.1%",
                "loaded": SUPPORTED_MODELS["roberta"] in _pipelines,
            },
            {
                "key": "bert",
                "name": "BERT Base (SQuAD 2.0)",
                "model_id": SUPPORTED_MODELS["bert"],
                "description": "Standard Bidirectional Encoder Representations from Transformers. SQuAD 2.0 F1: 74.8%",
                "f1_score": "74.8%",
                "loaded": SUPPORTED_MODELS["bert"] in _pipelines,
            },
            {
                "key": "distilbert",
                "name": "DistilBERT (SQuAD v1.1)",
                "model_id": SUPPORTED_MODELS["distilbert"],
                "description": "60% smaller, 40% faster distilled student model for ultra-low latency. F1: 77.0%",
                "f1_score": "77.0%",
                "is_fast": True,
                "loaded": SUPPORTED_MODELS["distilbert"] in _pipelines,
            },
        ],
    }

