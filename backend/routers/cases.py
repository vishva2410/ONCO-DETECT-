from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.domain import PatientReport, DoctorUser
from routers.auth import get_current_user
import json

router = APIRouter()

@router.post("/reports", response_model=dict)
def save_report(
    data: dict, 
    db: Session = Depends(get_db),
    current_user: DoctorUser = Depends(get_current_user)
):
    """Saves a generated analysis report to the database."""
    try:
        new_report = PatientReport(
            patient_id=data.get("patient_id", "ANON"),
            patient_name=data.get("patient_name", "Unknown Patient"),
            patient_age=str(data.get("patient_age", "")),
            patient_gender=data.get("patient_gender", ""),
            organ_type=data.get("organ_type", "lung"),
            probability_score=data.get("probability_score", 0.0),
            confidence_band=data.get("confidence_band", []),
            triage_level=data.get("triage_level", "low"),
            model_source=data.get("model_source", "resnet50"),
            reasoning_trace=data.get("reasoning_trace", ""),
            risk_summary=data.get("risk_summary", ""),
            doctor_explanation=data.get("doctor_explanation", ""),
            patient_explanation=data.get("patient_explanation", ""),
            triage_recommendation=data.get("triage_recommendation", ""),
            differential_hints=data.get("differential_hints", []),
            confidence_note=data.get("confidence_note", ""),
            audit_flags=data.get("audit_flags", []),
            audit_passed=data.get("audit_passed", True),
            heatmap_base64=data.get("heatmap_base64", None)
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return {"status": "success", "report_id": new_report.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports", response_model=list)
def get_history(
    limit: int = 50, 
    db: Session = Depends(get_db),
    current_user: DoctorUser = Depends(get_current_user)
):
    """Fetches the recent case history."""
    reports = db.query(PatientReport).order_by(PatientReport.created_at.desc()).limit(limit).all()
    # Serialize complex types
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "patient_name": r.patient_name,
            "patient_id": r.patient_id,
            "organ_type": r.organ_type,
            "triage_level": r.triage_level,
            "probability_score": r.probability_score
        }
        for r in reports
    ]

@router.get("/reports/{report_id}", response_model=dict)
def get_report(
    report_id: str, 
    db: Session = Depends(get_db),
    current_user: DoctorUser = Depends(get_current_user)
):
    """Fetches a specific full report by ID."""
    report = db.query(PatientReport).filter(PatientReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Return as dict matching the frontend's expected structure
    return {
        "id": report.id,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "patientName": report.patient_name,
        "patientAge": report.patient_age,
        "patientGender": report.patient_gender,
        "organType": report.organ_type,
        "probabilityScore": report.probability_score,
        "confidenceBand": report.confidence_band,
        "triageLevel": report.triage_level,
        "modelSource": report.model_source,
        "reasoningTrace": report.reasoning_trace,
        "riskSummary": report.risk_summary,
        "doctorExplanation": report.doctor_explanation,
        "patientExplanation": report.patient_explanation,
        "triageRecommendation": report.triage_recommendation,
        "differentialHints": report.differential_hints,
        "confidenceNote": report.confidence_note,
        "auditFlags": report.audit_flags,
        "auditPassed": report.audit_passed,
        "heatmapBase64": report.heatmap_base64
    }
