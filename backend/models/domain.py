from datetime import UTC, datetime

from sqlalchemy import Column, String, Float, Boolean, JSON, DateTime
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class DoctorUser(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class PatientReport(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Demographics
    patient_id = Column(String, index=True)
    patient_name = Column(String)
    patient_age = Column(String)
    patient_gender = Column(String)
    
    # Analysis
    organ_type = Column(String)
    probability_score = Column(Float)
    confidence_band = Column(JSON)  # List[float]
    triage_level = Column(String)
    model_source = Column(String)
    
    # Reasoning
    reasoning_trace = Column(String)
    risk_summary = Column(String)
    doctor_explanation = Column(String)
    patient_explanation = Column(String)
    triage_recommendation = Column(String)
    differential_hints = Column(JSON)  # List[str]
    confidence_note = Column(String)
    
    # Audit
    audit_flags = Column(JSON)  # List[str]
    audit_passed = Column(Boolean)
    
    # Image (optional, save base64 string or S3 URL later)
    heatmap_base64 = Column(String, nullable=True)
