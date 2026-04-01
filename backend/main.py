import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routers import analyze
from routers.report import router as report_router
from routers.cases import router as cases_router
from routers.auth import router as auth_router, get_password_hash
from database import engine, SessionLocal
from models.domain import Base, DoctorUser

DEFAULT_LOCAL_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}

def seed_default_doctor():
    app_env = os.getenv("APP_ENV", "development").lower()
    username = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
    password = os.getenv("DEFAULT_ADMIN_PASSWORD")

    if not password and app_env in {"development", "dev", "local"}:
        password = "password123"

    if not password:
        return

    db = SessionLocal()
    try:
        admin_user = db.query(DoctorUser).filter(DoctorUser.username == username).first()
        if admin_user:
            return
        db.add(DoctorUser(username=username, hashed_password=get_password_hash(password)))
        db.commit()
    finally:
        db.close()


def initialize_database():
    Base.metadata.create_all(bind=engine)
    seed_default_doctor()


def parse_allowed_origins():
    origins = set(DEFAULT_LOCAL_ORIGINS)
    single_origin = os.getenv("FRONTEND_URL")
    if single_origin:
        origins.add(single_origin)

    multi_origin = os.getenv("FRONTEND_URLS", "")
    for origin in multi_origin.split(","):
        cleaned = origin.strip()
        if cleaned:
            origins.add(cleaned)

    return sorted(origins)


def database_available():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


def create_app():
    app = FastAPI(
        title="OncoDetect API",
        description="Multi-organ cancer triage AI — powered by Llama 3.3 70B",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=parse_allowed_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

    app.include_router(auth_router, prefix="/api")
    app.include_router(analyze.router)
    app.include_router(report_router, prefix="/api/report")
    app.include_router(cases_router, prefix="/api")

    @app.get("/")
    async def root():
        return {"status": "OncoDetect API is running", "stage": 1}

    @app.get("/api/health")
    async def health(response: Response):
        db_ok = database_available()
        if not db_ok:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "ok" if db_ok else "degraded",
            "database": "up" if db_ok else "down",
            "environment": os.getenv("APP_ENV", "development").lower(),
            "llmConfigured": bool(os.getenv("GROQ_API_KEY")),
            "defaultAdminConfigured": bool(os.getenv("DEFAULT_ADMIN_PASSWORD")) or os.getenv("APP_ENV", "development").lower() in {"development", "dev", "local"},
            "allowedOrgans": ["brain", "lung", "breast"],
        }

    return app


app = create_app()
