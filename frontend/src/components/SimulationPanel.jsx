import { SlidersHorizontal } from 'lucide-react';

export default function SimulationPanel({ values, onChange, onPreset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: parseFloat(value) });
  };

  return (
    <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl">
      <h3 className="text-lg font-semibold mb-6 text-slate-100 flex items-center gap-2">
        <SlidersHorizontal className="text-blue-400" />
        Rainfall Simulation Mode
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
            <span>1-Hour Rainfall</span>
            <span className="text-blue-400 font-bold">{values.rainfall_1h} mm</span>
          </label>
          <input 
            type="range" name="rainfall_1h" min="0" max="150" step="1" 
            value={values.rainfall_1h} onChange={handleChange}
            className="w-full accent-blue-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer" 
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
            <span>3-Hour Rainfall</span>
            <span className="text-blue-400 font-bold">{values.rainfall_3h} mm</span>
          </label>
          <input 
            type="range" name="rainfall_3h" min="0" max="300" step="1" 
            value={values.rainfall_3h} onChange={handleChange}
            className="w-full accent-blue-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer" 
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
            <span>24-Hour Rainfall</span>
            <span className="text-blue-400 font-bold">{values.rainfall_24h} mm</span>
          </label>
          <input 
            type="range" name="rainfall_24h" min="0" max="800" step="1" 
            value={values.rainfall_24h} onChange={handleChange}
            className="w-full accent-blue-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Quick Presets</p>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => onPreset('normal')}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-600"
          >
            Normal
          </button>
          <button 
            onClick={() => onPreset('heavy')}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors border border-orange-500/30"
          >
            Heavy
          </button>
          <button 
            onClick={() => onPreset('extreme')}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors border border-rose-500/30"
          >
            Extreme
          </button>
        </div>
      </div>
    </div>
  )
}
