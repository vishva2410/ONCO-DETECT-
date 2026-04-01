import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze
from routers.report import router as report_router
from routers.cases import router as cases_router
from routers.auth import router as auth_router, get_password_hash
from database import engine, SessionLocal
from models.domain import Base, DoctorUser

# Initialize Database tables
Base.metadata.create_all(bind=engine)

# Seed default doctor
db = SessionLocal()
admin_user = db.query(DoctorUser).filter(DoctorUser.username == "admin").first()
if not admin_user:
    db.add(DoctorUser(username="admin", hashed_password=get_password_hash("password123")))
    db.commit()
elif not admin_user.hashed_password.startswith("pbkdf2_sha256$"):
    admin_user.hashed_password = get_password_hash("password123")
    db.commit()
db.close()

app = FastAPI(
    title="OncoDetect API",
    description="Multi-organ cancer triage AI — powered by Llama 3.3 70B",
    version="1.0.0"
)

# CORS — allow all for portfolio deployment flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Routers
app.include_router(auth_router, prefix="/api")
app.include_router(analyze.router)
app.include_router(report_router, prefix="/api/report")
app.include_router(cases_router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "OncoDetect API is running", "stage": 1}
