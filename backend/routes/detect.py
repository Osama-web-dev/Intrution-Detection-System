from datetime import datetime
from typing import List
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database.db import get_db
from ..database.models import DetectionLog
from ..ml.model import PhishingModel
from ..utils.logger import get_logger

router = APIRouter(prefix="/api")
logger = get_logger("routes.detect")
model = PhishingModel()

SENTENCE_SPLIT_PATTERN = re.compile(r"(?<=[.!?])\s+")


class DetectRequest(BaseModel):
    email_text: str = Field(..., min_length=1)


class SignalResponse(BaseModel):
    url_count: int
    keyword_count: int
    money_claim_count: int
    has_credential_language: bool
    has_urgency_language: bool


class DetectResponse(BaseModel):
    prediction: str
    confidence: float
    risk_score: int
    signals: SignalResponse
    top_reasons: List[str]


class BatchDetectRequest(BaseModel):
    emails: List[str] = Field(..., min_items=1, max_items=25)


class BatchDetectResponse(BaseModel):
    total: int
    phishing_count: int
    legitimate_count: int
    average_risk_score: float
    results: List[DetectResponse]


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


class StatsResponse(BaseModel):
    total_scans: int
    phishing_count: int
    legitimate_count: int
    average_risk_score: float
    last_scan_at: str | None


@router.post("/detect", response_model=DetectResponse)
def detect_email(request: DetectRequest, db: Session = Depends(get_db)):
    try:
        result = model.predict(request.email_text)

        db_log = DetectionLog(
            email_text=request.email_text,
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk_score=result["risk_score"],
        )
        db.add(db_log)
        db.commit()

        logger.info("Detection performed: %s (Risk: %s%%)", result["prediction"], result["risk_score"])
        return result
    except Exception as e:
        logger.error("Error during detection: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during detection")


@router.post("/detect/batch", response_model=BatchDetectResponse)
def detect_batch(request: BatchDetectRequest, db: Session = Depends(get_db)):
    try:
        emails = [item.strip() for item in request.emails if item and item.strip()]
        if not emails:
            raise HTTPException(status_code=400, detail="No valid email text provided")

        results = model.predict_many(emails)

        logs = [
            DetectionLog(
                email_text=email,
                prediction=result["prediction"],
                confidence=result["confidence"],
                risk_score=result["risk_score"],
            )
            for email, result in zip(emails, results)
        ]
        db.bulk_save_objects(logs)
        db.commit()

        phishing_count = sum(1 for item in results if item["prediction"] == "phishing")
        total = len(results)
        average_risk_score = round(sum(item["risk_score"] for item in results) / total, 2)

        return {
            "total": total,
            "phishing_count": phishing_count,
            "legitimate_count": total - phishing_count,
            "average_risk_score": average_risk_score,
            "results": results,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error during batch detection: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during batch detection")


@router.get("/logs", response_model=List[LogResponse])
def get_logs(
    limit: int = Query(default=50, ge=1, le=5000), 
    start_date: str = Query(default=None),
    end_date: str = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionLog)

    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(DetectionLog.timestamp >= start_dt)
        except ValueError:
            pass

    if end_date:
        try:
            end_dt = datetime.strptime(end_date + " 23:59:59", "%Y-%m-%d %H:%M:%S")
            query = query.filter(DetectionLog.timestamp <= end_dt)
        except ValueError:
            pass

    logs = query.order_by(DetectionLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "email_text": log.email_text,
            "prediction": log.prediction,
            "confidence": log.confidence,
            "risk_score": log.risk_score,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for log in logs
    ]


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_scans = db.query(func.count(DetectionLog.id)).scalar() or 0
    phishing_count = db.query(func.count(DetectionLog.id)).filter(DetectionLog.prediction == "phishing").scalar() or 0
    legitimate_count = total_scans - phishing_count

    average_risk_score = db.query(func.avg(DetectionLog.risk_score)).scalar()
    average_risk_score = round(float(average_risk_score), 2) if average_risk_score is not None else 0.0

    last_scan = db.query(func.max(DetectionLog.timestamp)).scalar()
    last_scan_at = last_scan.strftime("%Y-%m-%d %H:%M:%S") if isinstance(last_scan, datetime) else None

    return {
        "total_scans": total_scans,
        "phishing_count": phishing_count,
        "legitimate_count": legitimate_count,
        "average_risk_score": average_risk_score,
        "last_scan_at": last_scan_at,
    }


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_email(request: SummarizeRequest):
    try:
        text = request.email_text.strip()
        if not text:
            return {"summary": "No content provided."}

        sentences = SENTENCE_SPLIT_PATTERN.split(text)

        if len(sentences) <= 2:
            summary = text
        else:
            summary = " ".join(sentences[:2])
            if len(summary) > 240:
                summary = summary[:240] + "..."

        return {"summary": summary}
    except Exception as e:
        logger.error("Error during summarization: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during summarization")
