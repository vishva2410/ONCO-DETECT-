import os
import json
import time
from groq import Groq
from reasoning.prompt_builder import build_audit_prompt

def get_default_audit() -> dict:
    return {
        "issues_found": [],
        "adjusted_confidence": "moderate",
        "suggested_amendment": "",
        "audit_passed": True
    }

def audit_clinical_report(
    initial_report: dict,
    context: dict
) -> dict:
    clean_report = {
        k: v for k, v in initial_report.items()
        if not k.startswith("_")
    }

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=512,
            temperature=0.1,
            messages=[
                {
                    "role": "user",
                    "content": build_audit_prompt(clean_report, context)
                }
            ]
        )
        raw_text = message.choices[0].message.content
        
        from reasoning.clinical_reasoner import clean_llm_response
        cleaned = clean_llm_response(raw_text)
        audit = json.loads(cleaned)
        
        if "audit_passed" not in audit:
            audit["audit_passed"] = True
        if "issues_found" not in audit:
            audit["issues_found"] = []
        if "adjusted_confidence" not in audit:
            audit["adjusted_confidence"] = "moderate"
        if "suggested_amendment" not in audit:
            audit["suggested_amendment"] = ""
        
        return audit

    except json.JSONDecodeError:
        return get_default_audit()

    except Exception as e:
        error_str = str(e).lower()
        if "429" in str(e) or "rate" in error_str:
            time.sleep(2)
            try:
                message = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    max_tokens=512,
                    temperature=0.1,
                    messages=[
                        {
                            "role": "user",
                            "content": build_audit_prompt(clean_report, context)
                        }
                    ]
                )
                raw_text = message.choices[0].message.content
                from reasoning.clinical_reasoner import clean_llm_response
                cleaned = clean_llm_response(raw_text)
                return json.loads(cleaned)
            except:
                return get_default_audit()
        return get_default_audit()
