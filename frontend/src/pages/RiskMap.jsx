import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { simulate, getLocations } from '../services/api';
import {
  MapPin, Activity, Info, X, AlertTriangle, ShieldCheck,
  Droplets, Wind, Thermometer, RefreshCw, Layers, RotateCcw
} from 'lucide-react';

// ─── Risk color config ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  LOW:      { hex: '#10b981', fill: 'rgba(16,185,129,0.18)',  border: '#059669', label: 'Low',      dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50',  badge: 'bg-emerald-100 text-emerald-800',  desc: 'Normal conditions' },
  MODERATE: { hex: '#f59e0b', fill: 'rgba(245,158,11,0.18)',  border: '#d97706', label: 'Moderate', dot: 'bg-amber-400',   text: 'text-amber-600',  bg: 'bg-amber-50',    badge: 'bg-amber-100 text-amber-800',    desc: 'Monitor conditions' },
  HIGH:     { hex: '#f97316', fill: 'rgba(249,115,22,0.22)',  border: '#ea580c', label: 'High',     dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50',   badge: 'bg-orange-100 text-orange-800',  desc: 'Take precaution' },
  CRITICAL: { hex: '#ef4444', fill: 'rgba(239,68,68,0.25)',   border: '#dc2626', label: 'Critical', dot: 'bg-red-500',    text: 'text-red-600',   bg: 'bg-red-50',      badge: 'bg-red-100 text-red-800',        desc: 'Immediate attention' },
};

// ─── Risk zones - comprehensive all-India coverage ───────────────────────────
const SEED_ZONES = [
  { id: 'tn-1',  lat: 13.0827, lng: 80.2707, label: 'Chennai Metropolitan',       risk: 'CRITICAL', radius: 70000 },
  { id: 'tn-2',  lat: 11.0168, lng: 76.9558, label: 'Coimbatore Industrial Belt', risk: 'HIGH',     radius: 55000 },
  { id: 'tn-3',  lat: 10.7905, lng: 79.1378, label: 'Cauvery Delta Region',       risk: 'CRITICAL', radius: 80000 },
  { id: 'tn-4',  lat: 8.7139,  lng: 77.7567, label: 'Tirunelveli-Kanyakumari',    risk: 'HIGH',     radius: 60000 },
  { id: 'tn-5',  lat: 9.9252,  lng: 78.1198, label: 'Madurai Basin',              risk: 'MODERATE', radius: 50000 },
  { id: 'kl-1',  lat: 9.9816,  lng: 76.2999, label: 'Kochi-Ernakulam Backwaters', risk: 'CRITICAL', radius: 65000 },
  { id: 'kl-2',  lat: 8.4875,  lng: 76.9525, label: 'Thiruvananthapuram Coast',   risk: 'HIGH',     radius: 50000 },
  { id: 'ap-1',  lat: 16.5062, lng: 80.6480, label: 'Krishna–Godavari Delta',      risk: 'CRITICAL', radius: 90000 },
  { id: 'ts-1',  lat: 17.3850, lng: 78.4867, label: 'Hyderabad Urban Flooding',    risk: 'HIGH',     radius: 75000 },
  { id: 'ka-1',  lat: 12.9352, lng: 77.6245, label: 'Bengaluru Urban Lakes',       risk: 'HIGH',     radius: 65000 },
  { id: 'mh-1',  lat: 19.0760, lng: 72.8777, label: 'Mumbai Metropolitan',         risk: 'CRITICAL', radius: 80000 },
  { id: 'mh-2',  lat: 18.5204, lng: 73.8567, label: 'Pune Urban Flooding',         risk: 'HIGH',     radius: 65000 },
  { id: 'gj-1',  lat: 23.0225, lng: 72.5714, label: 'Ahmedabad Urban',             risk: 'MODERATE', radius: 70000 },
  { id: 'gj-3',  lat: 21.1702, lng: 72.8311, label: 'Surat–Tapti River',           risk: 'CRITICAL', radius: 70000 },
  { id: 'rj-1',  lat: 26.9124, lng: 75.7873, label: 'Jaipur Flash Flood Risk',     risk: 'MODERATE', radius: 65000 },
  { id: 'mp-1',  lat: 23.2599, lng: 77.4126, label: 'Bhopal–Betwa Basin',         risk: 'MODERATE', radius: 70000 },
  { id: 'od-1',  lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar–Cuttack',        risk: 'HIGH',     radius: 70000 },
  { id: 'wb-1',  lat: 22.5726, lng: 88.3639, label: 'Kolkata–Hooghly Delta',       risk: 'CRITICAL', radius: 80000 },
  { id: 'br-1',  lat: 25.5941, lng: 85.1376, label: 'Patna–Ganga Flood Plain',     risk: 'CRITICAL', radius: 85000 },
  { id: 'as-1',  lat: 26.1445, lng: 91.7362, label: 'Guwahati–Brahmaputra',        risk: 'CRITICAL', radius: 85000 },
  { id: 'up-2',  lat: 25.3176, lng: 82.9739, label: 'Varanasi–Ganga Flood Zone',   risk: 'CRITICAL', radius: 80000 },
  { id: 'up-3',  lat: 28.6139, lng: 77.2090, label: 'Delhi–NCR Urban Flooding',    risk: 'HIGH',     radius: 80000 },
  { id: 'uk-1',  lat: 30.0668, lng: 79.0193, label: 'Uttarakhand Cloudburst Zone', risk: 'CRITICAL', radius: 70000 }
];

// ─── Map click handler component ──────────────────────────────────────────────
function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

// ─── Create custom pulsing marker ─────────────────────────────────────────────
function createRiskIcon(color, isLoading = false) {
  const pulse = isLoading ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};animation:riskPulse 1s ease-out infinite;opacity:0.7;"></div>` : `<div style="position:absolute;inset:-10px;border-radius:50%;border:2px solid ${color};animation:riskPulse 2s ease-out infinite;"></div>`;
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:22px;height:22px;"><div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>${pulse}</div><style>@keyframes riskPulse { 0% { transform:scale(1); opacity:0.8; } 100% { transform:scale(2.5); opacity:0; } }</style>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RiskMap() {
  const [locations, setLocations]               = useState([]);
  const [selected, setSelected]                 = useState(null);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [showZones, setShowZones]               = useState(true);
  const [panelOpen, setPanelOpen]               = useState(false);

  useEffect(() => { getLocations().then(setLocations).catch(() => {}); }, []);

  // ── Map click → backend call ──────────────────────────────────────────────
  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setSelected({ lat, lng, loading: true });
    setPanelOpen(true);
    setIsAnalyzing(true);
    try {
      const res = await simulate({ latitude: lat, longitude: lng });
      const inp  = res.input_data || {};
      const cfg  = RISK_CONFIG[res.risk_level] || RISK_CONFIG.MODERATE;
      setSelected({
        lat, lng,
        loading:      false,
        riskLevel:    res.risk_level,
        probability:  parseFloat(res.flood_probability).toFixed(1),
        confidence:   res.confidence,
        severity:     res.severity,
        locationName: inp.location_name || "Selected Location",
        rainfall_24h: inp.rainfall_24h,
        temperature:  inp.temperature,
        humidity:     inp.humidity,
        wind_speed:   inp.wind_speed,
        dataSource:   inp.data_source || "Static",
        timestamp:    new Date().toLocaleTimeString("en-IN"),
        factors:      res.contributing_factors || [],
        cfg,
      });
    } catch {
      setSelected(null);
      setPanelOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const closePanel = () => { setPanelOpen(false); setSelected(null); };

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 5.5rem)" }}>

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-xl">
            <MapPin className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
              Real-Time Risk Intelligence Map
            </h1>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Info size={10} />
              Click any location on the map to run the AI inundation model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAnalyzing && (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 text-xs font-bold">
              <RefreshCw size={12} className="animate-spin" />
              Analyzing...
            </div>
          )}
          {/* Zone toggle */}
          <button
            onClick={() => setShowZones(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
              showZones
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Layers size={13} />
            Risk Zones
          </button>
          {selected && (
            <button
              onClick={closePanel}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">

        {/* MAP */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0 bg-slate-50">
          <MapContainer center={[22.5, 79.0]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onClick={handleMapClick} />
            
            {showZones && SEED_ZONES.map((zone) => {
              const cfg = RISK_CONFIG[zone.risk] || RISK_CONFIG.LOW;
              return (
                <Circle
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    fillColor: cfg.hex,
                    fillOpacity: 0.2,
                    color: cfg.hex,
                    weight: 1,
                    dashArray: "4,4"
                  }}
                >
                  <Popup className="risk-popup">
                    <div className="p-4 min-w-[200px]">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">⚠ Known Risk Zone</p>
                      <p className="font-extrabold text-slate-900 text-sm mb-2">{zone.label}</p>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.desc}
                      </span>
                    </div>
                  </Popup>
                </Circle>
              );
            })}

            {selected && (
              <Marker position={[selected.lat, selected.lng]} icon={createRiskIcon(selected.cfg?.hex || "#6366f1", selected.loading)} />
            )}
          </MapContainer>
        </div>

        {/* ── Slide-in Side Panel ────────────────────────────────────────────── */}
        <div className={`absolute top-0 right-0 h-full w-[360px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex flex-col border-l border-slate-200 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          {selected && (
            <div className="flex flex-col h-full relative">
              {/* Panel Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <MapPin className="text-indigo-600" size={18} />
                  <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Location Analysis</span>
                </div>
                <button
                  onClick={closePanel}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {selected.loading ? (
                  /* Loading state */
                  <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
                    <div className="relative">
                      <div className="w-14 h-14 border-4 border-indigo-100 rounded-full" />
                      <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-slate-800">Analyzing location...</p>
                      <p className="text-xs text-slate-500">Running ML model</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Location Info */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Selected Location</p>
                      <p className="text-base font-extrabold text-slate-900 leading-tight">{selected.locationName}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        {selected.lat.toFixed(4)}° N, {selected.lng.toFixed(4)}° E
                      </p>
                    </div>

                    {/* Risk Card */}
                    <div className={`rounded-2xl p-5 border ${selected.cfg.bg} border-opacity-60 relative overflow-hidden`}
                         style={{ borderColor: selected.cfg.hex + "40" }}>
                      <div className="absolute -right-4 -top-4 opacity-5">
                        {["HIGH","CRITICAL"].includes(selected.riskLevel)
                          ? <AlertTriangle size={120} />
                          : <ShieldCheck size={120} />}
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Current Risk</p>
                      <div className="flex items-end gap-3 mb-4">
                        <span className={`text-4xl font-black tracking-tight ${selected.cfg.text}`}>
                          {selected.riskLevel}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full mb-1 ${selected.cfg.badge}`}>
                          {selected.cfg.desc}
                        </span>
                      </div>
                    </div>

                    {/* Live Conditions */}
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Live Conditions</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { icon: Droplets, label: "Rainfall 24h", value: selected.rainfall_24h !== undefined ? `${Number(selected.rainfall_24h).toFixed(1)} mm` : "N/A", color: "text-blue-600", bg: "bg-blue-50" },
                          { icon: Thermometer, label: "Temperature", value: selected.temperature !== undefined ? `${Number(selected.temperature).toFixed(1)} °C` : "N/A", color: "text-amber-600", bg: "bg-amber-50" },
                          { icon: Wind, label: "Wind Speed", value: selected.wind_speed !== undefined ? `${Number(selected.wind_speed).toFixed(1)} km/h` : "N/A", color: "text-teal-600", bg: "bg-teal-50" },
                          { icon: Activity, label: "Data Source", value: selected.dataSource || "N/A", color: "text-indigo-600", bg: "bg-indigo-50" },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                          <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                              <Icon className={color} size={14} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold leading-none mb-1">{label}</p>
                            <p className="text-xs font-black text-slate-900 leading-tight">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: selected.cfg.hex }} />
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 pl-2">Status & Recommendation</p>
                      <p className="text-xs text-slate-100 font-medium leading-relaxed pl-2">{selected.severity}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
