from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PredictionInput(BaseModel):
    # ── IMD / Weather ──────────────────────────────────────────────────────────
    rainfall_1h:   float = Field(ge=0, le=200, default=0, description="1-hour rainfall (IMD, mm)")
    rainfall_3h:   float = Field(ge=0, le=500, default=0, description="3-hour rainfall (IMD, mm)")
    rainfall_6h:   float = Field(ge=0, le=700, default=0, description="6-hour rainfall (IMD, mm)")
    rainfall_24h:  float = Field(ge=0, le=1000, default=0, description="24-hour cumulative rainfall (IMD, mm)")
    temperature:   float = Field(ge=-10, le=55, default=30,   description="Air temperature (°C)")
    humidity:      float = Field(ge=0,   le=100, default=70,  description="Relative humidity (%)")
    wind_speed:    float = Field(ge=0,   le=150, default=15,  description="Wind speed (km/h)")
    sunshine_hours:float = Field(ge=0,   le=12,  default=6,   description="Sunshine hours/day")

    # ── Radar ─────────────────────────────────────────────────────────────────
    radar_reflectivity_dbz: float = Field(ge=0, le=65, default=20,
        description="Doppler radar reflectivity (dBZ)")

    # ── CHIRPS ────────────────────────────────────────────────────────────────
    chirps_precip_anomaly: float = Field(ge=-200, le=500, default=0,
        description="CHIRPS precipitation anomaly vs climatology (mm)")

    # ── NWP (GFS / ECMWF) ────────────────────────────────────────────────────
    nwp_forecast_6h:  float = Field(ge=0, le=300, default=10,
        description="NWP 6h rainfall forecast (mm)")
    nwp_forecast_24h: float = Field(ge=0, le=500, default=25,
        description="NWP 24h rainfall forecast (mm)")

    # ── SRTM DEM ─────────────────────────────────────────────────────────────
    elevation:         float = Field(ge=0, le=5000, default=50,
        description="Terrain elevation (SRTM, m)")
    slope:             float = Field(ge=0, le=45,   default=3,
        description="Terrain slope (SRTM, degrees)")
    flow_accumulation: float = Field(ge=1, le=100000, default=200,
        description="Upstream flow accumulation (SRTM cells)")

    # ── Sentinel-1 SAR ────────────────────────────────────────────────────────
    sar_backscatter_vv: float = Field(ge=-35, le=0,  default=-12,
        description="Sentinel-1 VV backscatter (dB)")
    sar_backscatter_vh: float = Field(ge=-40, le=-5, default=-19,
        description="Sentinel-1 VH backscatter (dB)")
    sar_flood_index:    float = Field(ge=-10, le=10, default=7,
        description="SAR-derived flood index (lower = more water)")

    # ── Sentinel-2 optical ────────────────────────────────────────────────────
    ndwi: float = Field(ge=-1, le=1, default=-0.2,
        description="Normalized Difference Water Index (Sentinel-2)")
    ndvi: float = Field(ge=-1, le=1, default=0.4,
        description="Normalized Difference Vegetation Index (Sentinel-2)")

    # ── River gauge ───────────────────────────────────────────────────────────
    river_level_normalized: float = Field(ge=0, le=10, default=2,
        description="Normalized river gauge level (m)")

    # ── Land / terrain ────────────────────────────────────────────────────────
    urbanization_factor:  float = Field(ge=0, le=1, default=0.5)
    drainage_factor:      float = Field(ge=0, le=1, default=0.5)
    soil_moisture_pct:    float = Field(ge=0, le=100, default=40,
        description="Volumetric soil moisture (%)")
    distance_to_water_km: float = Field(ge=0, le=100, default=5,
        description="Distance to nearest water body (km)")

    # ── Meta ──────────────────────────────────────────────────────────────────
    latitude:      Optional[float] = None
    longitude:     Optional[float] = None
    location_name: Optional[str]   = None


class SimulationInput(PredictionInput):
    """Identical to PredictionInput – not saved to DB."""
    pass


class PredictionOutput(BaseModel):
    flood_probability:   float
    risk_level:          str
    severity:            str
    confidence:          float
    contributing_factors: List[str]
    recommendations:     List[str]
    timestamp:           datetime
    input_data:          Dict[str, Any]


class LocationInfo(BaseModel):
    name:                str
    latitude:            float
    longitude:           float
    elevation:           float
    urbanization_factor: float
    drainage_factor:     float
    default_rainfall:    dict
    description:         str


class HistoryEntry(BaseModel):
    id:                int
    timestamp:         datetime
    location_name:     Optional[str]
    latitude:          Optional[float]
    longitude:         Optional[float]
    rainfall_1h:       float
    rainfall_24h:      float
    flood_probability: float
    risk_level:        str
    status:            str
