from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from ..database.db import get_db
from ..database.models import DetectionLog
from ..ml.model import PhishingModel
from ..utils.logger import get_logger

router = APIRouter(prefix="/api")
logger = get_logger("routes.detect")
model = PhishingModel()

class DetectRequest(BaseModel):
    email_text: str

class DetectResponse(BaseModel):
    prediction: str
    confidence: float
    risk_score: int

class SummarizeRequest(BaseModel):
    email_text: str

class SummarizeResponse(BaseModel):
    summary: str

class LogResponse(BaseModel):
    id: int
    email_text: str
    prediction: str
    confidence: float
    risk_score: int
    timestamp: str

@router.post("/detect", response_model=DetectResponse)
def detect_email(request: DetectRequest, db: Session = Depends(get_db)):
    try:
        # Perform prediction
        result = model.predict(request.email_text)
        
        # Log to database
        db_log = DetectionLog(
            email_text=request.email_text,
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk_score=result["risk_score"]
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        logger.info(f"Detection performed: {result['prediction']} (Risk: {result['risk_score']}%)")
        return result
    except Exception as e:
        logger.error(f"Error during detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during detection")

@router.get("/logs", response_model=List[LogResponse])
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(DetectionLog).order_by(DetectionLog.timestamp.desc()).all()
    # Format timestamp to string
    return [
        {
            "id": log.id,
            "email_text": log.email_text,
            "prediction": log.prediction,
            "confidence": log.confidence,
            "risk_score": log.risk_score,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for log in logs
    ]

@router.post("/summarize", response_model=SummarizeResponse)
def summarize_email(request: SummarizeRequest):
    try:
        text = request.email_text.strip()
        if not text:
            return {"summary": "No content provided."}
        
        # Simple extractive summarization logic
        # Split into sentences (basic version)
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        if len(sentences) <= 2:
            summary = text
        else:
            # Take the first two sentences as a basic summary
            summary = " ".join(sentences[:2])
            if len(summary) > 200: # Cap length
                summary = summary[:200] + "..."
                
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Error during summarization: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during summarization")
