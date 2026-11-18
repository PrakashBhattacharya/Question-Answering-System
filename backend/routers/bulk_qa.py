"""
Bulk QA router — run multiple questions against a single context in one request.
Returns CSV-exportable results.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from routers.qa import get_qa_pipeline, SUPPORTED_MODELS

router = APIRouter()


class BulkQAItem(BaseModel):
    question: str

class BulkQARequest(BaseModel):
    context: str
    questions: List[BulkQAItem]
    model: str = "deberta"
    confidence_threshold: float = 0.05
    max_answer_len: int = 64

class BulkQAResult(BaseModel):
    question:   str
    answer:     str
    score:      float
    has_answer: bool
    start:      int
    end:        int

class BulkQAResponse(BaseModel):
    total:     int
    answered:  int
    results:   List[BulkQAResult]


@router.post("/qa", response_model=BulkQAResponse)
def bulk_question_answering(req: BulkQARequest):
    """Run multiple questions against one context in a single API call."""
    if not req.context.strip():
        raise HTTPException(status_code=422, detail="Context cannot be empty.")
    if not req.questions:
        raise HTTPException(status_code=422, detail="At least one question is required.")
    if len(req.questions) > 50:
        raise HTTPException(status_code=422, detail="Maximum 50 questions per bulk request.")

    model_key = req.model if req.model in SUPPORTED_MODELS else "deberta"
    qa = get_qa_pipeline(model_key)

    results = []
    for item in req.questions:
        q = item.question.strip()
        if not q:
            results.append(BulkQAResult(
                question=q, answer="", score=0.0,
                has_answer=False, start=0, end=0
            ))
            continue
        try:
            r = qa(
                question=q,
                context=req.context.strip(),
                handle_impossible_answer=False,
                max_answer_len=req.max_answer_len or 64,
                max_seq_len=512,
                doc_stride=256,
            )
            threshold = req.confidence_threshold if req.confidence_threshold is not None else 0.05
            has_answer = bool(r.get("answer")) and r.get("score", 0) >= threshold
            results.append(BulkQAResult(
                question=q,
                answer=r.get("answer", ""),
                score=round(r.get("score", 0.0), 4),
                has_answer=has_answer,
                start=r.get("start", 0),
                end=r.get("end", 0),
            ))
        except Exception as e:
            results.append(BulkQAResult(
                question=q, answer=f"Error: {str(e)}", score=0.0,
                has_answer=False, start=0, end=0
            ))

    answered = sum(1 for r in results if r.has_answer)
    return BulkQAResponse(total=len(results), answered=answered, results=results)
