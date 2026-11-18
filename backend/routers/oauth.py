"""
OAuth router — Google & GitHub Authorization Code Flow.
Supports both Live Mode (real Google & GitHub OAuth) and Sandbox Mode (seamless 1-click test flow).

Flow:
  1. Frontend navigates to /api/auth/oauth/{provider}/redirect
  2. If live credentials configured:
       Redirects to provider's official OAuth consent screen.
       Provider redirects back to /auth/oauth/{provider}/callback with ?code=...
       Backend exchanges code for profile, mints JWT, redirects to /oauth-callback.
  3. If in sandbox mode:
       Redirects to /oauth-consent?provider={provider} for authentic account selection,
       which authorizes and redirects to /oauth-callback.
  4. Frontend /oauth-callback stores the JWT and navigates to /dashboard.
"""

import os
import uuid
import json
from urllib.parse import urlencode, quote

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

import config
from routers.auth import create_token

router = APIRouter()

GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/oauth/google/callback"
GITHUB_REDIRECT_URI = "http://localhost:8000/auth/oauth/github/callback"


# ── Status Checks ─────────────────────────────────────────────────────────────

@router.get("/status")
def oauth_status_all():
    """Return status and active mode (live vs sandbox) for both providers."""
    return {
        "google": {
            "configured": config.is_google_configured(),
            "mode": "live" if config.is_google_configured() else "sandbox",
            "preferred_email": config.get_preferred_email("google"),
            "client_id_preview": f"{config.GOOGLE_CLIENT_ID[:8]}..." if config.is_google_configured() else None,
        },
        "github": {
            "configured": config.is_github_configured(),
            "mode": "live" if config.is_github_configured() else "sandbox",
            "preferred_email": config.get_preferred_email("github"),
            "client_id_preview": f"{config.GITHUB_CLIENT_ID[:8]}..." if config.is_github_configured() else None,
        }
    }


@router.get("/google/status")
def google_status():
    """Return status for Google OAuth."""
    return {
        "status": "ready",
        "configured": config.is_google_configured(),
        "mode": "live" if config.is_google_configured() else "sandbox",
        "provider": "google",
    }


@router.get("/github/status")
def github_status():
    """Return status for GitHub OAuth."""
    return {
        "status": "ready",
        "configured": config.is_github_configured(),
        "mode": "live" if config.is_github_configured() else "sandbox",
        "provider": "github",
    }


# ── Credential Management ─────────────────────────────────────────────────────

class SaveCredentialsRequest(BaseModel):
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""


@router.post("/credentials")
def save_credentials(req: SaveCredentialsRequest):
    """Save OAuth credentials directly to backend/.env and reload configuration."""
    env_path = config.ENV_PATH
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

    def update_or_append(file_lines, key, val):
        found = False
        new_lines = []
        for line in file_lines:
            if line.strip().startswith(f"{key}="):
                new_lines.append(f"{key}={val}\n")
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f"{key}={val}\n")
        return new_lines

    if req.google_client_id:
        lines = update_or_append(lines, "GOOGLE_CLIENT_ID", req.google_client_id.strip())
    if req.google_client_secret:
        lines = update_or_append(lines, "GOOGLE_CLIENT_SECRET", req.google_client_secret.strip())
    if req.github_client_id:
        lines = update_or_append(lines, "GITHUB_CLIENT_ID", req.github_client_id.strip())
    if req.github_client_secret:
        lines = update_or_append(lines, "GITHUB_CLIENT_SECRET", req.github_client_secret.strip())

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    config.reload_config()
    return {
        "status": "success",
        "google_configured": config.is_google_configured(),
        "github_configured": config.is_github_configured(),
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _upsert_oauth_user(email: str, full_name: str, provider: str) -> dict:
    """Return existing user or create a new OAuth user record."""
    if email in config.USERS_DB:
        return config.USERS_DB[email]
    record = {
        "id":              str(uuid.uuid4()),
        "email":           email,
        "full_name":       full_name,
        "hashed_password": "",
        "provider":        provider,
    }
    config.USERS_DB[email] = record
    return record


def _build_success_redirect(user_record: dict) -> str:
    """Mint a JWT and build the frontend redirect URL."""
    token = create_token({"sub": user_record["email"]})
    user_payload = json.dumps({
        "id":        user_record["id"],
        "email":     user_record["email"],
        "full_name": user_record["full_name"],
        "provider":  user_record.get("provider", "oauth"),
    })
    params = urlencode({"token": token, "user": user_payload})
    return f"{config.FRONTEND_URL}/oauth-callback?{params}"


def _build_error_redirect(message: str) -> str:
    return f"{config.FRONTEND_URL}/oauth-callback?error={quote(message)}"


# ── Google ────────────────────────────────────────────────────────────────────

@router.get("/google/redirect")
def google_redirect():
    """Redirect to Google's live OAuth consent screen or developer sandbox consent page."""
    if config.is_google_configured():
        params = urlencode({
            "client_id":     config.GOOGLE_CLIENT_ID,
            "redirect_uri":  GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope":         "openid email profile",
            "access_type":   "online",
            "prompt":        "select_account",
        })
        return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")
    else:
        # Developer Sandbox mode
        return RedirectResponse(f"{config.FRONTEND_URL}/oauth-consent?provider=google")


@router.get("/google/callback")
async def google_callback(code: str = "", error: str = ""):
    """Exchange Google auth code for user info and redirect to frontend."""
    if error or not code:
        return RedirectResponse(_build_error_redirect(error or "Google login cancelled."))

    async with httpx.AsyncClient() as client:
        # Exchange code for tokens
        token_data = {
            "code":          code,
            "client_id":     config.GOOGLE_CLIENT_ID.strip(),
            "client_secret": config.GOOGLE_CLIENT_SECRET.strip(),
            "redirect_uri":  GOOGLE_REDIRECT_URI,
            "grant_type":    "authorization_code",
        }
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_res.status_code != 200:
            print(f"[GOOGLE TOKEN ERROR] Status: {token_res.status_code} Response: {token_res.text}")
            try:
                err_json = token_res.json()
                detail = err_json.get("error_description") or err_json.get("error") or token_res.text
            except Exception:
                detail = token_res.text
            return RedirectResponse(_build_error_redirect(f"Google Token Exchange Failed: {detail}"))

        access_token = token_res.json().get("access_token")

        # Fetch user info
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_res.status_code != 200:
            print(f"[GOOGLE USERINFO ERROR] Status: {user_res.status_code} Response: {user_res.text}")
            return RedirectResponse(_build_error_redirect(f"Failed to fetch Google profile: {user_res.text}"))

        info = user_res.json()

    email     = info.get("email", "")
    full_name = info.get("name", info.get("email", "Google User"))

    if not email:
        return RedirectResponse(_build_error_redirect("Google did not return an email address."))

    record = _upsert_oauth_user(email, full_name, "google")
    return RedirectResponse(_build_success_redirect(record))


# ── GitHub ────────────────────────────────────────────────────────────────────

@router.get("/github/redirect")
def github_redirect():
    """Redirect to GitHub's live OAuth consent screen or developer sandbox consent page."""
    if config.is_github_configured():
        params = urlencode({
            "client_id":    config.GITHUB_CLIENT_ID,
            "redirect_uri": GITHUB_REDIRECT_URI,
            "scope":        "read:user user:email",
        })
        return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")
    else:
        # Developer Sandbox mode
        return RedirectResponse(f"{config.FRONTEND_URL}/oauth-consent?provider=github")


@router.get("/github/callback")
async def github_callback(code: str = "", error: str = ""):
    """Exchange GitHub auth code for user info and redirect to frontend."""
    if error or not code:
        return RedirectResponse(_build_error_redirect(error or "GitHub login cancelled."))

    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id":     config.GITHUB_CLIENT_ID,
                "client_secret": config.GITHUB_CLIENT_SECRET,
                "code":          code,
                "redirect_uri":  GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
        if token_res.status_code != 200:
            return RedirectResponse(_build_error_redirect("Failed to exchange GitHub auth code."))

        access_token = token_res.json().get("access_token")
        if not access_token:
            return RedirectResponse(_build_error_redirect("GitHub did not return an access token."))

        gh_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept":        "application/json",
        }

        # Fetch user profile
        user_res = await client.get("https://api.github.com/user", headers=gh_headers)
        if user_res.status_code != 200:
            return RedirectResponse(_build_error_redirect("Failed to fetch GitHub user info."))

        gh_user = user_res.json()

        # Fetch verified email if profile email is null
        email = gh_user.get("email")
        if not email:
            emails_res = await client.get("https://api.github.com/user/emails", headers=gh_headers)
            if emails_res.status_code == 200:
                for em in emails_res.json():
                    if em.get("primary") and em.get("verified"):
                        email = em["email"]
                        break

    if not email:
        return RedirectResponse(_build_error_redirect("GitHub did not return a verified email address."))

    full_name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
    record    = _upsert_oauth_user(email, full_name, "github")
    return RedirectResponse(_build_success_redirect(record))


# ── Sandbox Authorize & Login ─────────────────────────────────────────────────

@router.get("/sandbox/authorize")
def sandbox_authorize(provider: str = "google", email: str = "", name: str = ""):
    """
    Browser redirect authorization for sandbox mode.
    Creates user, mints real JWT, and redirects to frontend /oauth-callback.
    """
    provider = provider.lower()
    if not email:
        email = config.get_preferred_email(provider)

    if not name:
        name = "Prakash Bhattacharya" if "prakash" in email.lower() else (
            "Google User" if provider == "google" else "GitHub User"
        )

    record = _upsert_oauth_user(email=email, full_name=name, provider=provider)
    return RedirectResponse(_build_success_redirect(record))


class SandboxLoginRequest(BaseModel):
    provider: str = "google"
    email: str = ""
    name: str = ""


@router.post("/sandbox/login")
def sandbox_login(req: SandboxLoginRequest):
    """Direct JSON sandbox login for asynchronous frontend calls."""
    provider = req.provider.lower()
    email = req.email.strip() or (
        "prakash.bhattacharya@gmail.com" if provider == "google" else "prakash.bhattacharya@github.com"
    )
    name = req.name.strip() or (
        "Prakash Bhattacharya" if "prakash" in email.lower() else f"{provider.title()} User"
    )

    record = _upsert_oauth_user(email=email, full_name=name, provider=provider)
    token = create_token({"sub": record["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": record["id"],
            "email": record["email"],
            "full_name": record["full_name"],
            "provider": provider,
        }
    }
