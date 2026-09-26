import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHistoricalRisk } from '../services/api';
import { History, Calendar, CloudRain, AlertTriangle, Layers } from 'lucide-react';

const RISK_CONFIG = {
  LOW:      { hex: '#10b981', border: '#059669', label: 'Low',      badge: 'bg-emerald-100 text-emerald-800' },
  MODERATE: { hex: '#f59e0b', border: '#d97706', label: 'Moderate', badge: 'bg-amber-100 text-amber-800' },
  HIGH:     { hex: '#f97316', border: '#ea580c', label: 'High',     badge: 'bg-orange-100 text-orange-800' },
  CRITICAL: { hex: '#ef4444', border: '#dc2626', label: 'Critical', badge: 'bg-red-100 text-red-800' },
};

export default function HistoricalRiskMap() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('All Time');

  useEffect(() => {
    async function fetchHistoricalData() {
      try {
        setLoading(true);
        const data = await getHistoricalRisk();
        setZones(data);
      } catch (err) {
        console.error("Failed to fetch historical risk data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistoricalData();
  }, [timeRange]);

  return (
    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden mt-8 text-white">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 backdrop-blur-sm border border-indigo-500/30">
                <History size={20} />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">Historical Risk Map</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium">Analyze historical rainfall and inundation risk patterns across India.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-xl border border-slate-700/50">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              <Calendar size={14} /> Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 text-xs font-bold transition-all">
              <Layers size={14} /> Historical Risk
            </button>
          </div>
        </div>

        <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner relative z-0 bg-slate-800">
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-bold text-white">Aggregating Historical Data...</p>
            </div>
          )}
          
          <MapContainer center={[22.5, 79.0]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={true}>
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {zones.map((zone, idx) => {
              const cfg = RISK_CONFIG[zone.historicalRisk] || RISK_CONFIG.LOW;
              return (
                <Circle
                  key={idx}
                  center={[zone.lat, zone.lng]}
                  radius={70000} // ~70km standard coverage area
                  pathOptions={{
                    fillColor: cfg.hex,
                    fillOpacity: 0.3,
                    color: cfg.hex,
                    weight: 1,
                  }}
                >
                  <Popup className="historical-risk-popup">
                    <div className="p-3 min-w-[200px]">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-2">📍 Aggregated Region</p>
                      <div className="space-y-3 mt-3">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Historical Risk</p>
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><CloudRain size={12}/> Avg Rainfall</span>
                          <span className="text-xs font-black text-slate-800">{zone.avgRainfall} mm</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><AlertTriangle size={12}/> Event Count</span>
                          <span className="text-xs font-black text-slate-800">{zone.eventCount}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Legend:</p>
          <div className="flex gap-4">
            {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.hex }}></div>
                <span className="text-xs font-semibold text-slate-300">{cfg.label}</span>
              </div>
            ))}
          </div>
          <div className="ml-auto text-[10px] text-slate-500 font-medium">
            Data Coverage: Prediction History Database
          </div>
        </div>
      </div>
    </div>
  );
}
