"""
RainGuard AI – Synthetic Dataset Generator (v2)
================================================
Simulates multi-source observation data matching real-world inputs:

Satellite Sources:
  • Sentinel-1 SAR  → sar_backscatter_vv, sar_backscatter_vh, sar_flood_index
  • Sentinel-2 opt  → ndwi, ndvi
  • SRTM DEM        → elevation, slope, flow_accumulation

Weather / IMD Sources:
  • IMD rainfall    → rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h
  • IMD surface     → temperature, humidity, wind_speed, sunshine_hours
  • Radar           → radar_reflectivity_dbz   (Doppler / X-band)
  • CHIRPS          → chirps_precip_anomaly    (departure from climatology)
  • NWP (GFS/ECMWF) → nwp_forecast_6h, nwp_forecast_24h
  • River gauge     → river_level_normalized

Terrain / Land:
  • urbanization_factor, drainage_factor, soil_moisture_pct, distance_to_water_km
"""

import pandas as pd
import numpy as np
import os

# ── Random seed for reproducibility ──────────────────────────────────────────
np.random.seed(42)

def generate_data(num_samples: int = 8000) -> pd.DataFrame:
    n = num_samples

    # ── 1. IMD Rainfall (correlated cumulative) ───────────────────────────────
    rainfall_1h  = np.random.exponential(scale=12, size=n).clip(0, 150)
    rainfall_3h  = (rainfall_1h * 2.3 + np.random.exponential(8, n)).clip(0, 300)
    rainfall_6h  = (rainfall_3h * 1.9 + np.random.exponential(15, n)).clip(0, 500)
    rainfall_24h = (rainfall_6h * 2.1 + np.random.exponential(40, n)).clip(0, 800)

    # ── 2. IMD Surface weather ────────────────────────────────────────────────
    temperature     = np.random.uniform(18, 44, n)
    humidity        = np.random.uniform(30, 100, n)
    wind_speed      = np.random.uniform(0, 80, n)
    sunshine_hours  = np.random.uniform(0, 12, n)    # hours/day (0=overcast)

    # ── 3. Radar (X-band / Doppler): dBZ 0-65 ────────────────────────────────
    # Correlated with rainfall_1h via Z-R relation: Z = 300 * R^1.4
    Z = 300 * (rainfall_1h.clip(0.1) ** 1.4)
    radar_reflectivity_dbz = (10 * np.log10(Z.clip(1))).clip(0, 65) + np.random.normal(0, 2, n)
    radar_reflectivity_dbz = radar_reflectivity_dbz.clip(0, 65)

    # ── 4. CHIRPS precipitation anomaly (mm, departure from 30-yr mean) ──────
    # High anomaly → unusual rain event → higher risk
    chirps_precip_anomaly = (rainfall_24h - 40) + np.random.normal(0, 10, n)  # mm

    # ── 5. NWP forecast (GFS / ECMWF) ────────────────────────────────────────
    nwp_forecast_6h  = (rainfall_6h * 0.9 + np.random.normal(0, 8, n)).clip(0, 200)
    nwp_forecast_24h = (rainfall_24h * 0.85 + np.random.normal(0, 25, n)).clip(0, 500)

    # ── 6. SRTM DEM derived ──────────────────────────────────────────────────
    elevation        = np.random.exponential(scale=80, size=n).clip(0, 500)  # metres
    slope            = np.random.exponential(scale=4, size=n).clip(0, 45)    # degrees
    flow_accumulation = np.random.exponential(scale=500, size=n).clip(1, 10000)  # cells

    # ── 7. Sentinel-1 SAR features ───────────────────────────────────────────
    # VV backscatter: open water ~ -20 to -25 dB; land ~ -10 to -5 dB
    # During flood, VV drops. Simulate: flooded pixels have lower VV.
    base_vv = np.random.uniform(-20, -5, n)
    # Backscatter decreases with rainfall accumulation (more water on ground)
    flood_effect_vv = -0.01 * rainfall_24h
    sar_backscatter_vv = (base_vv + flood_effect_vv + np.random.normal(0, 1, n)).clip(-30, 0)

    base_vh = base_vv - np.random.uniform(5, 10, n)   # VH always lower than VV
    flood_effect_vh = -0.008 * rainfall_24h
    sar_backscatter_vh = (base_vh + flood_effect_vh + np.random.normal(0, 1, n)).clip(-35, -5)

    # SAR Flood Index = VV - VH cross-ratio (used in Sentinel-1 flood mapping)
    # Lower ratio → more likely water surface
    sar_flood_index = (sar_backscatter_vv - sar_backscatter_vh + np.random.normal(0, 0.5, n)).clip(-10, 10)

    # ── 8. Sentinel-2 optical ────────────────────────────────────────────────
    # NDWI = (Green - NIR) / (Green + NIR). Range -1 to 1. >0.3 = water.
    # Higher rainfall → waterlogged → higher NDWI
    ndwi_base = -0.3 + 0.001 * rainfall_24h + np.random.normal(0, 0.1, n)
    ndwi = ndwi_base.clip(-1.0, 1.0)

    # NDVI = (NIR - Red) / (NIR + Red). Range -1 to 1.
    # Vegetation reduces runoff. Low NDVI (urban/barren) → higher risk.
    ndvi = (0.6 - 0.3 * (1 - np.random.uniform(0, 1, n)) + np.random.normal(0, 0.05, n)).clip(-0.2, 0.9)

    # ── 9. Terrain / Land ─────────────────────────────────────────────────────
    urbanization_factor   = np.random.beta(2, 3, n)          # skewed towards lower
    drainage_factor       = np.random.beta(3, 2, n)          # skewed towards higher (better)
    soil_moisture_pct     = np.random.uniform(10, 100, n)    # % volumetric
    distance_to_water_km  = np.random.exponential(scale=5, size=n).clip(0, 50)  # km

    # ── 10. River gauge (normalized, 0-10m) ──────────────────────────────────
    # Higher with more cumulative rainfall
    river_level_normalized = (0.5 + 0.012 * rainfall_24h / 100 + np.random.normal(0, 0.5, n)).clip(0, 10)

    # ════════════════════════════════════════════════════════════════════════
    # TARGET: flood_risk (0.0 – 1.0)
    # Based on multi-source weighted scoring with non-linear interactions
    # ════════════════════════════════════════════════════════════════════════

    # Normalise each feature to 0-1 for scoring
    norm_r1   = rainfall_1h / 150.0
    norm_r3   = rainfall_3h / 300.0
    norm_r6   = rainfall_6h / 500.0
    norm_r24  = rainfall_24h / 800.0
    norm_elev = 1.0 - (elevation / 500.0)            # lower elevation → higher risk
    norm_slp  = 1.0 - (slope / 45.0)                 # flatter terrain → more pooling
    norm_hum  = humidity / 100.0
    norm_rdz  = radar_reflectivity_dbz / 65.0
    norm_soil = soil_moisture_pct / 100.0             # saturated soil → higher risk
    norm_riv  = river_level_normalized / 10.0
    norm_ndwi = (ndwi + 1.0) / 2.0                   # -1..1 → 0..1
    norm_ndvi_inv = 1.0 - ((ndvi + 0.2) / 1.1).clip(0, 1)  # low veg → higher risk
    norm_nwp24 = nwp_forecast_24h / 500.0
    norm_chirps = (chirps_precip_anomaly / 200.0 + 0.5).clip(0, 1)  # anomaly
    norm_sar_fi = (1.0 - (sar_flood_index + 10) / 20.0).clip(0, 1)  # lower=flooded
    norm_dist_inv = 1.0 - (distance_to_water_km / 50.0)              # closer=higher

    # Weighted risk score from all sources
    risk_score = (
        0.25 * norm_r1          +  # IMD 1h - strongest immediate signal
        0.10 * norm_r3          +  # IMD 3h
        0.08 * norm_r6          +  # IMD 6h
        0.10 * norm_r24         +  # IMD 24h cumulative
        0.08 * norm_rdz         +  # Radar reflectivity
        0.06 * norm_nwp24       +  # NWP forecast
        0.05 * norm_chirps      +  # CHIRPS anomaly
        0.05 * norm_riv         +  # River gauge
        0.10 * norm_elev        +  # SRTM elevation
        0.04 * norm_slp         +  # SRTM slope
        0.05 * norm_ndwi        +  # Sentinel-2 NDWI (water presence)
        0.03 * norm_ndvi_inv    +  # Sentinel-2 NDVI (vegetation loss)
        0.05 * norm_sar_fi      +  # Sentinel-1 SAR flood index
        0.08 * urbanization_factor + # land-use
        0.05 * norm_soil        +  # antecedent soil moisture
        0.04 * norm_dist_inv    +  # proximity to water body
        0.04 * norm_hum         -  # humidity (minor)
        0.08 * drainage_factor     # good drainage reduces risk
    )

    # Amplify: spread the distribution more (the linear combo is too compressed)
    risk_score = np.where(risk_score > 0.5, risk_score * 1.4, risk_score * 0.9)

    # -- Non-linear interaction terms (physically motivated) --
    # 1. Extreme rain + low elevation + saturated soil = flash flood spike
    extreme_combo = (norm_r1 > 0.55) & (norm_elev > 0.7) & (norm_soil > 0.6)
    risk_score = np.where(extreme_combo, risk_score + 0.30, risk_score)

    # 2. High SAR flood index (open water detected) + high NDWI = confirmed flood
    sat_confirmed_flood = (norm_sar_fi > 0.6) & (norm_ndwi > 0.55)
    risk_score = np.where(sat_confirmed_flood, risk_score + 0.20, risk_score)

    # 3. High NWP forecast + already high river level = compound event
    compound_event = (norm_nwp24 > 0.4) & (norm_riv > 0.5)
    risk_score = np.where(compound_event, risk_score + 0.15, risk_score)

    # 4. Heavy rain + poor drainage + urban = urban flooding
    urban_flood = (norm_r1 > 0.5) & (drainage_factor < 0.4) & (urbanization_factor > 0.6)
    risk_score = np.where(urban_flood, risk_score + 0.20, risk_score)

    # 5. Good drainage + high elevation heavily suppresses risk
    safe_conditions = (drainage_factor > 0.7) & (norm_elev < 0.2) & (norm_r1 < 0.25)
    risk_score = np.where(safe_conditions, risk_score * 0.4, risk_score)

    # 6. Urban heat island: high urbanization + low sunshine = stagnant water
    urban_drain = (urbanization_factor > 0.7) & (sunshine_hours < 3)
    risk_score = np.where(urban_drain, risk_score + 0.08, risk_score)

    # Add realistic observation noise
    noise = np.random.normal(0, 0.03, n)
    risk_score += noise
    flood_risk = np.clip(risk_score, 0.0, 1.0)

    # ── Assemble DataFrame ────────────────────────────────────────────────────
    df = pd.DataFrame({
        # IMD / Weather
        'rainfall_1h':          rainfall_1h,
        'rainfall_3h':          rainfall_3h,
        'rainfall_6h':          rainfall_6h,
        'rainfall_24h':         rainfall_24h,
        'temperature':          temperature,
        'humidity':             humidity,
        'wind_speed':           wind_speed,
        'sunshine_hours':       sunshine_hours,
        # Radar
        'radar_reflectivity_dbz': radar_reflectivity_dbz,
        # CHIRPS
        'chirps_precip_anomaly':  chirps_precip_anomaly,
        # NWP
        'nwp_forecast_6h':      nwp_forecast_6h,
        'nwp_forecast_24h':     nwp_forecast_24h,
        # SRTM DEM
        'elevation':            elevation,
        'slope':                slope,
        'flow_accumulation':    flow_accumulation,
        # Sentinel-1 SAR
        'sar_backscatter_vv':   sar_backscatter_vv,
        'sar_backscatter_vh':   sar_backscatter_vh,
        'sar_flood_index':      sar_flood_index,
        # Sentinel-2 optical
        'ndwi':                 ndwi,
        'ndvi':                 ndvi,
        # River gauge
        'river_level_normalized': river_level_normalized,
        # Land / terrain
        'urbanization_factor':  urbanization_factor,
        'drainage_factor':      drainage_factor,
        'soil_moisture_pct':    soil_moisture_pct,
        'distance_to_water_km': distance_to_water_km,
        # Target
        'flood_risk':           flood_risk,
    })

    out_path = 'data/synthetic_training_data.csv'
    os.makedirs('data', exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"[OK] Generated {n} samples -> {out_path}")
    print(f"    Features: {len(df.columns)-1}  |  Target: flood_risk")
    print(f"    Risk distribution:")
    print(f"      LOW      (0-30%):   {(flood_risk<0.3).sum():5d} ({(flood_risk<0.3).mean()*100:.1f}%)")
    print(f"      MODERATE (30-60%):  {((flood_risk>=0.3)&(flood_risk<0.6)).sum():5d} ({((flood_risk>=0.3)&(flood_risk<0.6)).mean()*100:.1f}%)")
    print(f"      HIGH     (60-80%):  {((flood_risk>=0.6)&(flood_risk<0.8)).sum():5d} ({((flood_risk>=0.6)&(flood_risk<0.8)).mean()*100:.1f}%)")
    print(f"      CRITICAL (>80%):    {(flood_risk>=0.8).sum():5d} ({(flood_risk>=0.8).mean()*100:.1f}%)")
    return df


if __name__ == '__main__':
    generate_data()
