import { ShieldAlert, Database, Cpu, Map, Bell, Zap, Globe, Radio } from 'lucide-react';

const PIPELINE = [
  { icon: Database, label: 'Data Sources', desc: 'Rainfall sensors, IMD feed, weather stations', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { icon: Radio, label: 'Data Ingestion', desc: 'REST APIs, real-time weather data, historical CSV', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { icon: Zap, label: 'Preprocessing', desc: 'Feature engineering, normalization, aggregation', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { icon: Cpu, label: 'ML Prediction Model', desc: 'Random Forest Regressor (scikit-learn) — R² ≈ 0.91', color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30' },
  { icon: ShieldAlert, label: 'Risk Classification', desc: 'LOW / MODERATE / HIGH / CRITICAL thresholds', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { icon: Map, label: 'Map Visualization', desc: 'Leaflet + OpenStreetMap, risk-zone overlays', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { icon: Bell, label: 'Early Warning', desc: 'Alert panels, push notifications (future)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { icon: Globe, label: 'Intelligent Response', desc: 'Context-aware recommendations per risk level', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

const TECH = [
  { name: 'React 18 + Vite', tag: 'Frontend' },
  { name: 'Tailwind CSS 4', tag: 'Styling' },
  { name: 'FastAPI', tag: 'Backend API' },
  { name: 'scikit-learn', tag: 'ML Model' },
  { name: 'SQLite + SQLAlchemy', tag: 'Database' },
  { name: 'Leaflet / react-leaflet', tag: 'Maps' },
  { name: 'Recharts', tag: 'Charts' },
  { name: 'Pydantic v2', tag: 'Validation' },
];

const FUTURE = [
  'IMD (India Meteorological Dept) real-time rainfall data',
  'Satellite precipitation data (ISRO / NASA GPM)',
  'SRTM/ALOS Digital Elevation Model integration',
  'Weather radar composite overlays',
  'GIS flood inundation map layers',
  'IoT river gauge and flood sensor network',
  'SMS / WhatsApp / email automated alerts',
  'Government emergency response API integration',
];

export default function About() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-indigo-900/30 p-10 rounded-3xl border border-slate-700/50 overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <ShieldAlert size={300} />
        </div>
        <div className="flex items-center gap-5 mb-6">
          <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30">
            <ShieldAlert className="text-blue-400" size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              RainGuard AI
            </h1>
            <p className="text-slate-300 text-lg mt-1">AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System</p>
            <p className="text-slate-500 text-sm mt-1">SIH Problem Statement: SIH26071</p>
          </div>
        </div>
        <p className="text-slate-300 max-w-3xl leading-relaxed">
          RainGuard AI leverages machine learning to provide hyperlocal flood risk predictions, 
          real-time early warnings, and intelligent response recommendations — helping 
          emergency managers and citizens stay ahead of devastating floods.
        </p>
      </div>

      {/* System Architecture Pipeline */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">System Architecture</h2>
        <div className="relative">
          <div className="space-y-3">
            {PIPELINE.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`flex items-center gap-4 flex-1 p-4 rounded-2xl border backdrop-blur-sm ${step.color}`}>
                    <div className={`p-2.5 rounded-xl border ${step.color}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{step.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="text-slate-600 text-xl font-bold ml-2">↓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-100 mb-5">Technology Stack</h2>
          <div className="grid grid-cols-2 gap-3">
            {TECH.map((t, i) => (
              <div key={i} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">{t.tag}</div>
                <div className="text-slate-200 font-medium text-sm">{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Integrations */}
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-100 mb-5">Future Integration Roadmap</h2>
          <ul className="space-y-2">
            {FUTURE.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
