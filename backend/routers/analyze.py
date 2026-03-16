import json
from fastapi import APIRouter, UploadFile, File, Form
from models.schemas import AnalysisResponse
from reasoning.clinical_reasoner import generate_clinical_report
from reasoning.self_auditor import audit_clinical_report

router = APIRouter()


@router.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(
    patient_data: str = Form(...),
    scan_file: UploadFile = File(...)
):
    """
    Stage 3: Uses Groq API with Llama 3.3 for clinical reasoning.
    """
    parsed_patient = json.loads(patient_data)
    organ = parsed_patient.get("organType", "lung").lower().strip()

    # Read file to acknowledge upload (not processed via vision models yet)
    _ = await scan_file.read()

    # --- Stage 1/2 Mock Vision Output ---
    if organ == "lung":
        result = {"organ": "lung", "probability_score": 0.74, "confidence_band": [0.68, 0.81], "heatmap_base64": None, "model_source": "densenet121"}
        triage_level = "high"
    elif organ == "brain":
        result = {"organ": "brain", "probability_score": 0.62, "confidence_band": [0.54, 0.70], "heatmap_base64": None, "model_source": "resnet50"}
        triage_level = "moderate"
    else:  # breast
        result = {"organ": "breast", "probability_score": 0.28, "confidence_band": [0.19, 0.37], "heatmap_base64": None, "model_source": "efficientnet-b4"}
        triage_level = "low"

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

    return {
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
        "differentialHints": llm_report.get("differential_hints", []),
        "confidenceNote": llm_report.get("confidence_note", ""),
        "auditFlags": llm_report.get("audit_flags", []),
        "auditPassed": audit_result.get("audit_passed", True),
        "modelSource": result.get("model_source", "resnet50")
    }
