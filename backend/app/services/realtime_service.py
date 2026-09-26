import os
import requests
from typing import Optional, Dict, Any

def get_location_name(lat: float, lon: float) -> str:
    """
    Fetches the location name using free OpenStreetMap Nominatim reverse geocoding.
    """
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1"
    headers = {
        'User-Agent': 'RainGuardAI/1.0 (contact@example.com)'
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            city = address.get("city") or address.get("town") or address.get("village") or address.get("county") or "Unknown Area"
            state = address.get("state", "Unknown State")
            return f"{city}, {state}"
    except Exception as e:
        print(f"Error fetching location name: {e}")
    return "Selected Coordinates"

def get_realtime_weather(lat: float, lon: float) -> Optional[Dict[str, float]]:
    """
    Fetches real-time weather from Open-Meteo (Free, No API Key required) for the given coordinates.
    """
    # Open-Meteo requires no API key and provides excellent historical/current weather data globally.
    # We fetch the last 24 hours of precipitation to calculate cumulative rainfall.
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation"
        "&hourly=precipitation"
        "&past_hours=24"
    )
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            hourly = data.get("hourly", {})
            
            # Calculate cumulative rainfall from the past 24 hours
            precipitation_history = hourly.get("precipitation", [])
            
            # Filter out None values in case of missing data
            valid_precip = [p for p in precipitation_history if p is not None]
            
            rain_24h = sum(valid_precip) if valid_precip else 0.0
            
            # Approximate smaller windows based on history (simplification for prototype)
            rain_1h = sum(valid_precip[-1:]) if valid_precip else 0.0
            rain_3h = sum(valid_precip[-3:]) if valid_precip else 0.0
            rain_6h = sum(valid_precip[-6:]) if valid_precip else 0.0
            
            return {
                "temperature": current.get("temperature_2m", 30.0),
                "humidity": current.get("relative_humidity_2m", 70.0),
                "wind_speed": current.get("wind_speed_10m", 0.0),
                "rainfall_1h": rain_1h,
                "rainfall_3h": rain_3h,
                "rainfall_6h": rain_6h,
                "rainfall_24h": rain_24h,
                "data_source": "Open-Meteo (IMD fallback/proxy)"
            }
    except Exception as e:
        print(f"Error fetching weather from Open-Meteo: {e}")
        
    return None

def get_satellite_features(lat: float, lon: float) -> Optional[Dict[str, float]]:
    """
    Placeholder for Sentinel Hub API integration.
    """
    return None
