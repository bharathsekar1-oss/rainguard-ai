"""
RainGuard AI – Model Training (v2)
===================================
Trains a GradientBoostingRegressor (or RandomForest fallback) on the
25-feature synthetic dataset that mirrors real satellite + weather sources.
"""
import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Full feature list matching generate_dataset.py output
FEATURES = [
    # IMD / Weather
    'rainfall_1h', 'rainfall_3h', 'rainfall_6h', 'rainfall_24h',
    'temperature', 'humidity', 'wind_speed', 'sunshine_hours',
    # Radar
    'radar_reflectivity_dbz',
    # CHIRPS
    'chirps_precip_anomaly',
    # NWP
    'nwp_forecast_6h', 'nwp_forecast_24h',
    # SRTM DEM
    'elevation', 'slope', 'flow_accumulation',
    # Sentinel-1 SAR
    'sar_backscatter_vv', 'sar_backscatter_vh', 'sar_flood_index',
    # Sentinel-2
    'ndwi', 'ndvi',
    # River gauge
    'river_level_normalized',
    # Land / terrain
    'urbanization_factor', 'drainage_factor',
    'soil_moisture_pct', 'distance_to_water_km',
]

TARGET = 'flood_risk'


def train():
    # Resolve data path relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../../..', 'data', 'synthetic_training_data.csv')
    data_path = os.path.normpath(data_path)

    if not os.path.exists(data_path):
        print(f"[ERROR] Dataset not found at {data_path}")
        print("Run:  python data/generate_dataset.py  first.")
        sys.exit(1)

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples with {len(df.columns)} columns")

    # Validate all features are present
    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        print(f"[ERROR] Missing columns in dataset: {missing}")
        print("Re-generate the dataset first.")
        sys.exit(1)

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=True
    )

    # ── Try GradientBoosting first (better accuracy), fallback to RandomForest ─
    try:
        model_core = GradientBoostingRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            min_samples_split=10,
            random_state=42
        )
        model_name = "GradientBoostingRegressor"
    except Exception:
        model_core = RandomForestRegressor(
            n_estimators=200, max_depth=12, random_state=42, n_jobs=-1
        )
        model_name = "RandomForestRegressor (fallback)"

    # Pipeline: scaler + model
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', model_core)
    ])

    print(f"\nTraining {model_name}...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_pred = np.clip(y_pred, 0, 1)

    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)

    print(f"\n{'='*40}")
    print(f"  Model      : {model_name}")
    print(f"  MAE        : {mae:.4f}")
    print(f"  RMSE       : {rmse:.4f}")
    print(f"  R2         : {r2:.4f}")
    print(f"{'='*40}")

    # Feature importances (from inner model if available)
    inner = pipeline.named_steps['model']
    if hasattr(inner, 'feature_importances_'):
        imps = sorted(
            zip(FEATURES, inner.feature_importances_),
            key=lambda x: x[1], reverse=True
        )
        print("\nTop-10 Feature Importances:")
        for feat, imp in imps[:10]:
            bar = '#' * int(imp * 100)
            print(f"  {feat:<30} {imp:.4f}  {bar}")

    # Save pipeline (scaler + model together)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flood_model.pkl')
    joblib.dump({
        'pipeline': pipeline,
        'features': FEATURES,
        'model_name': model_name,
        'r2': r2,
        'mae': mae,
    }, model_path)
    print(f"\n[OK] Model saved -> {model_path}")


if __name__ == '__main__':
    train()
