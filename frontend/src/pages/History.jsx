import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../services/api';
import { Clock, Trash2, RefreshCw } from 'lucide-react';

const RISK_BADGE = {
  LOW: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
  MODERATE: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
  HIGH: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
  CRITICAL: 'bg-rose-900/40 text-rose-400 border-rose-700/50',
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all prediction history?')) return;
    await clearHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-3 rounded-2xl">
            <Clock className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Prediction History</h1>
            <p className="text-slate-400 text-sm">{history.length} prediction{history.length !== 1 ? 's' : ''} recorded</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700/50 text-rose-400 rounded-xl text-sm transition-colors"
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-800/40 rounded-3xl border border-slate-700/50 gap-3">
          <Clock className="text-slate-600" size={48} />
          <p className="text-slate-400 text-lg">No predictions recorded yet.</p>
          <p className="text-slate-500 text-sm">Run a prediction from the Dashboard or Prediction page.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-xs text-slate-400 uppercase tracking-widest">
                  <th className="text-left px-6 py-4 font-semibold">Time</th>
                  <th className="text-left px-6 py-4 font-semibold">Location</th>
                  <th className="text-right px-6 py-4 font-semibold">Rain 1h (mm)</th>
                  <th className="text-right px-6 py-4 font-semibold">Rain 24h (mm)</th>
                  <th className="text-center px-6 py-4 font-semibold">Risk Level</th>
                  <th className="text-right px-6 py-4 font-semibold">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(h.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-200 font-medium">
                      {h.location_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">{h.rainfall_1h?.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right text-slate-300">{h.rainfall_24h?.toFixed(1)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${RISK_BADGE[h.risk_level] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {h.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-200 font-semibold">
                      {h.flood_probability?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
