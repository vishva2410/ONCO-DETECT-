import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.domain import DoctorUser
from pydantic import BaseModel

APP_ENV = os.getenv("APP_ENV", "development").lower()
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    if APP_ENV in {"development", "dev", "local"}:
        SECRET_KEY = "ONCODETECT_LOCAL_DEV_SECRET"
    else:
        raise RuntimeError("JWT_SECRET must be set outside development")

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter()

PBKDF2_PREFIX = "pbkdf2_sha256"
PBKDF2_ITERATIONS = 390000


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _legacy_bcrypt_verify(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        return False
    try:
        import bcrypt
    except ImportError:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False

    if hashed_password.startswith(f"{PBKDF2_PREFIX}$"):
        try:
            _, iterations, salt, expected_hash = hashed_password.split("$", 3)
            candidate = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt.encode("utf-8"),
                int(iterations),
            )
            return secrets.compare_digest(_b64url_encode(candidate), expected_hash)
        except (ValueError, TypeError):
            return False

    return _legacy_bcrypt_verify(plain_password, hashed_password)


def get_password_hash(password):
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    )
    return f"{PBKDF2_PREFIX}${PBKDF2_ITERATIONS}${salt}${_b64url_encode(password_hash)}"

def create_access_token(data: dict, expires_delta: timedelta = None):
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    payload.update({"exp": int(expire.timestamp())})

    encoded_payload = _b64url_encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return f"{encoded_payload}.{_b64url_encode(signature)}"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"),
            encoded_payload.encode("ascii"),
            hashlib.sha256,
        ).digest()
        if not secrets.compare_digest(_b64url_encode(expected_signature), encoded_signature):
            raise credentials_exception

        payload = json.loads(_b64url_decode(encoded_payload).decode("utf-8"))
        username: str = payload.get("sub")
        exp = payload.get("exp")
        if username is None or exp is None:
            raise credentials_exception

        if datetime.now(timezone.utc).timestamp() >= float(exp):
            raise credentials_exception
    except (ValueError, json.JSONDecodeError, TypeError):
        raise credentials_exception

    user = db.query(DoctorUser).filter(DoctorUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- Endpoints ---
class RegisterRequest(BaseModel):
    username: str
    password: str

class RegisterResponse(BaseModel):
    message: str
    username: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str


class CurrentUserResponse(BaseModel):
    username: str


@router.post("/auth/register", response_model=RegisterResponse)
def register_doctor(request: RegisterRequest, db: Session = Depends(get_db)):
    db_user = db.query(DoctorUser).filter(DoctorUser.username == request.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(request.password)
    new_user = DoctorUser(username=request.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Doctor registered successfully", "username": new_user.username}

@router.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(DoctorUser).filter(DoctorUser.username == form_data.username).first()
    if (not user) or (not verify_password(form_data.password, user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}


@router.get("/auth/me", response_model=CurrentUserResponse)
def read_current_user(current_user: DoctorUser = Depends(get_current_user)):
    return {"username": current_user.username}
