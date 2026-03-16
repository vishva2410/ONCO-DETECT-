import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze
from routers.report import router as report_router

app = FastAPI(
    title="OncoDetect API",
    description="Multi-organ cancer triage AI — powered by Llama 3.3 70B",
    version="1.0.0"
)

# CORS — allow local dev + production frontend
allowed_origins = ["http://localhost:5173"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Routers
app.include_router(analyze.router)
app.include_router(report_router, prefix="/api/report")


@app.get("/")
async def root():
    return {"status": "OncoDetect API is running", "stage": 1}
