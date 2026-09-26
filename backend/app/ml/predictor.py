"""
RainGuard AI – Predictor (v2)
==============================
Loads the trained pipeline (StandardScaler + GradientBoosting/RandomForest)
and exposes a predict() method that accepts the full 25-feature input dict.

All new features are OPTIONAL with sensible defaults so backward-compatibility
with the frontend is maintained while the new satellite/weather fields enhance
accuracy when provided.
"""

import joblib
import os
import numpy as np
from app.services.recommendation_service import get_recommendations

# Feature list MUST match train_model.py FEATURES
FEATURE_DEFAULTS = {
    # IMD / Weather
    'rainfall_1h':            5.0,
    'rainfall_3h':           12.0,
    'rainfall_6h':           20.0,
    'rainfall_24h':          35.0,
    'temperature':           30.0,
    'humidity':              70.0,
    'wind_speed':            15.0,
    'sunshine_hours':         6.0,
    # Radar
    'radar_reflectivity_dbz': 20.0,
    # CHIRPS
    'chirps_precip_anomaly':   0.0,
    # NWP
    'nwp_forecast_6h':        10.0,
    'nwp_forecast_24h':       25.0,
    # SRTM DEM
    'elevation':              50.0,
    'slope':                   3.0,
    'flow_accumulation':     200.0,
    # Sentinel-1 SAR
    'sar_backscatter_vv':    -12.0,
    'sar_backscatter_vh':    -19.0,
    'sar_flood_index':         7.0,
    # Sentinel-2
    'ndwi':                   -0.2,
    'ndvi':                    0.4,
    # River gauge
    'river_level_normalized':  2.0,
    # Land / terrain
    'urbanization_factor':     0.5,
    'drainage_factor':         0.5,
    'soil_moisture_pct':      40.0,
    'distance_to_water_km':    5.0,
}

FEATURE_NAMES = list(FEATURE_DEFAULTS.keys())

# Data-source labels for UI display
DATA_SOURCE_MAP = {
    'rainfall_1h':              ('IMD Rainfall',    '1-hour accumulated rainfall'),
    'rainfall_3h':              ('IMD Rainfall',    '3-hour accumulated rainfall'),
    'rainfall_6h':              ('IMD Rainfall',    '6-hour accumulated rainfall'),
    'rainfall_24h':             ('IMD Rainfall',    '24-hour cumulative rainfall'),
    'temperature':              ('IMD Surface',     'Air temperature'),
    'humidity':                 ('IMD Surface',     'Relative humidity'),
    'wind_speed':               ('IMD Surface',     'Wind speed'),
    'sunshine_hours':           ('IMD Surface',     'Sunshine duration'),
    'radar_reflectivity_dbz':   ('Doppler Radar',   'Radar reflectivity (dBZ)'),
    'chirps_precip_anomaly':    ('CHIRPS',          'Precipitation anomaly vs climatology'),
    'nwp_forecast_6h':          ('NWP / GFS',       '6h rainfall forecast'),
    'nwp_forecast_24h':         ('NWP / GFS',       '24h rainfall forecast'),
    'elevation':                ('SRTM DEM',        'Terrain elevation'),
    'slope':                    ('SRTM DEM',        'Terrain slope'),
    'flow_accumulation':        ('SRTM DEM',        'Upstream flow accumulation'),
    'sar_backscatter_vv':       ('Sentinel-1 SAR',  'VV polarisation backscatter'),
    'sar_backscatter_vh':       ('Sentinel-1 SAR',  'VH polarisation backscatter'),
    'sar_flood_index':          ('Sentinel-1 SAR',  'SAR-based flood index'),
    'ndwi':                     ('Sentinel-2',      'Normalized Difference Water Index'),
    'ndvi':                     ('Sentinel-2',      'Normalized Difference Vegetation Index'),
    'river_level_normalized':   ('River Gauge',     'River/stream gauge level'),
    'urbanization_factor':      ('Land-use',        'Urban imperviousness fraction'),
    'drainage_factor':          ('Land-use',        'Drainage infrastructure quality'),
    'soil_moisture_pct':        ('Field Sensor',    'Volumetric soil moisture'),
    'distance_to_water_km':     ('GIS',             'Distance to nearest water body'),
}

# Thresholds for contributing-factor generation
CONTRIB_THRESHOLDS = [
    ('rainfall_1h',            50,   'gt',  'Heavy short-term rainfall (IMD)'),
    ('rainfall_24h',          150,   'gt',  'High 24h cumulative rainfall (IMD)'),
    ('radar_reflectivity_dbz', 45,   'gt',  'High radar reflectivity – intense convection'),
    ('chirps_precip_anomaly',  50,   'gt',  'Above-normal precipitation (CHIRPS anomaly)'),
    ('nwp_forecast_24h',      100,   'gt',  'Heavy rainfall forecast by NWP model'),
    ('ndwi',                   0.2,  'gt',  'Elevated NDWI – water bodies expanding (Sentinel-2)'),
    ('sar_flood_index',        0,    'lt',  'SAR flood index signals surface water (Sentinel-1)'),
    ('river_level_normalized', 6.0,  'gt',  'River gauge above normal level'),
    ('elevation',              20,   'lt',  'Very low elevation – high inundation risk (SRTM)'),
    ('soil_moisture_pct',      80,   'gt',  'Saturated soil – minimal infiltration capacity'),
    ('urbanization_factor',    0.8,  'gt',  'High urbanization – reduced surface permeability'),
    ('drainage_factor',        0.3,  'lt',  'Poor drainage infrastructure'),
    ('slope',                  2,    'lt',  'Flat terrain – slow water runoff (SRTM DEM)'),
    ('ndvi',                   0.2,  'lt',  'Low vegetation – reduced evapotranspiration (Sentinel-2)'),
    ('sunshine_hours',         2,    'lt',  'Overcast conditions – reduced evaporation'),
]


class Predictor:
    def __init__(self):
        self.pipeline  = None
        self.model_meta = {}
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), 'flood_model.pkl')
        if os.path.exists(model_path):
            data = joblib.load(model_path)
            if isinstance(data, dict) and 'pipeline' in data:
                self.pipeline   = data['pipeline']
                self.model_meta = data
            else:
                # Legacy format (plain model object)
                self.pipeline = data

    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def predict(self, features_dict: dict) -> dict:
        if not self.is_loaded():
            raise RuntimeError("Model not loaded. Run train_model.py first.")

        # Build feature vector with defaults for any missing field
        feat_vec = [features_dict.get(f, FEATURE_DEFAULTS[f]) for f in FEATURE_NAMES]
        raw_pred = float(self.pipeline.predict([feat_vec])[0])
        prob = float(np.clip(raw_pred * 100.0, 0.0, 100.0))

        # Risk classification
        if prob <= 30.0:
            risk_level = 'LOW';      severity = 'Situation normal – routine monitoring'
        elif prob <= 60.0:
            risk_level = 'MODERATE'; severity = 'Elevated risk – prepare precautionary measures'
        elif prob <= 80.0:
            risk_level = 'HIGH';     severity = 'Significant flood danger – immediate action required'
        else:
            risk_level = 'CRITICAL'; severity = 'Emergency – evacuate vulnerable areas immediately'

        # Confidence: higher when multiple data sources agree
        # Simple proxy: how many threshold triggers are consistent with risk level
        trigger_count = len(self._get_contributing(features_dict))
        expected_triggers = {'LOW': 0, 'MODERATE': 2, 'HIGH': 4, 'CRITICAL': 6}
        delta = abs(trigger_count - expected_triggers.get(risk_level, 3))
        confidence = round(max(60, min(98, 90 - delta * 3)), 1)

        # Model R² as additional confidence signal
        if 'r2' in self.model_meta:
            r2_confidence = round(float(self.model_meta['r2']) * 100, 1)
            confidence = round((confidence + r2_confidence) / 2, 1)

        contributing = self._get_contributing(features_dict)
        if not contributing:
            contributing = ['Standard meteorological conditions', 'No elevated risk signals detected']

        return {
            'flood_probability':    prob,
            'risk_level':           risk_level,
            'severity':             severity,
            'confidence':           confidence,
            'contributing_factors': contributing,
            'recommendations':      get_recommendations(risk_level),
        }

    def _get_contributing(self, fd: dict) -> list:
        factors = []
        for feat, threshold, op, label in CONTRIB_THRESHOLDS:
            val = fd.get(feat, FEATURE_DEFAULTS[feat])
            triggered = (op == 'gt' and val > threshold) or (op == 'lt' and val < threshold)
            if triggered:
                src, desc = DATA_SOURCE_MAP.get(feat, ('Unknown', feat))
                factors.append(f'[{src}] {label}')
        return factors


predictor = Predictor()
