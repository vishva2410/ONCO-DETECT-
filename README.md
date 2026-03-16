<p align="center">
  <img src="https://img.shields.io/badge/OncoDetect-AI%20Cancer%20Triage-00D4A8?style=for-the-badge&logo=moleculer&logoColor=white" alt="OncoDetect Badge" />
</p>

<h1 align="center">
  🧬 OncoDetect
</h1>

<p align="center">
  <b>AI-Powered Multi-Organ Cancer Triage System</b><br/>
  <sub>Intelligent clinical decision support • LLM-backed reasoning • Real-time analysis pipeline</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_API-FF6B35?style=flat-square&logo=lightning&logoColor=white" />
  <img src="https://img.shields.io/badge/Llama_3.3_70B-7C3AED?style=flat-square&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-E91E63?style=flat-square&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-pipeline-flow">Pipeline</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-quick-start">Setup</a> •
  <a href="#-deployment">Deploy</a> •
  <a href="#-license">License</a>
</p>

---

## ⚡ Overview

**OncoDetect** is a full-stack AI-powered clinical triage application that assists in the early detection and risk assessment of cancer across **three organ systems** — Brain, Lung, and Breast. The system combines medical imaging analysis with patient clinical data and processes it through a sophisticated **6-stage neural pipeline** backed by **Llama 3.3 70B** via the Groq API.

> [!IMPORTANT]
> This is a **demonstration/academic project**. It does not use real diagnostic ML models and should **never** be used for actual clinical decisions. The LLM reasoning simulates clinical analysis for educational purposes.

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 🧠 Intelligent Analysis
- Multi-organ cancer detection (Brain, Lung, Breast)
- 6-stage animated neural pipeline
- Real-time processing with visual progress
- Confidence band scoring with probability metrics

</td>
<td width="50%">

### 🤖 LLM Clinical Reasoning
- Powered by **Llama 3.3 70B** via Groq API
- Dual-perspective reports (Doctor + Patient)
- Self-auditing second LLM pass for quality
- Differential diagnosis hints

</td>
</tr>
<tr>
<td width="50%">

### 📊 Rich Reporting
- Dynamic triage badges (Low / Moderate / High)
- Animated probability bars and confidence intervals
- Downloadable PDF clinical reports
- Audit trail with transparency flags

</td>
<td width="50%">

### 🎨 Premium UI/UX
- Dark-mode scientific aesthetic
- Animated pipeline flowchart with data particles
- Framer Motion page transitions
- Fully responsive & accessible design

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ONCODETECT SYSTEM                         │
├────────────────────────────┬────────────────────────────────────────┤
│       FRONTEND (React)     │          BACKEND (FastAPI)             │
│                            │                                        │
│  ┌──────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │   Entrance Page      │  │  │   /api/analyze                   │  │
│  │   ├─ Neural Logo     │  │  │   ├─ Patient Data Parser         │  │
│  │   └─ Init Sequence   │  │  │   ├─ Vision Model (mock)         │  │
│  ├──────────────────────┤  │  │   ├─ Clinical Reasoner (LLM)     │  │
│  │   Sign In            │  │  │   └─ Self Auditor (LLM)          │  │
│  │   └─ Demo Auth       │  │  ├──────────────────────────────────┤  │
│  ├──────────────────────┤  │  │   /api/report                    │  │
│  │   Dashboard          │  │  │   └─ PDF Generator (ReportLab)   │  │
│  │   ├─ System Graph    │  │  ├──────────────────────────────────┤  │
│  │   ├─ Stats Cards     │  │  │   Reasoning Engine               │  │
│  │   └─ Capabilities    │  │  │   ├─ prompt_builder.py           │  │
│  ├──────────────────────┤  │  │   ├─ clinical_reasoner.py        │  │
│  │   New Analysis       │  │  │   └─ self_auditor.py             │  │
│  │   ├─ Patient Form    │  │  └──────────────────────────────────┘  │
│  │   ├─ Organ Selector  │  │                                        │
│  │   └─ Scan Upload     │  │         External Services              │
│  ├──────────────────────┤  │  ┌──────────────────────────────────┐  │
│  │   Analysis Pipeline  │  │  │   Groq API                       │  │
│  │   └─ 6-Stage Flow    │  │  │   └─ llama-3.3-70b-versatile    │  │
│  ├──────────────────────┤  │  └──────────────────────────────────┘  │
│  │   Report View        │  │                                        │
│  │   ├─ Triage Badge    │  │                                        │
│  │   ├─ Probability Bar │  │                                        │
│  │   └─ PDF Download    │  │                                        │
│  └──────────────────────┘  │                                        │
└────────────────────────────┴────────────────────────────────────────┘
```

---

## 🔬 Pipeline Flow

The analysis runs through a **6-stage neural pipeline**, each stage animated in real-time on the frontend:

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│          │    │              │    │              │    │              │    │              │    │              │
│  INPUT   │───▶│ PREPROCESSING│───▶│ VISION MODEL │───▶│  CLINICAL    │───▶│     LLM      │───▶│   FINAL      │
│  STAGE   │    │              │    │              │    │   LOGIC      │    │  REASONING   │    │   REPORT     │
│          │    │              │    │              │    │              │    │              │    │              │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     │                 │                   │                   │                   │                   │
  Patient         Normalization       DenseNet121         Risk Scoring      Llama 3.3 70B       Triage Report
  Data +          & Enhancement       ResNet50            Confidence        Dual-Perspective     PDF Generation
  Scan Image                          EfficientNet-B4     Band Calc         Self-Audit           Download Ready
```

### Stage Details

| Stage | Name | Description | Technology |
|:-----:|:-----|:------------|:-----------|
| `01` | **Input Ingestion** | Patient demographics, symptoms, and scan image are collected | React Form + Drag-n-Drop |
| `02` | **Preprocessing** | Image normalization, DICOM parsing, and metadata extraction | Python / NumPy |
| `03` | **Vision Model** | Organ-specific CNN generates probability scores | DenseNet-121 / ResNet-50 / EfficientNet-B4 |
| `04` | **Clinical Logic** | Risk scoring with confidence bands and triage classification | Custom Scoring Engine |
| `05` | **LLM Reasoning** | Full clinical report with doctor and patient explanations | Groq API + Llama 3.3 70B |
| `06` | **Final Report** | Compiled triage report with audit trail and PDF export | ReportLab + React |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose | Version |
|:-----------|:--------|:--------|
| **React** | UI library | 19.x |
| **Vite** | Build tool & dev server | 8.x |
| **Tailwind CSS** | Utility-first styling | 4.x |
| **Framer Motion** | Animations & transitions | Latest |
| **Chart.js** | Data visualization | Latest |
| **Lucide React** | Icon system | Latest |
| **Axios** | HTTP client | 1.x |
| **React Router** | Client-side routing | 7.x |

### Backend

| Technology | Purpose | Version |
|:-----------|:--------|:--------|
| **FastAPI** | API framework | Latest |
| **Uvicorn** | ASGI server | Latest |
| **Groq SDK** | LLM API client | Latest |
| **ReportLab** | PDF generation | 4.1.0 |
| **Pydantic** | Data validation | Latest |
| **python-dotenv** | Environment config | Latest |

---

## 📁 Project Structure

```
oncodetect/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Environment variables (GROQ_API_KEY)
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── reasoning/
│   │   ├── prompt_builder.py      # LLM prompt construction
│   │   ├── clinical_reasoner.py   # Primary LLM clinical report
│   │   └── self_auditor.py        # Secondary LLM audit pass
│   └── routers/
│       ├── analyze.py             # /api/analyze endpoint
│       └── report.py              # /api/report PDF endpoint
│
├── frontend/
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── index.html                 # HTML entry
│   └── src/
│       ├── App.jsx                # Router & layout
│       ├── index.css              # Global design system
│       ├── main.jsx               # React entry
│       ├── components/
│       │   ├── Navbar.jsx         # Navigation bar
│       │   ├── CaseLibrary.jsx    # Sample case selector
│       │   ├── Toast.jsx          # Notification toasts
│       │   ├── LoadingSkeleton.jsx # Loading placeholders
│       │   ├── ErrorBoundary.jsx  # Crash handler
│       │   └── DisclaimerBanner.jsx
│       ├── context/
│       │   └── PatientContext.jsx  # Global state
│       ├── hooks/
│       │   └── usePageTransition.js
│       └── pages/
│           ├── Entrance.jsx       # Landing / initialization
│           ├── SignIn.jsx         # Authentication (demo)
│           ├── Dashboard.jsx      # System overview
│           ├── NewAnalysis.jsx    # Patient intake form
│           ├── Analysis.jsx       # Pipeline visualization
│           ├── Report.jsx         # Clinical report view
│           └── NotFound.jsx       # 404 page
│
├── .gitignore
├── render.yaml                    # Render deployment config
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **Groq API Key** → [Get one free at console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/vishva2410/ONCO-DETECT-.git
cd ONCO-DETECT-
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

### 4. Open the Application

Navigate to **http://localhost:5173** in your browser.

---

## 🌐 Deployment

### Deploy on Render (Recommended)

This project is configured for **[Render](https://render.com)** with a `render.yaml` blueprint.

#### Option A: One-Click Deploy

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **"New"** → **"Blueprint"**
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and deploy both services

#### Option B: Manual Deploy

**Backend (Web Service):**

| Setting | Value |
|:--------|:------|
| **Environment** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Root Directory** | `backend` |
| **Env Variable** | `GROQ_API_KEY` = your key |

**Frontend (Static Site):**

| Setting | Value |
|:--------|:------|
| **Build Command** | `npm install --legacy-peer-deps && npm run build` |
| **Publish Directory** | `dist` |
| **Root Directory** | `frontend` |
| **Env Variable** | `VITE_API_URL` = your backend URL |

---

## 🔐 Environment Variables

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `GROQ_API_KEY` | ✅ | API key for Groq LLM service |
| `VITE_API_URL` | ⬜ | Backend API URL (defaults to `http://localhost:8000`) |
| `PORT` | ⬜ | Server port (auto-set by Render) |

---

## 📸 Pages Overview

| Page | Description |
|:-----|:------------|
| **🚀 Entrance** | Cinematic initialization sequence with neural logo animation |
| **🔐 Sign In** | Secure gateway with demo credentials support |
| **📊 Dashboard** | System architecture graph, stats cards, and capability overview |
| **📋 New Analysis** | Patient intake form with organ selector and drag-drop upload |
| **⚡ Analysis** | Real-time 6-stage pipeline flowchart with animated progress |
| **📄 Report** | Full clinical report with triage badge, probability bars, and PDF export |

---

## 🔄 API Reference

### `POST /api/analyze`

Processes a patient case through the full analysis pipeline.

**Request:** `multipart/form-data`

| Field | Type | Description |
|:------|:-----|:------------|
| `patient_data` | `string (JSON)` | Patient demographics and symptoms |
| `scan_file` | `file` | Medical scan image (JPEG/PNG/DICOM) |

**Response:**

```json
{
  "organType": "lung",
  "probabilityScore": 0.74,
  "confidenceBand": [0.68, 0.81],
  "triageLevel": "high",
  "reasoningTrace": "Step-by-step clinical reasoning...",
  "riskSummary": "Elevated risk indicators detected...",
  "doctorExplanation": "Clinical narrative for physicians...",
  "patientExplanation": "Simplified explanation for patients...",
  "triageRecommendation": "Referral recommendations...",
  "differentialHints": ["Adenocarcinoma", "Squamous Cell"],
  "confidenceNote": "Model confidence assessment...",
  "auditPassed": true,
  "auditFlags": [],
  "modelSource": "densenet121"
}
```

### `GET /api/report/pdf`

Generates and downloads a PDF clinical report.

---

## 🧪 Development

```bash
# Run frontend in dev mode
cd frontend && npm run dev

# Run backend with hot reload
cd backend && uvicorn main:app --reload

# Build frontend for production
cd frontend && npm run build
```

---

## 📝 License

This project is built for **academic and demonstration purposes**. 

---

<p align="center">
  <sub>Built with 🧬 by <b>Vishva</b> • Powered by Groq + Llama 3.3 70B</sub>
</p>
