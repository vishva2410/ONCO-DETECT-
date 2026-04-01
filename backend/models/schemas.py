from pydantic import BaseModel, Field
from typing import List, Optional


class PatientData(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""
    symptoms: str = ""
    smokingHistory: bool = False
    familyHistory: bool = False
    organType: str = ""


class AnalysisResponse(BaseModel):
    reportId: Optional[str] = None
    organType: str
    probabilityScore: float
    confidenceBand: List[float]
    heatmapBase64: Optional[str] = None
    triageLevel: str
    reasoningTrace: str = ""
    riskSummary: str = ""
    doctorExplanation: str
    patientExplanation: str
    triageRecommendation: str = ""
    recommendations: List[str] = Field(default_factory=list)
    differentialHints: List[str] = Field(default_factory=list)
    confidenceNote: str = ""
    auditPassed: bool = True
    auditFlags: List[str] = Field(default_factory=list)
    modelSource: str = "resnet50"


class ReportSaveResponse(BaseModel):
    status: str
    report_id: str


class ReportSummary(BaseModel):
    id: str
    created_at: Optional[str] = None
    patient_name: str
    patient_id: str
    organ_type: str
    triage_level: str
    probability_score: float


class ReportDetail(BaseModel):
    id: str
    created_at: Optional[str] = None
    patientName: str
    patientAge: str
    patientGender: str
    organType: str
    probabilityScore: float
    confidenceBand: List[float]
    triageLevel: str
    modelSource: str
    reasoningTrace: str
    riskSummary: str
    doctorExplanation: str
    patientExplanation: str
    triageRecommendation: str
    differentialHints: List[str] = Field(default_factory=list)
    confidenceNote: str = ""
    auditFlags: List[str] = Field(default_factory=list)
    auditPassed: bool = True
    heatmapBase64: Optional[str] = None
