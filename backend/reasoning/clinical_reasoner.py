import os
import json
import time
from groq import Groq
from reasoning.prompt_builder import (
    build_clinical_context,
    build_system_prompt,
    build_reasoning_prompt
)

def clean_llm_response(raw_text: str) -> str:
    raw_text = raw_text.strip()
    
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw_text = "\n".join(lines).strip()
        
    if raw_text.lower().startswith("json"):
        raw_text = raw_text[4:].strip()
        
    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1
    if start != -1 and end > start:
        raw_text = raw_text[start:end]
        
    return raw_text

def get_fallback_report(
    vision_result: dict,
    triage_level: str
) -> dict:
    organ = vision_result.get("organ", "organ")
    score = vision_result.get("probability_score", 0.5)

    return {
        "reasoning_trace": f"Probability score of {score} detected for "
                           f"{organ} analysis. Triage level set to {triage_level} based "
                           f"on scoring thresholds. LLM reasoning unavailable.",
        "risk_summary": f"{organ.capitalize()} scan indicates "
                        f"{triage_level} risk based on AI probability score of {score}.",
        "doctor_explanation": f"AI imaging analysis of {organ} scan "
                              f"produced a probability score of {score}. Triage classification: "
                              f"{triage_level.upper()}. Clinical correlation recommended.",
        "patient_explanation": "Your scan results have been processed. "
                               "Please consult your doctor to discuss the findings and "
                               "determine appropriate next steps.",
        "triage_recommendation": "Consult a qualified clinician for "
                                 "assessment and further investigation as appropriate.",
        "differential_hints": [
            "Benign mass or cyst",
            "Inflammatory or infectious condition"
        ],
        "confidence_note": "LLM reasoning unavailable — template "
                           "fallback active. Results should be interpreted with caution.",
        "audit_flags": [
            "LLM clinical reasoning failed — automated fallback used",
            "Manual clinical review strongly recommended"
        ]
    }

def generate_clinical_report(
    vision_result: dict,
    patient_data: dict,
    triage_level: str
) -> dict:
    context = build_clinical_context(
        vision_result, patient_data, triage_level
    )

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1024,
            temperature=0.3,
            messages=[
                {
                    "role": "system",
                    "content": build_system_prompt()
                },
                {
                    "role": "user",
                    "content": build_reasoning_prompt(context)
                }
            ]
        )
        raw_text = message.choices[0].message.content
        cleaned = clean_llm_response(raw_text)
        report = json.loads(cleaned)

        required_keys = [
            "reasoning_trace", "risk_summary", "doctor_explanation",
            "patient_explanation", "triage_recommendation",
            "differential_hints", "confidence_note", "audit_flags"
        ]
        for key in required_keys:
            if key not in report:
                report[key] = "Not available"
        
        if not isinstance(report["differential_hints"], list):
            report["differential_hints"] = ["Benign condition", "Inflammatory process"]
        if not isinstance(report["audit_flags"], list):
            report["audit_flags"] = []

    except json.JSONDecodeError:
        report = get_fallback_report(vision_result, triage_level)

    except Exception as e:
        error_str = str(e).lower()
        
        if "429" in str(e) or "rate" in error_str:
            time.sleep(3)
            try:
                message = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    max_tokens=1024,
                    temperature=0.3,
                    messages=[
                        {"role": "system", "content": build_system_prompt()},
                        {"role": "user", "content": build_reasoning_prompt(context)}
                    ]
                )
                raw_text = message.choices[0].message.content
                cleaned = clean_llm_response(raw_text)
                report = json.loads(cleaned)
            except:
                report = get_fallback_report(vision_result, triage_level)
                report["audit_flags"].append("Rate limit hit — retry failed")
        
        elif "401" in str(e) or "authentication" in error_str or "api_key" in error_str:
            report = get_fallback_report(vision_result, triage_level)
            report["audit_flags"].append(
                "Groq API key invalid or missing — set GROQ_API_KEY in .env"
            )
        
        else:
            report = get_fallback_report(vision_result, triage_level)
            report["audit_flags"].append(f"LLM error: {str(e)[:100]}")

    report["_context"] = context
    return report
