import { AlertTriangle, Info, MapPin } from 'lucide-react';

export default function WarningPanel({ prediction, location, visible }) {
  if (!visible || !prediction) {
    return (
      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl flex flex-col items-center justify-center h-full min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Info className="text-emerald-400" size={32} />
        </div>
        <h3 className="text-slate-200 font-medium text-lg">No Active Warnings</h3>
        <p className="text-slate-400 text-sm mt-1">Conditions are currently safe.</p>
      </div>
    );
  }

  const isCritical = prediction.risk_level === 'CRITICAL';
  const colorClass = isCritical ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-orange-500/50 bg-orange-500/10 text-orange-400';
  const textClass = isCritical ? 'text-rose-400' : 'text-orange-400';
  const glowClass = isCritical ? 'shadow-[0_0_40px_rgba(244,63,94,0.15)] animate-pulse-ring' : 'shadow-[0_0_30px_rgba(249,115,22,0.1)]';

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-xl ${colorClass} ${glowClass} relative overflow-hidden`}>
      {/* Background Icon */}
      <AlertTriangle className={`absolute -bottom-4 -right-4 w-40 h-40 opacity-10 ${textClass}`} />

      <div className="flex items-start gap-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-slate-900/50 shadow-inner ${textClass}`}>
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight uppercase ${textClass}`}>
            {prediction.risk_level} FLOOD RISK
          </h2>
          <div className="flex items-center gap-2 mt-1 text-slate-300">
            <MapPin size={14} />
            <span className="font-medium">{location?.name || 'Selected Location'}</span>
          </div>
          
          <div className="mt-4 space-y-2">
             <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
               <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Expected Impact</span>
               <p className="text-slate-200 mt-1">{prediction.severity}</p>
             </div>
          </div>

          {prediction.recommendations && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">Recommended Actions</h3>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900/30 p-2 rounded-lg">
                    <div className={`mt-1 min-w-2 min-h-2 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-orange-500'}`}></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
