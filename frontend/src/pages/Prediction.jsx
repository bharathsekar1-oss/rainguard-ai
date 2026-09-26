import { useState, useEffect } from 'react';
import { predict, simulate, getLocations } from '../services/api';
import { DEFAULT_WEATHER, RAIN_PRESETS } from '../utils/constants';
import { usePredict } from '../hooks/usePredict';
import RiskIndicator from '../components/RiskIndicator';
import SimulationPanel from '../components/SimulationPanel';
import RainfallChart from '../components/RainfallChart';
import { generateMockRainfallTrend } from '../utils/helpers';
import { Brain, Play, FlaskConical } from 'lucide-react';

const INPUTS_DEFAULT = {
  rainfall_1h: 5,
  rainfall_3h: 12,
  rainfall_6h: 20,
  rainfall_24h: 35,
  temperature: 30,
  humidity: 70,
  wind_speed: 15,
  elevation: 50,
  urbanization_factor: 0.5,
  drainage_factor: 0.5,
};

export default function Prediction() {
  const { prediction, loading, error, runPrediction, runSimulation } = usePredict();
  const [inputs, setInputs] = useState(INPUTS_DEFAULT);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const chartData = generateMockRainfallTrend(inputs.rainfall_24h);

  const fields = [
    { name: 'rainfall_1h', label: 'Rainfall 1h (mm)', max: 150 },
    { name: 'rainfall_3h', label: 'Rainfall 3h (mm)', max: 300 },
    { name: 'rainfall_6h', label: 'Rainfall 6h (mm)', max: 500 },
    { name: 'rainfall_24h', label: 'Rainfall 24h (mm)', max: 800 },
    { name: 'temperature', label: 'Temperature (°C)', max: 50 },
    { name: 'humidity', label: 'Humidity (%)', max: 100 },
    { name: 'wind_speed', label: 'Wind Speed (km/h)', max: 100 },
    { name: 'elevation', label: 'Elevation (m)', max: 500 },
    { name: 'urbanization_factor', label: 'Urbanization (0-1)', max: 1, step: 0.01 },
    { name: 'drainage_factor', label: 'Drainage Quality (0-1)', max: 1, step: 0.01 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/20 p-3 rounded-2xl">
          <Brain className="text-blue-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Prediction Engine</h1>
          <p className="text-slate-400 text-sm">Enter parameters and run the ML flood risk model</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-900/30 border border-rose-700/50 text-rose-300 px-5 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-2 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-semibold mb-6 text-slate-100">Input Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-1">
                  <span>{f.label}</span>
                  <span className="text-blue-400 font-bold">{inputs[f.name]}</span>
                </label>
                <input
                  type="number"
                  name={f.name}
                  value={inputs[f.name]}
                  min={0}
                  max={f.max}
                  step={f.step || 1}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => runPrediction(inputs)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors shadow-lg shadow-blue-900/30"
            >
              <Play size={18} />
              {loading ? 'Running...' : 'Run Prediction (Save)'}
            </button>
            <button
              onClick={() => runSimulation(inputs)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-slate-100 font-semibold transition-colors"
            >
              <FlaskConical size={18} />
              Simulate Only
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4 text-slate-100 self-start">Result</h2>
            <RiskIndicator
              level={prediction?.risk_level || 'LOW'}
              probability={prediction?.flood_probability || 0}
              confidence={prediction?.confidence || 0}
              loading={loading}
            />
          </div>

          {prediction?.recommendations && (
            <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wide">Recommendations</h3>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-slate-100">Simulated 24h Trend</h2>
        <RainfallChart data={chartData} />
      </div>
    </div>
  );
}
