"""
ContextIQ — FastAPI Backend
Provides auth endpoints and the BERT/RoBERTa-based QA inference endpoint.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from routers import auth, qa, oauth, documents, summarize, url_fetch, bulk_qa

# ── Rate Limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="ContextIQ API",
    description="BERT/RoBERTa-based extractive Question Answering — SQuAD 2.0",
    version="2.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup: warm up both QA models ───────────────────────────────────────────
@app.on_event("startup")
async def warmup_models():
    """Pre-load the SOTA DeBERTa pipeline on startup so first user query is instant."""
    try:
        from routers.qa import get_qa_pipeline
        get_qa_pipeline("deberta")
        print("[ContextIQ] ✅ DeBERTa-v3 SOTA QA model warm-up complete.")
    except Exception as e:
        print(f"[ContextIQ] ⚠️  QA model warm-up skipped: {e}")


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",       tags=["auth"])
app.include_router(oauth.router,     prefix="/auth/oauth", tags=["oauth"])
app.include_router(qa.router,        prefix="/qa",         tags=["qa"])
app.include_router(documents.router, prefix="/documents",  tags=["documents"])
app.include_router(summarize.router, prefix="/summarize",  tags=["summarize"])
app.include_router(url_fetch.router, prefix="/url",        tags=["url"])
app.include_router(bulk_qa.router,   prefix="/bulk",       tags=["bulk"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ContextIQ API", "version": "2.0.0"}


@app.post("/save-animation")
async def save_animation(request: Request, filename: str):
    body = await request.body()
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "animations"))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, filename)
    with open(out_path, "wb") as f:
        f.write(body)
    return {"status": "ok", "filename": filename, "size": len(body), "path": out_path}
