# OncoDetect — AI-Assisted Multi-Organ Cancer Triage System
## Complete Technical Project Report

---

## 1. Project Overview

**OncoDetect** is an AI-powered, multi-organ cancer risk triage system designed to assist clinical professionals in detecting early indicators of cancer from medical imaging scans. It combines state-of-the-art computer vision models with a Large Language Model (LLM) reasoning chain to produce structured, auditable clinical reports.

The system is designed as a **clinical decision-support tool** — not a diagnostic system. It provides probability scores, differential diagnoses, and triage recommendations, which are intended to support — and never replace — the judgment of a licensed medical professional.

---

## 2. Core Objective

To reduce the time-to-triage for cancer suspects in clinical settings by:

1. Accepting patient demographics and a diagnostic scan image as input.
2. Running the scan through a purpose-built deep learning model for the relevant organ.
3. Generating a structured clinical reasoning report using an LLM.
4. Self-auditing the report for clinical quality and safety.
5. Presenting the results through a professional clinical dashboard.
6. Optionally exporting a formatted PDF report for medical records.

---

## 3. System Architecture

The system follows a **three-stage AI pipeline**:

```
[Stage 1] Scan Upload + Demographics Intake
          ↓
[Stage 2] Vision Inference (Organ-Specific ML Model)
          ↓
[Stage 3] LLM Clinical Reasoning (Llama 3.3 70B via Groq)
          ↓
[Stage 3b] Self-Audit Pass (Llama 3.3 70B via Groq)
          ↓
[Output] Structured Report → Saved to Database → Rendered in UI → PDF Export
```

### Full Stack:

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 + Material Design 3 (Stitch) |
| Backend Framework | FastAPI (Python) |
| API Server | Uvicorn |
| Database | SQLite (via SQLAlchemy ORM) |
| Authentication | JWT (JSON Web Tokens) |
| Vision (Breast) | PyTorch — `ianpan/mammoscreen` (HuggingFace) |
| Vision (Lung) | ONNX Runtime — `dorsar/lung-cancer-detection` (HuggingFace) |
| Vision (Brain) | TensorFlow/Keras — `jawadskript/brain_tumor_detection_CNN_DeepLearning` (HuggingFace) |
| LLM Reasoning | Meta Llama 3.3 70B Versatile (via Groq API) |
| PDF Generation | ReportLab |
| Model Hub | HuggingFace Hub |

---

## 4. Machine Learning Models

### 4.1 Brain Tumor Detection (Keras / TensorFlow)

- **Model Repository:** `jawadskript/brain_tumor_detection_CNN_DeepLearning`
- **Architecture:** Convolutional Neural Network (CNN), deep learning, compiled in Keras.
- **Input:** MRI scan images, resized to `224 × 224 px`, RGB, normalized to `[0, 1]`.
- **Framework:** TensorFlow / Keras — loaded via `.h5` model file.
- **Output:** Probability score `[0.0 – 1.0]` for brain tumor presence.
- **Confidence Band:** ±0.07 (7%) around the probability score.
- **Pre-processing Pipeline:**
  1. Resize image to `224 × 224`.
  2. Convert to RGB.
  3. Normalize pixel values to `[0.0, 1.0]` by dividing by 255.
  4. Add batch dimension `(1, 224, 224, 3)` for model input.

### 4.2 Lung Cancer Detection (ONNX Runtime)

- **Model Repository:** `dorsar/lung-cancer-detection`
- **Architecture:** PyTorch image classifier, exported to ONNX format for cross-platform inference.
- **Input:** CT scan or chest X-ray images, resized to `224 × 224 px`.
- **Framework:** ONNX Runtime — universal ML inference engine.
- **Output:** Probability score `[0.0 – 1.0]` for lung cancer presence.
- **Confidence Band:** ±0.08 (8%) around the probability score.
- **Pre-processing Pipeline:**
  1. Resize image to `224 × 224`.
  2. Convert to RGB.
  3. Normalize to `[0.0, 1.0]` by dividing by 255.
  4. Apply standard ImageNet mean/std normalization:
     - Mean: `[0.485, 0.456, 0.406]`
     - Std: `[0.229, 0.224, 0.225]`
  5. Transpose from HWC to CHW (channels-first) for PyTorch compatibility.
  6. Add batch dimension for ONNX session input.
- **Activation:** Softmax for multi-class, Sigmoid for binary classification.

### 4.3 Breast Cancer Detection (PyTorch — MammoScreen)

- **Model Repository:** `ianpan/mammoscreen`
- **Architecture:** Custom pre-trained mammography screening model (MammoScreen), loaded via HuggingFace AutoModel API.
- **Input:** Mammography images, resized to `512 × 512 px` (higher resolution than other models due to the nature of mammographic imaging).
- **Framework:** PyTorch — loaded with `torch.inference_mode()` for memory efficiency.
- **Output:** Raw logit for cancer probability; the system applies a Sigmoid function (`1 / (1 + e^-x)`) to constrain output to `[0.0, 1.0]`.
- **Confidence Band:** ±0.06 (6%) around the probability score.
- **Pre-processing Pipeline:**
  1. Resize image to `512 × 512`.
  2. Convert to RGB.
  3. Convert to `float32` NumPy array (values in `[0, 255]` — MammoScreen's expected range).
  4. Transpose from HWC to CHW format.
  5. Add batch dimension and convert to PyTorch tensor.

---

## 5. Triage Classification Logic

After the vision model produces a probability score, OncoDetect applies the following universal threshold-based classification:

| Probability Range | Triage Level | Clinical Action |
|---|---|---|
| `>= 0.65` (65%) | **HIGH** | Urgent clinical review; biopsy triggered |
| `>= 0.35 and < 0.65` | **MODERATE** | Further imaging; specialist referral |
| `< 0.35` (35%) | **LOW** | Routine follow-up protocol |

---

## 6. LLM Reasoning Engine (Stage 3)

### 6.1 Clinical Report Generation

- **LLM Used:** Meta **Llama 3.3 70B Versatile** (via Groq Cloud API)
- **Temperature:** 0.3 (low, for controlled and deterministic clinical output)
- **Max Tokens:** 1,024 tokens per clinical report

The LLM receives a structured context packet containing:
- Organ analyzed
- AI probability score and confidence band
- Preliminary triage level
- Patient demographics: age, gender, stated symptoms
- Risk factors: smoking history, family history of cancer

The LLM then produces a **strictly-formatted JSON clinical report** containing:

| Field | Description |
|---|---|
| `reasoning_trace` | Step-by-step clinical reasoning (3–5 sentences) |
| `risk_summary` | One-sentence risk summary |
| `doctor_explanation` | Technical explanation for the treating clinician (3–4 sentences) |
| `patient_explanation` | Plain-language, reassuring explanation for the patient (no jargon) |
| `triage_recommendation` | Specific next clinical action |
| `differential_hints` | 2 alternative conditions to consider besides malignancy |
| `confidence_note` | Honest qualification of result certainty |
| `audit_flags` | 0–3 data quality flags |

### 6.2 Strict Ethical Guardrails in the LLM System Prompt

The system prompt enforces:
1. OncoDetect is a **decision-support tool only**. It never states a diagnosis.
2. Always express uncertainty where it exists.
3. Reference the patient's specific data — never give generic advice.
4. If the probability score and clinical context conflict, flag it explicitly.
5. Recommend further testing rather than conclusions when uncertain.
6. Never use alarming language in patient-facing explanations.
7. Always recommend the patient consult a qualified clinician.

---

## 7. Self-Audit System (Stage 3b)

After generating the initial clinical report, OncoDetect runs a **second LLM call** using the same model (`Llama 3.3 70B`) to audit its own output.

- **Temperature:** 0.1 (very low, for strict analytical judgment)
- **Max Tokens:** 512 tokens

The auditor checks for:
1. Claims not supported by the input data.
2. Overconfident conclusions given the probability score.
3. Failure to mention relevant patient risk factors.
4. Recommendations inconsistent with the triage level.
5. Patient explanations that could cause undue alarm.
6. Missing or implausible differential diagnoses.
7. Probability score and triage level mismatch.

**Audit Output:**

| Field | Description |
|---|---|
| `issues_found` | List of identified problems |
| `adjusted_confidence` | High / Moderate / Low |
| `suggested_amendment` | Recommended correction text |
| `audit_passed` | Boolean — true only if no significant issues |

If the audit fails, the audit flags are appended to the clinical report and the confidence note is amended with the auditor's critique before saving.

---

## 8. API Architecture (FastAPI Backend)

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/analyze` | POST | Main pipeline — accepts patient data + image, returns full analysis |
| `GET /api/reports` | GET | Fetch all saved reports from the database |
| `GET /api/reports/{id}` | GET | Fetch a single report by ID |
| `POST /api/report/generate-pdf` | POST | Generate and download a formatted A4 PDF report |
| `POST /api/auth/login` | POST | Doctor login — returns JWT token |
| `GET /api/auth/me` | GET | Returns current authenticated user |

**Authentication:** JWT-based. All analysis and report endpoints require a valid Bearer token. The system seeds a default admin account (`admin` / `password123`) on first startup.

---

## 9. PDF Report Generation (ReportLab)

The system generates a professional **A4 PDF clinical report** containing:
- Patient demographics header (name, age, gender, date of report)
- AI probability score and triage level badge (colour-coded: red/amber/green)
- Confidence band
- AI model source identifier
- Doctor-facing technical explanation
- Patient-facing plain-language summary
- Triage recommendation
- Differential diagnosis hints
- Audit status (PASS / FAIL) with flags
- Recommendations list
- Legal disclaimer

---

## 10. Data Persistence (SQLAlchemy + SQLite)

All completed analyses are persisted in a local SQLite database (`oncodetect.db`). The schema stores:
- Patient name, age, gender, organ type
- Probability score and confidence band
- Triage level
- Full LLM reasoning trace
- Doctor and patient explanations
- Differential diagnoses
- Audit flags and status
- Model source identifier
- Timestamp

The database is upgraded to PostgreSQL-ready via environment variable configuration.

---

## 11. Frontend Application (React 19 + Vite 8)

### 11.1 Design System

The frontend implements the **Stitch Material Design 3 (M3)** system:
- **Color Palette:**
  - Background: `#131315`
  - Primary (Blue): `#aec6ff` / Container: `#0070f3`
  - Secondary (Teal): `#4edea3`
  - Tertiary (Amber): `#ffb95f`
  - Error (Red): `#ffb4ab`
- **Typography:** Space Grotesk (headlines) + Inter (body)
- **Icons:** Google Material Symbols Outlined
- **Glassmorphism:** `backdrop-filter: blur(20px)` glass panels
- **Grid Overlay:** Radial dot-grid background for clinical aesthetic

### 11.2 Pages and Components

| Page / Component | Description |
|---|---|
| `Entrance.jsx` | Landing page with OncoDetect branding and login entry |
| `SignIn.jsx` | Doctor authentication form (JWT login) |
| `Dashboard.jsx` | System overview bento grid — status cards, telemetry, CTA |
| `NewAnalysis.jsx` | 4-step intake wizard — demographics, organ selection, file upload |
| `Analysis.jsx` | Live analysis sequence viewer — SVG scanner, telemetry console, step pipeline |
| `Report.jsx` | Clinical report viewer — probability charts, explanations, clinical action |
| `History.jsx` | Patient registry table — all past analyses with triage indicators |
| `Navbar.jsx` | Top navigation bar — logo, nav links, user profile, notifications |
| `DisclaimerBanner.jsx` | HIPAA / clinical disclaimer notification |
| `CaseLibrary.jsx` | Component for browsing archived case studies |

### 11.3 State Management

- **`usePatient` hook:** Manages in-progress patient data and scan file across the intake flow.
- **`useAuth` hook:** Manages JWT token, login state, and user profile.
- **`api.js` client:** Axios-based API client with automatic JWT header injection.

---

## 12. End-to-End User Flow

```
1. Doctor logs in at /signin (JWT issued)
2. Dashboard displays: system health, scanner availability, recent triage
3. Doctor selects "Start New Analysis"
4. Intake wizard captures: patient name, age, gender, symptoms, organ type, scan upload
5. On submit → POST /api/analyze → vision model runs → LLM reasons → audit runs
6. Doctor is redirected to the live Analysis page (progress animation)
7. On completion → redirected to the Report page
8. Report displays: probability score, triage level, clinical explanations
9. Doctor can download a PDF for medical records
10. All reports accessible in the History / Archive registry
```

---

## 13. Key Technical Achievements

1. **Multi-Framework ML Inference:** The system simultaneously supports three different ML frameworks (PyTorch, ONNX Runtime, TensorFlow/Keras) in the same backend, with a shared vision router that dispatches to the correct framework per organ type.

2. **LLM-Powered Self-Audit:** A two-pass LLM chain where the model generates a report and then audits its own output before it reaches the user. This is an applied Responsible AI pattern for clinical use cases.

3. **Graceful Degradation:** If the LLM is unavailable (API key missing, rate limit hit), the system automatically falls back to a deterministic template report and appends the reason to the audit flags. The analysis pipeline never returns a hard error to the user.

4. **Model Caching:** All ML models are loaded once at first inference and cached in memory for the lifetime of the server process, preventing expensive repeated downloads from HuggingFace.

5. **HIPAA-Aligned Prompting:** The LLM system prompt enforces strict clinical safety rules including the prohibition of direct diagnoses, requirement to express uncertainty, and avoiding alarming language in patient explanations.

---

## 14. Model Sources and References

| Organ | Model Name | Source | Framework |
|---|---|---|---|
| Brain | `brain_tumor_detection_CNN_DeepLearning` | HuggingFace: `jawadskript` | TensorFlow/Keras H5 |
| Lung | `lung-cancer-detection` | HuggingFace: `dorsar` | ONNX Runtime |
| Breast | `mammoscreen` | HuggingFace: `ianpan` | PyTorch (AutoModel) |
| LLM | `Llama 3.3 70B Versatile` | Meta AI via Groq Cloud API | Transformer |

---

## 15. Dependencies and Libraries

### Backend (Python)

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | 0.111.0 | REST API framework |
| `uvicorn` | 0.30.1 | ASGI web server |
| `pydantic` | 2.11.7 | Data validation and schemas |
| `groq` | 1.1.1 | Groq API client for Llama inference |
| `sqlalchemy` | >=2.0.29 | ORM and DB management |
| `reportlab` | 4.1.0 | PDF report generation |
| `python-multipart` | 0.0.9 | File upload parsing |
| `python-dotenv` | 1.1.1 | Environment variable management |
| `torch` | (in venv) | PyTorch for breast model inference |
| `transformers` | (in venv) | HuggingFace model loading |
| `onnxruntime` | (in venv) | ONNX lung model inference |
| `tensorflow` | (in venv) | Keras brain model inference |
| `Pillow` | (in venv) | Image preprocessing (PIL) |
| `numpy` | (in venv) | Numerical array operations |
| `huggingface_hub` | (in venv) | Model download and caching |
| `python-jose` | (in venv) | JWT token generation and validation |
| `passlib` | (in venv) | Password hashing (PBKDF2_SHA256) |

### Frontend (Node.js / React)

| Package | Purpose |
|---|---|
| `react` 19 | Component-based UI library |
| `react-router-dom` | Client-side routing |
| `vite` 8 | Build tool and dev server |
| `tailwindcss` 4 | Utility-first CSS framework |
| `axios` | HTTP client for API calls |
| Google Material Symbols | Icon system (web font) |
| Google Fonts (Space Grotesk, Inter) | Typography |

---

## 16. Deployment Configuration

- **Backend:** FastAPI on Uvicorn, port `8000`
- **Frontend:** Vite Dev Server, port `5173`, proxies `/api` calls to backend
- **Startup:** Single `./start.sh` script that:
  1. Kills any processes on ports 8000 and 5173
  2. Activates the Python virtual environment
  3. Starts FastAPI in the background
  4. Starts the Vite frontend server
- **Environment Variables Required:** `GROQ_API_KEY` in `backend/.env`
- **Production Readiness:** Configurable for PostgreSQL via `DATABASE_URL` and multi-origin CORS via `FRONTEND_URL` environment variable.

---

## 17. Limitations and Disclaimers

1. **Not a Medical Device.** OncoDetect is an academic/research prototype and is not FDA-cleared or CE-marked. It should not be used for clinical diagnosis in a real medical setting without proper regulatory approval.

2. **Model Accuracy.** The accuracy of the individual vision models depends on the training data used by their respective authors on HuggingFace. The system does not claim specific accuracy benchmarks for clinical use — probability scores are indicators, not diagnoses.

3. **Confidence Bands.** The confidence bands (±6–8%) are heuristic values applied to reflect model uncertainty, not empirically calibrated prediction intervals.

4. **LLM Hallucination Risk.** The clinical reasoning generated by Llama 3.3 70B is probabilistic. The self-audit pass mitigates but does not entirely eliminate the risk of clinically misleading statements. All reports must be validated by a qualified clinician.

5. **Single-Image Input.** Current implementation processes a single uploaded image per analysis. Real-world radiology typically involves multi-slice 3D volumes (e.g., DICOM series), which this system does not natively support.

---

## 18. Potential Improvements / Future Scope

- Integration with DICOM protocol for multi-slice 3D scan support
- Grad-CAM heatmap overlay to visually highlight anomaly regions
- Integration with Hospital Information Systems (HIS/PACS) via FHIR API
- Multi-user role system (radiologist, oncologist, admin)
- Historical trend analysis per patient across multiple scans
- Fine-tuned domain-specific LLM for even more precise clinical reasoning
- Notification system for HIGH-risk triage cases (email/SMS to care team)

---

*Report prepared: March 2026 | OncoDetect v1.0.0 | Academic Mini Project*
