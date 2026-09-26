import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import { Bell, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Alerts() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(data => {
        setHistory(data.filter(h => ['HIGH', 'CRITICAL'].includes(h.risk_level)));
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const getBorderColor = (level) => {
    if (level === 'CRITICAL') return 'border-rose-500/60 bg-rose-900/10';
    if (level === 'HIGH') return 'border-orange-500/60 bg-orange-900/10';
    return 'border-slate-700/50 bg-slate-800/40';
  };

  const getTextColor = (level) => {
    if (level === 'CRITICAL') return 'text-rose-400';
    if (level === 'HIGH') return 'text-orange-400';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-rose-500/20 p-3 rounded-2xl">
          <Bell className="text-rose-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Active Alerts</h1>
          <p className="text-slate-400 text-sm">HIGH and CRITICAL risk events from prediction history</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-800/40 rounded-3xl border border-slate-700/50 gap-4">
          <ShieldCheck className="text-emerald-400" size={56} />
          <h2 className="text-xl font-semibold text-slate-200">No Active Alerts</h2>
          <p className="text-slate-400 text-sm">All monitored locations are currently at low or moderate risk.</p>
        </div>
      )}

      <div className="space-y-4">
        {history.map((alert, i) => (
          <div key={i} className={`p-5 rounded-2xl border backdrop-blur-md ${getBorderColor(alert.risk_level)}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className={`shrink-0 mt-0.5 ${getTextColor(alert.risk_level)}`} size={24} />
                <div>
                  <h3 className={`text-lg font-bold ${getTextColor(alert.risk_level)}`}>
                    {alert.risk_level} FLOOD RISK
                  </h3>
                  <p className="text-slate-300 font-medium mt-0.5">{alert.location_name || 'Unknown Location'}</p>
                  <div className="flex gap-6 mt-3 text-sm text-slate-400">
                    <span>🌧 {alert.rainfall_1h} mm/hr</span>
                    <span>📊 {alert.flood_probability?.toFixed(1)}% probability</span>
                    <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${
                alert.status === 'active' ? 'border-rose-500/50 text-rose-400 bg-rose-900/20' : 'border-slate-600 text-slate-400 bg-slate-800'
              }`}>
                {alert.status || 'active'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
