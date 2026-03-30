from pydantic import BaseModel
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
    recommendations: List[str] = []
    differentialHints: List[str] = []
    confidenceNote: str = ""
    auditPassed: bool = True
    auditFlags: List[str]
    modelSource: str = "resnet50"
