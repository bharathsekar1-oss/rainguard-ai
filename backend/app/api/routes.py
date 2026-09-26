from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from app.schemas.prediction import PredictionInput, PredictionOutput, SimulationInput, LocationInfo, HistoryEntry
from app.services.prediction_service import process_prediction, process_simulation
from app.database.connection import get_db
from app.models.database_models import PredictionHistory
from app.ml.predictor import predictor

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor.is_loaded(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/predict", response_model=PredictionOutput)
def predict(input_data: PredictionInput, db: Session = Depends(get_db)):
    return process_prediction(input_data, db)

@router.post("/simulate", response_model=PredictionOutput)
def simulate(input_data: SimulationInput):
    return process_simulation(input_data)

@router.get("/locations", response_model=List[LocationInfo])
def get_locations():
    return [
        {
            "name": "Chennai (T. Nagar)",
            "latitude": 13.0418,
            "longitude": 80.2341,
            "elevation": 12,
            "urbanization_factor": 0.85,
            "drainage_factor": 0.3,
            "default_rainfall": {"rainfall_1h": 50, "rainfall_3h": 100, "rainfall_6h": 150, "rainfall_24h": 250},
            "description": "Coastal city, flood-prone during monsoon"
        },
        {
            "name": "Bengaluru (Koramangala)",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "elevation": 900,
            "urbanization_factor": 0.8,
            "drainage_factor": 0.4,
            "default_rainfall": {"rainfall_1h": 40, "rainfall_3h": 80, "rainfall_6h": 120, "rainfall_24h": 180},
            "description": "Urban flooding due to encroached lakes"
        },
        {
            "name": "Kochi (Ernakulam)",
            "latitude": 9.9816,
            "longitude": 76.2999,
            "elevation": 2,
            "urbanization_factor": 0.75,
            "drainage_factor": 0.25,
            "default_rainfall": {"rainfall_1h": 70, "rainfall_3h": 130, "rainfall_6h": 200, "rainfall_24h": 400},
            "description": "Low-lying coastal city, vulnerable to extreme rain"
        },
        {
            "name": "Hyderabad (Begumpet)",
            "latitude": 17.4447,
            "longitude": 78.4664,
            "elevation": 540,
            "urbanization_factor": 0.90,
            "drainage_factor": 0.35,
            "default_rainfall": {"rainfall_1h": 45, "rainfall_3h": 90, "rainfall_6h": 130, "rainfall_24h": 190},
            "description": "Prone to flash floods during heavy downpours"
        },
        {
            "name": "Thiruvananthapuram (Pettah)",
            "latitude": 8.4975,
            "longitude": 76.9386,
            "elevation": 10,
            "urbanization_factor": 0.65,
            "drainage_factor": 0.4,
            "default_rainfall": {"rainfall_1h": 55, "rainfall_3h": 110, "rainfall_6h": 160, "rainfall_24h": 280},
            "description": "Coastal terrain with monsoon vulnerability"
        }
    ]

@router.get("/history", response_model=List[HistoryEntry])
def get_history(db: Session = Depends(get_db)):
    entries = db.query(PredictionHistory).order_by(PredictionHistory.timestamp.desc()).limit(100).all()
    return entries

@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    db.query(PredictionHistory).delete()
    db.commit()
    return {"status": "History cleared"}

from sqlalchemy import func

@router.get("/risk/historical")
def get_historical_risk(db: Session = Depends(get_db)):
    # Aggregate by rounding latitude and longitude to 1 decimal place
    results = db.query(
        func.round(PredictionHistory.latitude, 1).label('lat'),
        func.round(PredictionHistory.longitude, 1).label('lng'),
        func.avg(PredictionHistory.flood_probability).label('avg_risk'),
        func.avg(PredictionHistory.rainfall_24h).label('avg_rainfall'),
        func.count(PredictionHistory.id).label('event_count')
    ).group_by(
        func.round(PredictionHistory.latitude, 1),
        func.round(PredictionHistory.longitude, 1)
    ).all()
    
    historical_zones = []
    for r in results:
        if r.lat is None or r.lng is None:
            continue
        avg_r = r.avg_risk or 0
        
        if avg_r >= 0.75:
            risk = 'CRITICAL'
        elif avg_r >= 0.5:
            risk = 'HIGH'
        elif avg_r >= 0.25:
            risk = 'MODERATE'
        else:
            risk = 'LOW'
            
        historical_zones.append({
            'lat': r.lat,
            'lng': r.lng,
            'historicalRisk': risk,
            'avgRainfall': round(r.avg_rainfall, 2) if r.avg_rainfall else 0,
            'eventCount': r.event_count
        })
    return historical_zones
