import json

def build_clinical_context(
    vision_result: dict,
    patient_data: dict,
    triage_level: str
) -> dict:
    return {
        "organ": vision_result["organ"],
        "probability_score": vision_result["probability_score"],
        "confidence_band": vision_result["confidence_band"],
        "triage_level": triage_level,
        "patient": {
            "age": patient_data.get("age"),
            "gender": patient_data.get("gender"),
            "symptoms": patient_data.get("symptoms"),
            "smoking_history": patient_data.get("smokingHistory", False),
            "family_history": patient_data.get("familyHistory", False)
        }
    }

def build_system_prompt() -> str:
    return """
You are OncoDetect, an AI-assisted clinical triage system.
Your role is to support — not replace — qualified medical professionals.

You receive structured data from medical imaging AI models combined
with patient clinical information. Your task is to reason through
this data and produce a triage recommendation.

STRICT RULES YOU MUST FOLLOW:
1. You are a decision-support tool only. Never state a diagnosis.
2. Always express uncertainty where it exists.
3. Reference the patient's specific data — never give generic advice.
4. If the probability score and clinical context conflict, flag it.
5. Recommend further testing rather than conclusions when uncertain.
6. Never use alarming language in patient-facing explanations.
7. Always recommend the patient consult a qualified clinician.

OUTPUT FORMAT:
You must respond ONLY with a valid JSON object.
No preamble, no explanation outside the JSON, no markdown code fences.
The JSON must match this exact structure:
{
  "reasoning_trace": "string — step by step clinical reasoning, 3-5 sentences",
  "risk_summary": "string — one sentence summary of overall risk",
  "doctor_explanation": "string — technical explanation for clinician, 3-4 sentences",
  "patient_explanation": "string — plain language for patient, 2-3 sentences, reassuring tone",
  "triage_recommendation": "string — specific next clinical action",
  "differential_hints": ["string", "string"],
  "confidence_note": "string — honest statement about result certainty",
  "audit_flags": ["string"]
}

differential_hints: exactly 2 alternative conditions to consider
besides cancer. These must be clinically plausible for the organ
and patient profile.

audit_flags: list 0 to 3 concerns about data quality, model
limitations, or factors that could affect result reliability.
Return an empty array [] if no flags are needed.

CRITICAL: your entire response must be parseable by json.loads().
Do not include any text before or after the JSON object.
"""

def build_reasoning_prompt(context: dict) -> str:
    return f"""
Analyze the following clinical triage case and produce a structured
report. Respond ONLY with the JSON object described in your
instructions. No other text.

IMAGING RESULT:
- Organ analyzed: {context['organ']}
- AI probability score: {context['probability_score']}
  (scale 0-1, higher = greater likelihood of abnormality)
- Confidence band: {context['confidence_band'][0]} to {context['confidence_band'][1]}
- Preliminary triage level: {context['triage_level'].upper()}

PATIENT PROFILE:
- Age: {context['patient']['age']} years
- Gender: {context['patient']['gender']}
- Reported symptoms: {context['patient']['symptoms']}
- Smoking history: {'Yes' if context['patient']['smoking_history'] else 'No'}
- Family history of cancer: {'Yes' if context['patient']['family_history'] else 'No'}

REASONING TASK:
1. Analyze how the imaging probability score interacts with this
   patient's specific risk profile. Be specific — reference the
   actual age, symptoms, and history provided above.
2. Assess whether the probability score is consistent with the
   clinical presentation or if there are conflicting signals.
3. Produce a triage recommendation appropriate for a setting
   where specialist access may be limited.
4. Write a technical explanation for the treating clinician that
   references the specific score and patient factors.
5. Write a reassuring plain-language explanation for the patient
   that contains no probability numbers or clinical jargon.
6. Suggest exactly 2 differential diagnoses that could explain
   the imaging findings besides malignancy.

Respond ONLY with the JSON object. No preamble. No markdown fences.
"""

def build_audit_prompt(
    initial_report: dict,
    context: dict
) -> str:
    return f"""
You are a medical AI safety auditor. Review the oncology triage
report below and identify any issues with its quality or reliability.

ORIGINAL CLINICAL INPUT:
- Organ: {context['organ']}
- Probability score: {context['probability_score']}
- Confidence band: {context['confidence_band'][0]} to {context['confidence_band'][1]}
- Patient age: {context['patient']['age']}
- Smoking history: {'Yes' if context['patient']['smoking_history'] else 'No'}
- Family history: {'Yes' if context['patient']['family_history'] else 'No'}
- Symptoms: {context['patient']['symptoms']}

REPORT TO AUDIT:
{json.dumps(initial_report, indent=2)}

AUDIT CHECKLIST — identify any of these issues:
1. Claims not supported by the input data
2. Overconfident conclusions given the probability score
3. Failure to mention relevant patient risk factors
4. Recommendations inconsistent with the triage level
5. Patient explanation that could cause undue alarm or contains
   clinical jargon
6. Missing or implausible differential considerations
7. Probability score and triage level mismatch

Respond ONLY with a valid JSON object. No other text:
{{
  "issues_found": ["string"] or [],
  "adjusted_confidence": "high" or "moderate" or "low",
  "suggested_amendment": "string describing improvement or empty string",
  "audit_passed": true or false
}}

audit_passed must be true only if no significant issues were found.
adjusted_confidence reflects your assessment of overall reliability.
Respond ONLY with the JSON object. No preamble. No markdown fences.
"""
