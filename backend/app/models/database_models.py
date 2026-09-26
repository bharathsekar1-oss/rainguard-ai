from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from app.database.connection import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    rainfall_1h = Column(Float)
    rainfall_3h = Column(Float)
    rainfall_6h = Column(Float)
    rainfall_24h = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    elevation = Column(Float)
    urbanization_factor = Column(Float)
    drainage_factor = Column(Float)
    flood_probability = Column(Float)
    risk_level = Column(String)
    severity = Column(String)
    confidence = Column(Float)
    status = Column(String, default='active')
