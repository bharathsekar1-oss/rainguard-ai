from datetime import datetime, timezone
from app.schemas.prediction import PredictionInput, PredictionOutput, SimulationInput
from app.ml.predictor import predictor
from app.models.database_models import PredictionHistory
from sqlalchemy.orm import Session
from app.services.realtime_service import get_realtime_weather, get_satellite_features, get_location_name

def process_prediction(input_data: PredictionInput, db: Session) -> PredictionOutput:
    features = input_data.model_dump()
    
    # Attempt to fetch real-time data if coordinates are provided
    if input_data.latitude is not None and input_data.longitude is not None:
        if not input_data.location_name or input_data.location_name == "Selected Coordinates":
            features["location_name"] = get_location_name(input_data.latitude, input_data.longitude)
        
        realtime_weather = get_realtime_weather(input_data.latitude, input_data.longitude)
        if realtime_weather:
            features.update(realtime_weather)
            
        realtime_satellite = get_satellite_features(input_data.latitude, input_data.longitude)
        if realtime_satellite:
            features.update(realtime_satellite)
            
    result = predictor.predict(features)
    
    timestamp = datetime.now(timezone.utc)
    
    db_entry = PredictionHistory(
        timestamp=timestamp,
        latitude=input_data.latitude,
        longitude=input_data.longitude,
        location_name=input_data.location_name,
        rainfall_1h=input_data.rainfall_1h,
        rainfall_3h=input_data.rainfall_3h,
        rainfall_6h=input_data.rainfall_6h,
        rainfall_24h=input_data.rainfall_24h,
        temperature=input_data.temperature,
        humidity=input_data.humidity,
        wind_speed=input_data.wind_speed,
        elevation=input_data.elevation,
        urbanization_factor=input_data.urbanization_factor,
        drainage_factor=input_data.drainage_factor,
        flood_probability=result["flood_probability"],
        risk_level=result["risk_level"],
        severity=result["severity"],
        confidence=result["confidence"]
    )
    
    db.add(db_entry)
    db.commit()
    
    return PredictionOutput(
        flood_probability=result["flood_probability"],
        risk_level=result["risk_level"],
        severity=result["severity"],
        confidence=result["confidence"],
        contributing_factors=result["contributing_factors"],
        recommendations=result["recommendations"],
        timestamp=timestamp,
        input_data=features
    )

def process_simulation(input_data: SimulationInput) -> PredictionOutput:
    features = input_data.model_dump()
    
    if input_data.latitude is not None and input_data.longitude is not None:
        if not input_data.location_name or input_data.location_name == "Selected Coordinates":
            features["location_name"] = get_location_name(input_data.latitude, input_data.longitude)
            
        realtime_weather = get_realtime_weather(input_data.latitude, input_data.longitude)
        if realtime_weather:
            features.update(realtime_weather)
            
        realtime_satellite = get_satellite_features(input_data.latitude, input_data.longitude)
        if realtime_satellite:
            features.update(realtime_satellite)
            
    result = predictor.predict(features)
    
    return PredictionOutput(
        flood_probability=result["flood_probability"],
        risk_level=result["risk_level"],
        severity=result["severity"],
        confidence=result["confidence"],
        contributing_factors=result["contributing_factors"],
        recommendations=result["recommendations"],
        timestamp=datetime.now(timezone.utc),
        input_data=features
    )
