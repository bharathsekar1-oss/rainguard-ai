# RainGuard AI

AI/ML-Based Integrated Heavy Rainfall Early Warning and Inundation Prediction System MVP.

## Features
- **Predictive AI**: Uses a Random Forest ML model trained on synthetic rainfall-flood data to predict flood risk.
- **Interactive Dashboard**: Modern UI with a risk map, rainfall charts, and active warnings.
- **Simulation Mode**: Real-time slider adjustments to demonstrate the effect of rainfall on flood risk.
- **RESTful API**: FastAPI backend providing endpoints for prediction, simulation, and historical tracking.

## Project Structure
- `backend/`: FastAPI Python backend, SQLite database, and ML pipeline.
- `frontend/`: React + Vite frontend using Tailwind CSS, Leaflet for maps, and Recharts.
- `data/`: Contains the synthetic dataset used for training the model.

## Setup Instructions

### 1. Backend Setup
1. Ensure Python 3.10+ is installed.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server (runs on `http://localhost:8000`):
   ```bash
   uvicorn app.main:app --reload
   ```

*(Note: The database and ML model are initialized automatically on startup.)*

### 2. Frontend Setup
1. Ensure Node.js (v18+) is installed.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Using the Application
- Open the frontend in your browser (usually `http://localhost:5173`).
- Select a location from the dashboard.
- View the predicted flood risk and early warnings.
- Use the **Simulation** panel to adjust rainfall amounts and see the live impact on flood risk on the map and charts.

## Important Note
This is an MVP built for demonstration purposes. The ML model is trained on a synthetic dataset generated specifically for this demo to show the end-to-end flow. In a real-world scenario, this model would be trained on historical weather and inundation data.
