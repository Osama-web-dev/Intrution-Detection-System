from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .db import Base

class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    email_text = Column(String)
    prediction = Column(String)
    confidence = Column(Float)
    risk_score = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
