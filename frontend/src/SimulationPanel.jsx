import React, { useState, useEffect, useRef } from 'react';
import { RAIN_PRESETS } from '../utils/constants';
import { CloudRain, Droplets, CloudLightning } from 'lucide-react';

const SimulationPanel = ({ values, onChange, onPreset }) => {
  const [localValues, setLocalValues] = useState(values);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleSliderChange = (e, key) => {
    const val = parseInt(e.target.value, 10);
    const newValues = { ...localValues, [key]: val };
    setLocalValues(newValues);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange(newValues);
    }, 300);
  };

  const sliders = [
    { key: 'rainfall_1h', label: '1 Hour (mm)', max: 150, color: 'text-blue-400', bg: 'bg-blue-500' },
    { key: 'rainfall_3h', label: '3 Hours (mm)', max: 300, color: 'text-blue-500', bg: 'bg-blue-600' },
    { key: 'rainfall_6h', label: '6 Hours (mm)', max: 500, color: 'text-indigo-400', bg: 'bg-indigo-500' },
    { key: 'rainfall_24h', label: '24 Hours (mm)', max: 800, color: 'text-indigo-500', bg: 'bg-indigo-600' },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="font-semibold text-white flex items-center mb-4 sm:mb-0">
          <CloudRain className="w-5 h-5 mr-2 text-blue-400" />
          Rainfall Simulation
        </h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onPreset('normal')}
            className="flex items-center text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          >
            <Droplets className="w-3 h-3 mr-1 text-blue-300" /> Normal
          </button>
          <button 
            onClick={() => onPreset('heavy')}
            className="flex items-center text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          >
            <CloudRain className="w-3 h-3 mr-1 text-orange-400" /> Heavy
          </button>
          <button 
            onClick={() => onPreset('extreme')}
            className="flex items-center text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          >
            <CloudLightning className="w-3 h-3 mr-1 text-red-400" /> Extreme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {sliders.map((s) => (
          <div key={s.key} className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-400">{s.label}</label>
              <span className={`text-lg font-bold ${s.color}`}>{localValues[s.key] || 0}</span>
            </div>
            <input
              type="range"
              min="0"
              max={s.max}
              value={localValues[s.key] || 0}
              onChange={(e) => handleSliderChange(e, s.key)}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span>{s.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationPanel;
