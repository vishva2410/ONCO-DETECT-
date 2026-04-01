import io
import base64
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import (
  HexColor, black, white, gray
)
from reportlab.platypus import (
  SimpleDocTemplate, Paragraph, Spacer,
  Table, TableStyle, HRFlowable, Image,
  ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from pydantic import BaseModel
from pydantic import Field
from typing import List, Optional

router = APIRouter()

class ReportRequest(BaseModel):
    patientName: str
    patientAge: str
    patientGender: str
    organType: str
    probabilityScore: float
    confidenceBand: List[float]
    triageLevel: str
    reasoningTrace: str
    riskSummary: str
    doctorExplanation: str
    patientExplanation: str
    triageRecommendation: str
    differentialHints: List[str]
    confidenceNote: str
    auditFlags: List[str]
    auditPassed: bool
    recommendations: List[str] = Field(default_factory=list)
    heatmapBase64: Optional[str] = None
    modelSource: Optional[str] = "resnet50"

# Color constants
COLOR_DARK       = HexColor("#0A0F1E")
COLOR_TEAL       = HexColor("#00D4A8")
COLOR_TEAL_LIGHT = HexColor("#E6FBF7")
COLOR_AMBER      = HexColor("#FFBC42")
COLOR_AMBER_LIGHT= HexColor("#FFF8E6")
COLOR_RED        = HexColor("#FF4444")
COLOR_RED_LIGHT  = HexColor("#FFE8E8")
COLOR_GREEN      = HexColor("#00C853")
COLOR_GREEN_LIGHT= HexColor("#E8FFF0")
COLOR_GRAY       = HexColor("#7A8DA8")
COLOR_LIGHT_GRAY = HexColor("#F5F7FA")
COLOR_BORDER     = HexColor("#E2E8F0")

def get_triage_colors(triage_level: str):
    if triage_level.lower() == "high":
        return (COLOR_RED_LIGHT, COLOR_RED, "HIGH RISK")
    elif triage_level.lower() == "moderate":
        return (COLOR_AMBER_LIGHT, COLOR_AMBER, "MODERATE RISK")
    elif triage_level.lower() == "low":
        return (COLOR_GREEN_LIGHT, COLOR_GREEN, "LOW RISK")
    else:
        return (COLOR_LIGHT_GRAY, COLOR_GRAY, "UNKNOWN")

@router.post("/generate")
async def generate_pdf_report(data: ReportRequest):
    try:
        # Sanitize missing fields
        data.reasoningTrace = data.reasoningTrace or "Not available"
        data.riskSummary = data.riskSummary or "Not available"
        data.confidenceNote = data.confidenceNote or ""
        data.triageRecommendation = data.triageRecommendation or "Consult a clinician"
        data.differentialHints = data.differentialHints or []
        data.auditFlags = data.auditFlags or []
        data.recommendations = data.recommendations or []

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm,
            title=f"OncoDetect Report — {data.patientName}"
        )

        styles = getSampleStyleSheet()
        
        style_title = ParagraphStyle(
            "Title", parent=styles["Normal"],
            fontSize=22, fontName="Helvetica-Bold",
            textColor=COLOR_DARK, spaceAfter=4,
            alignment=TA_CENTER
        )
        style_subtitle = ParagraphStyle(
            "Subtitle", parent=styles["Normal"],
            fontSize=11, fontName="Helvetica",
            textColor=COLOR_GRAY, spaceAfter=2,
            alignment=TA_CENTER
        )
        style_section_header = ParagraphStyle(
            "SectionHeader", parent=styles["Normal"],
            fontSize=13, fontName="Helvetica-Bold",
            textColor=COLOR_DARK, spaceBefore=14,
            spaceAfter=6, borderPadding=(0,0,4,0)
        )
        style_body = ParagraphStyle(
            "Body", parent=styles["Normal"],
            fontSize=10, fontName="Helvetica",
            textColor=COLOR_DARK, spaceAfter=6,
            leading=16
        )
        style_muted = ParagraphStyle(
            "Muted", parent=styles["Normal"],
            fontSize=9, fontName="Helvetica-Oblique",
            textColor=COLOR_GRAY, spaceAfter=4
        )
        style_disclaimer = ParagraphStyle(
            "Disclaimer", parent=styles["Normal"],
            fontSize=8, fontName="Helvetica",
            textColor=COLOR_GRAY, alignment=TA_CENTER,
            spaceAfter=4
        )

        story = []

        # --- HEADER SECTION ---
        header_data = [
            [Paragraph("<font color='#00D4A8'><b>OncoDetect</b></font>", style_title)],
            [Paragraph("<font color='white'>AI-Assisted Cancer Triage Report</font>", style_subtitle)]
        ]
        header_table = Table(header_data, colWidths=[doc.width])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLOR_DARK),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 8*mm))

        # --- PATIENT INFO TABLE ---
        story.append(Paragraph("Patient Information", style_section_header))
        
        info_data = [
            ["Patient Name", data.patientName],
            ["Age", f"{data.patientAge} years"],
            ["Gender", data.patientGender],
            ["Organ Analyzed", data.organType.capitalize()],
            ["Report Date", datetime.now().strftime("%d %B %Y, %H:%M")],
            ["Model Source", data.modelSource]
        ]
        
        info_table = Table(info_data, colWidths=[doc.width*0.3, doc.width*0.7])
        info_table.setStyle(TableStyle([
            ('TEXTCOLOR', (0, 0), (0, -1), COLOR_GRAY),
            ('TEXTCOLOR', (1, 0), (1, -1), COLOR_DARK),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ]))
        # Apply alternating backgrounds
        for row in range(len(info_data)):
            if row % 2 == 0:
                info_table.setStyle(TableStyle([('BACKGROUND', (0, row), (-1, row), COLOR_LIGHT_GRAY)]))
                
        story.append(info_table)
        story.append(Spacer(1, 6*mm))

        # --- TRIAGE BADGE SECTION ---
        story.append(Paragraph("Triage Assessment", style_section_header))
        
        bg_color, accent_color, text_label = get_triage_colors(data.triageLevel)
        
        badge_data = [[Paragraph(f"<b>{text_label}</b>", ParagraphStyle("Badge", parent=style_title, textColor=accent_color, fontSize=16))]]
        badge_table = Table(badge_data, colWidths=[doc.width])
        badge_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOX', (0, 0), (-1, -1), 2, accent_color),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(badge_table)
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph(data.riskSummary, style_body))
        story.append(Spacer(1, 6*mm))

        # --- PROBABILITY RESULTS SECTION ---
        story.append(Paragraph("AI Analysis Results", style_section_header))
        
        prob_data = [
            ["Metric", "Value", "Confidence Band"],
            [f"{data.organType.capitalize()} probability", 
             f"{data.probabilityScore:.2f}", 
             f"{data.confidenceBand[0]:.2f} — {data.confidenceBand[1]:.2f}"]
        ]
        
        prob_table = Table(prob_data, colWidths=[doc.width*0.4, doc.width*0.3, doc.width*0.3])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), COLOR_LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, 0), COLOR_DARK),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('LINEABOVE', (0, 0), (-1, 0), 1, COLOR_BORDER),
            ('LINEBELOW', (0, 0), (-1, 0), 1, COLOR_BORDER),
            ('LINEBELOW', (0, -1), (-1, -1), 1, COLOR_BORDER),
        ]))
        story.append(prob_table)
        story.append(Spacer(1, 4*mm))
        
        if data.confidenceNote:
            story.append(Paragraph(data.confidenceNote, style_muted))
        story.append(Spacer(1, 4*mm))

        # --- HEATMAP IMAGE ---
        if data.heatmapBase64:
            story.append(Paragraph("AI Attention Map", style_section_header))
            try:
                img_data = data.heatmapBase64.replace("data:image/jpeg;base64,", "").replace("data:image/png;base64,", "")
                img_bytes = base64.b64decode(img_data)
                img_buffer = io.BytesIO(img_bytes)
                img = Image(img_buffer, width=80*mm, height=80*mm)
                
                # Center the image
                img_table = Table([[img]], colWidths=[doc.width])
                img_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
                story.append(img_table)
                story.append(Spacer(1, 2*mm))
                story.append(Paragraph("Red regions indicate areas most influential in the AI prediction.", style_muted))
                story.append(Spacer(1, 4*mm))
            except Exception as e:
                print(f"Failed to process heatmap: {e}")

        # --- CLINICAL REASONING SECTION ---
        story.append(Paragraph("Clinical Reasoning Trace", style_section_header))
        story.append(HRFlowable(width="100%", color=COLOR_BORDER, thickness=0.5))
        story.append(Spacer(1, 2*mm))
        story.append(Paragraph(data.reasoningTrace.replace('\n', '<br/>'), style_body))
        story.append(Spacer(1, 4*mm))

        # --- CLINICIAN EXPLANATION SECTION ---
        story.append(Paragraph("Clinician Assessment", style_section_header))
        story.append(HRFlowable(width="100%", color=COLOR_BORDER, thickness=0.5))
        story.append(Spacer(1, 2*mm))
        story.append(Paragraph(data.doctorExplanation.replace('\n', '<br/>'), style_body))
        
        if data.differentialHints:
            story.append(Spacer(1, 2*mm))
            story.append(Paragraph("<b>Differential Considerations</b>", style_body))
            list_items = [ListItem(Paragraph(hint, style_body), leftIndent=15, bulletColor=COLOR_DARK) for hint in data.differentialHints]
            story.append(ListFlowable(list_items, bulletType='bullet', bulletFontSize=10, start='circle'))
        story.append(Spacer(1, 4*mm))

        # --- PATIENT EXPLANATION SECTION ---
        story.append(Paragraph("Patient Summary", style_section_header))
        story.append(HRFlowable(width="100%", color=COLOR_BORDER, thickness=0.5))
        story.append(Spacer(1, 2*mm))
        story.append(Paragraph(data.patientExplanation.replace('\n', '<br/>'), style_body))
        story.append(Spacer(1, 4*mm))

        # --- RECOMMENDATIONS SECTION ---
        story.append(Paragraph("Triage Recommendation", style_section_header))
        
        rec_data = [[Paragraph(f"<b>{data.triageRecommendation}</b>", style_body)]]
        rec_table = Table(rec_data, colWidths=[doc.width])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.5, bg_color),
            ('LINELEFT', (0, 0), (0, -1), 3, accent_color),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 4*mm))
        
        if data.recommendations:
            rec_items = [ListItem(Paragraph(rec, style_body), leftIndent=15, bulletColor=COLOR_DARK) for rec in data.recommendations]
            story.append(ListFlowable(rec_items, bulletType='bullet', bulletFontSize=10, start='circle'))
        story.append(Spacer(1, 4*mm))

        # --- AUDIT FLAGS SECTION ---
        if data.auditFlags:
            story.append(Paragraph("Quality Flags", style_section_header))
            
            flags_header = [[Paragraph("<b>This report was flagged for the following considerations:</b>", style_body)]]
            flags_content = [[Paragraph(f"<font color='{COLOR_AMBER}'>• {flag}</font>", style_body)] for flag in data.auditFlags]
            
            flags_table = Table(flags_header + flags_content, colWidths=[doc.width])
            flags_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), COLOR_AMBER_LIGHT),
                ('BOX', (0, 0), (-1, -1), 1, COLOR_AMBER),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ]))
            story.append(flags_table)
            story.append(Spacer(1, 6*mm))

        # --- DISCLAIMER FOOTER ---
        story.append(HRFlowable(width="100%", color=COLOR_BORDER, thickness=0.5))
        story.append(Spacer(1, 4*mm))
        
        story.append(Paragraph("IMPORTANT DISCLAIMER", ParagraphStyle("DisclaimerBold", parent=style_disclaimer, fontName="Helvetica-Bold")))
        story.append(Paragraph("OncoDetect is an AI-assisted decision-support prototype. This report does not constitute a medical diagnosis. All findings must be reviewed and interpreted by a qualified medical professional before any clinical action is taken.", style_disclaimer))
        story.append(Paragraph(f"This report was generated automatically by the OncoDetect AI system on {datetime.now().strftime('%d %B %Y at %H:%M')}.", style_disclaimer))
        story.append(Paragraph("OncoDetect v1.0 — Research Prototype — Not for Clinical Use", style_disclaimer))

        doc.build(story)
        buffer.seek(0)

        filename = f"OncoDetect_{data.patientName.replace(' ', '_')}_Report.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
