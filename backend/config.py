"""
Application configuration — loads from .env file.
Copy .env.example to .env and fill in your credentials.
"""
import os
from dotenv import load_dotenv

ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(ENV_PATH)

SECRET_KEY                  = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# ── OAuth Credentials ─────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def reload_config():
    """Reload environment variables from .env file into module globals."""
    global GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, FRONTEND_URL, SECRET_KEY
    load_dotenv(ENV_PATH, override=True)
    SECRET_KEY           = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
    GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
    FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

def is_credential_configured(val: str) -> bool:
    if not val:
        return False
    val = val.strip()
    return not (val.startswith("YOUR_") or val == "" or "placeholder" in val.lower())

def is_google_configured() -> bool:
    """A real Google Cloud OAuth Client ID ends with .apps.googleusercontent.com and cannot be an email address."""
    if not is_credential_configured(GOOGLE_CLIENT_ID) or not is_credential_configured(GOOGLE_CLIENT_SECRET):
        return False
    cid = GOOGLE_CLIENT_ID.strip()
    if "@" in cid or not cid.endswith(".apps.googleusercontent.com"):
        return False
    return True

def is_github_configured() -> bool:
    """A real GitHub OAuth Client ID is typically an alphanumeric ID (e.g. Ov23li... or Iv1....) and cannot be an email address."""
    if not is_credential_configured(GITHUB_CLIENT_ID) or not is_credential_configured(GITHUB_CLIENT_SECRET):
        return False
    cid = GITHUB_CLIENT_ID.strip()
    if "@" in cid or len(cid) < 15:
        return False
    return True

def get_preferred_email(provider: str = "google") -> str:
    """If user entered their email in .env, use it; otherwise fallback to prakashbhattacharya102@gmail.com."""
    if provider == "google" and "@" in GOOGLE_CLIENT_ID:
        return GOOGLE_CLIENT_ID.strip()
    if provider == "github" and "@" in GITHUB_CLIENT_ID:
        return GITHUB_CLIENT_ID.strip()
    return "prakashbhattacharya102@gmail.com"

# In-memory user store (replace with a real DB in production)
# Structure: { email: { id, email, full_name, hashed_password, provider? } }
USERS_DB: dict = {}

