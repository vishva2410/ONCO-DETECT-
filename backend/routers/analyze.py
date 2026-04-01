import json
import os
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from PIL import UnidentifiedImageError
from sqlalchemy.orm import Session
from database import get_db
from models.domain import PatientReport, DoctorUser
from routers.auth import get_current_user
from models.schemas import AnalysisResponse
from reasoning.clinical_reasoner import generate_clinical_report
from reasoning.self_auditor import audit_clinical_report

router = APIRouter()
ALLOWED_ORGANS = {"brain", "lung", "breast"}
ALLOWED_UPLOAD_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", 10 * 1024 * 1024))


@router.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(
    patient_data: str = Form(...),
    scan_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: DoctorUser = Depends(get_current_user)
):
    """
    Stage 3: Uses Groq API with Llama 3.3 for clinical reasoning.
    """
    try:
        parsed_patient = json.loads(patient_data)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid patient_data JSON payload",
        ) from exc

    if not isinstance(parsed_patient, dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="patient_data must be a JSON object",
        )

    organ = parsed_patient.get("organType", "lung").lower().strip()
    if organ not in ALLOWED_ORGANS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported organType '{organ}'. Choose one of: brain, lung, breast.",
        )

    patient_name = str(parsed_patient.get("name", "")).strip()
    if not patient_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Patient name is required",
        )

    # Stage 1/2: Unified Multi-Framework Vision Inference
    image_bytes = await scan_file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded scan file is empty",
        )

    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded scan exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit",
        )

    filename = (scan_file.filename or "").lower()
    has_supported_extension = any(filename.endswith(ext) for ext in ALLOWED_UPLOAD_EXTENSIONS)
    if not (scan_file.content_type or "").startswith("image/") and not has_supported_extension:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported scan format. Please upload a PNG, JPG, or WEBP image.",
        )

    try:
        from reasoning.vision_router import evaluate_image
        result, triage_level = evaluate_image(organ, image_bytes)
    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file could not be parsed as an image. Please upload a PNG, JPG, or WEBP scan.",
        ) from exc
    except Exception as e:
        print(f"Error in Vision Pipeline: {e}")
        # Fallback to keep system alive if massive ML models fail to load/download
        result = {"organ": organ, "probability_score": 0.5, "confidence_band": [0.4, 0.6], "heatmap_base64": None, "model_source": f"error-fallback: {e}"}
        triage_level = "moderate"

    # Stage 3 — LLM clinical reasoning
    llm_report = generate_clinical_report(
        vision_result=result,
        patient_data=parsed_patient,
        triage_level=triage_level
    )

    # Stage 3 — self-audit
    context = llm_report.pop("_context", {})
    audit_result = audit_clinical_report(llm_report, context)

    # Merge audit findings
    if not audit_result.get("audit_passed", True):
        existing_flags = llm_report.get("audit_flags", [])
        new_flags = audit_result.get("issues_found", [])
        llm_report["audit_flags"] = existing_flags + new_flags
        amendment = audit_result.get("suggested_amendment", "")
        if amendment:
            current_note = llm_report.get("confidence_note", "")
            llm_report["confidence_note"] = (
                current_note + " Auditor note: " + amendment
            ).strip()

    report_dict = {
        "organType": organ,
        "probabilityScore": result["probability_score"],
        "confidenceBand": result["confidence_band"],
        "heatmapBase64": result.get("heatmap_base64"),
        "triageLevel": triage_level,
        "reasoningTrace": llm_report.get("reasoning_trace", ""),
        "riskSummary": llm_report.get("risk_summary", ""),
        "doctorExplanation": llm_report.get("doctor_explanation", ""),
        "patientExplanation": llm_report.get("patient_explanation", ""),
        "triageRecommendation": llm_report.get("triage_recommendation", ""),
        "recommendations": llm_report.get("recommendations", []),
        "differentialHints": llm_report.get("differential_hints", []),
        "confidenceNote": llm_report.get("confidence_note", ""),
        "auditFlags": llm_report.get("audit_flags", []),
        "auditPassed": audit_result.get("audit_passed", True),
        "modelSource": result.get("model_source", "resnet50")
    }

    try:
        db_report = PatientReport(
            patient_id=parsed_patient.get("patientId", patient_name),
            patient_name=patient_name,
            patient_age=str(parsed_patient.get("age", "")),
            patient_gender=parsed_patient.get("gender", ""),
            organ_type=report_dict["organType"],
            probability_score=report_dict["probabilityScore"],
            confidence_band=report_dict["confidenceBand"],
            triage_level=report_dict["triageLevel"],
            model_source=report_dict["modelSource"],
            reasoning_trace=report_dict["reasoningTrace"],
            risk_summary=report_dict["riskSummary"],
            doctor_explanation=report_dict["doctorExplanation"],
            patient_explanation=report_dict["patientExplanation"],
            triage_recommendation=report_dict["triageRecommendation"],
            differential_hints=report_dict["differentialHints"],
            confidence_note=report_dict["confidenceNote"],
            audit_flags=report_dict["auditFlags"],
            audit_passed=report_dict["auditPassed"],
            heatmap_base64=report_dict["heatmapBase64"],
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        report_dict["reportId"] = db_report.id
    except Exception as e:
        print(f"Failed to save report: {e}")
        db.rollback()

    return report_dict
