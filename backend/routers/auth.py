"""
Auth router — register, login, /me
Uses in-memory store + bcrypt + JWT.
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, USERS_DB

router  = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer()

# Seed default demo account in USERS_DB
if "demo@contextiq.ai" not in USERS_DB:
    USERS_DB["demo@contextiq.ai"] = {
        "id":              "demo_user",
        "email":           "demo@contextiq.ai",
        "full_name":       "Demo User",
        "hashed_password": pwd_ctx.hash("Demo123!"),
    }


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str
    email:     EmailStr
    password:  str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:        str
    email:     str
    full_name: str

class AuthResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None or email not in USERS_DB:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return USERS_DB[email]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    if req.email in USERS_DB:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    if len(req.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    user_record = {
        "id":              str(uuid.uuid4()),
        "email":           req.email,
        "full_name":       req.full_name,
        "hashed_password": hash_password(req.password),
    }
    USERS_DB[req.email] = user_record

    token = create_token({"sub": req.email})
    user_out = UserOut(id=user_record["id"], email=req.email, full_name=req.full_name)
    return AuthResponse(access_token=token, user=user_out)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user_record = USERS_DB.get(req.email)
    if not user_record or not verify_password(req.password, user_record["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token    = create_token({"sub": req.email})
    user_out = UserOut(id=user_record["id"], email=req.email, full_name=user_record["full_name"])
    return AuthResponse(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
    )
