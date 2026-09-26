import React from 'react';
import { Thermometer, Wind, Droplet, Mountain, Building, Waves } from 'lucide-react';

const WeatherInputs = ({ values, onChange }) => {
  const handleChange = (e, key) => {
    onChange({
      ...values,
      [key]: parseFloat(e.target.value) || 0
    });
  };

  const inputs = [
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, step: 0.1 },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: Droplet, step: 1 },
    { key: 'wind_speed', label: 'Wind Speed', unit: 'km/h', icon: Wind, step: 0.1 },
    { key: 'elevation', label: 'Elevation', unit: 'm', icon: Mountain, step: 1 },
    { key: 'urbanization_factor', label: 'Urbanization', unit: '0-1', icon: Building, step: 0.1, min: 0, max: 1 },
    { key: 'drainage_factor', label: 'Drainage', unit: '0-1', icon: Waves, step: 0.1, min: 0, max: 1 },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
      <h3 className="font-semibold text-white mb-4">Environmental Parameters</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {inputs.map((input) => (
          <div key={input.key} className="flex flex-col">
            <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
              <input.icon className="w-3.5 h-3.5 mr-1.5" />
              {input.label}
            </label>
            <div className="relative">
              <input
                type="number"
                step={input.step}
                min={input.min}
                max={input.max}
                value={values[input.key] !== undefined ? values[input.key] : ''}
                onChange={(e) => handleChange(e, input.key)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-500">{input.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherInputs;
