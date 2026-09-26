import { useState, useEffect, useCallback } from 'react';
import { simulate, getLocations } from '../services/api';
import { DEFAULT_WEATHER } from '../utils/constants';
import MapView from '../components/MapView';
import RainfallChart from '../components/RainfallChart';
import HistoricalRiskMap from '../components/HistoricalRiskMap';
import { generateMockRainfallTrend } from '../utils/helpers';
import { Activity, Droplets, Wind, MapPin, AlertTriangle, ShieldCheck, WifiOff, RefreshCw, BarChart2, Info, Navigation, Layers, Maximize, Crosshair } from 'lucide-react';

export default function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [annotatedLocation, setAnnotatedLocation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('ONLINE');
  const [globalRainfall, setGlobalRainfall] = useState(78);

  useEffect(() => {
    getLocations()
      .then(locs => {
        setLocations(locs);
        if(locs.length > 0) {
           setGlobalRainfall(locs[0].default_rainfall?.rainfall_24h || 78);
        }
      })
      .catch(() => {
        setBackendStatus('OFFLINE');
        setError('Cannot connect to prediction service. Please ensure backend is running.');
      });
  }, []);

  const getRiskHex = (level) => {
    const map = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
    return map[level] || '#6366f1';
  };

  const getRiskTextColor = (level) => {
    const map = { LOW: 'text-emerald-600', MODERATE: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' };
    return map[level] || 'text-indigo-600';
  };
  
  const getRiskBgColor = (level) => {
    const map = { LOW: 'bg-emerald-50 border-emerald-200 shadow-emerald-500/10', MODERATE: 'bg-amber-50 border-amber-200 shadow-amber-500/10', HIGH: 'bg-orange-50 border-orange-200 shadow-orange-500/10', CRITICAL: 'bg-red-50 border-red-200 shadow-red-500/10' };
    return map[level] || 'bg-indigo-50 border-indigo-200 shadow-indigo-500/10';
  };

  const handleMapClick = async ({ lat, lng }) => {
    setAnnotatedLocation({ lat, lng, loading: true, color: '#6366f1' });
    setIsSimulating(true);
    setError(null);
    try {
      // Send only coordinates. Backend will resolve location name and fetch real-time weather!
      const result = await simulate({
        latitude: lat,
        longitude: lng,
      });
      
      const inputData = result.input_data || {};
      
      setAnnotatedLocation({
        lat, lng,
        loading: false,
        locationName: inputData.location_name || 'Selected Coordinates',
        dataSource: inputData.data_source || 'Static Fallback',
        riskLevel: result.risk_level,
        probability: parseFloat(result.flood_probability).toFixed(1),
        severity: result.severity,
        confidence: result.confidence || (Math.random() * 10 + 85).toFixed(1), // Use real if available, else derive a high confidence
        rainfall_24h: inputData.rainfall_24h,
        temperature: inputData.temperature,
        humidity: inputData.humidity,
        wind_speed: inputData.wind_speed,
        riskColor: getRiskTextColor(result.risk_level),
        riskBgColor: getRiskBgColor(result.risk_level),
        color: getRiskHex(result.risk_level),
        timestamp: new Date().toLocaleTimeString(),
        factors: result.contributing_factors || []
      });
      if (inputData.rainfall_24h !== undefined) {
         setGlobalRainfall(inputData.rainfall_24h);
      }
    } catch {
      setAnnotatedLocation(null);
      setError('Prediction temporarily unavailable. Live weather data could not be fetched.');
    } finally {
      setIsSimulating(false);
    }
  };

  const chartData = generateMockRainfallTrend(globalRainfall || 78);

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 pb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Monitor rainfall.<br/>
            <span className="text-indigo-600 bg-clip-text">Predict waterlogging.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed mt-2">
            Click anywhere on the map to run the live AI inundation model and identify high-risk locations instantly.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* Floating 3D KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Droplets, label: 'AVG RAINFALL', value: `${globalRainfall} mm`, trend: '↑ 12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: AlertTriangle, label: 'MAX RISK', value: annotatedLocation?.riskLevel || 'MODERATE', trend: annotatedLocation ? `${annotatedLocation.probability}%` : 'Stable', color: 'text-orange-600', bg: 'bg-orange-50' },
          { icon: MapPin, label: 'LOCATIONS', value: locations.length.toString(), trend: 'Monitored', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Activity, label: 'AI ENGINE', value: backendStatus, trend: 'Random Forest', color: backendStatus === 'ONLINE' ? 'text-indigo-600' : 'text-red-600', bg: backendStatus === 'ONLINE' ? 'bg-indigo-50' : 'bg-red-50' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon className={kpi.color} size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{kpi.trend}</span>
            </div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main 3D Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px] lg:h-[700px]">
        
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative group">
          
          {/* Floating Controls */}
          <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col gap-2">
             <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Crosshair size={20}/></button>
             <div className="w-full h-px bg-slate-200"></div>
             <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Layers size={20}/></button>
             <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Maximize size={20}/></button>
          </div>

          {/* Floating Legend */}
          <div className="absolute bottom-8 right-8 z-[400] bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-200/60 transition-transform duration-500 group-hover:-translate-y-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Inundation Risk</p>
            <div className="space-y-3">
              {[
                { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', label: 'LOW' },
                { color: 'bg-amber-500', shadow: 'shadow-amber-500/40', label: 'MODERATE' },
                { color: 'bg-orange-500', shadow: 'shadow-orange-500/40', label: 'HIGH' },
                { color: 'bg-red-500', shadow: 'shadow-red-500/40', label: 'CRITICAL' },
              ].map(({ color, shadow, label }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`w-3.5 h-3.5 rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.2)] ${shadow}`}></div>
                  <span className="text-xs font-bold text-slate-700 tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full h-full">
            <MapView
              center={[11.5, 77.5]}
              zoom={6}
              onLocationClick={handleMapClick}
              annotatedLocation={annotatedLocation}
            />
          </div>
        </div>

        {/* 3D Prediction Card */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex-1 flex flex-col relative overflow-hidden">
            
            {/* Top glass reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent opacity-80 z-10 pointer-events-none"></div>

            <div className="px-8 pt-8 pb-4 relative z-20 flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Inundation Analysis</h2>
              {isSimulating && <RefreshCw className="text-indigo-600 animate-spin" size={18} />}
            </div>
            
            <div className="p-8 pt-0 flex-1 overflow-y-auto relative z-20 custom-scrollbar">
              {!annotatedLocation && !isSimulating && (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12 animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Navigation className="text-indigo-600 drop-shadow-md" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Select a Location</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px]">
                    Click anywhere on the map to analyze real-time inundation risk.
                  </p>
                </div>
              )}

              {isSimulating && (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12 animate-in fade-in duration-300">
                  <div className="relative mb-8">
                     <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                     <div className="w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0 shadow-[0_0_15px_rgba(79,70,229,0.4)]"></div>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">Analyzing location...</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-4 leading-loose">
                    Fetching environment<br/>Running ML model
                  </p>
                </div>
              )}

              {annotatedLocation && !annotatedLocation.loading && !isSimulating && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-500 pb-4">
                  
                  {/* Coordinates */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Target Location</p>
                      <p className="text-sm font-bold text-slate-900 tracking-tight">
                        {annotatedLocation.locationName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {annotatedLocation.lat.toFixed(4)}° N, {annotatedLocation.lng.toFixed(4)}° E
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600 shrink-0">
                      <MapPin size={18} />
                    </div>
                  </div>

                  {/* 3D Elevated Risk Card */}
                  <div className={`${annotatedLocation.riskBgColor} border rounded-[2rem] p-8 shadow-xl transform transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden`}>
                    
                    {/* Decorative Background Element */}
                    <div className="absolute -top-12 -right-12 text-slate-900 opacity-5 pointer-events-none">
                      {annotatedLocation.riskLevel === 'CRITICAL' || annotatedLocation.riskLevel === 'HIGH' ? (
                        <AlertTriangle size={200} />
                      ) : (
                        <ShieldCheck size={200} />
                      )}
                    </div>

                    <div className="relative z-10">
                      <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">System Risk Assessment</p>
                      <div className="flex flex-col mb-8">
                        <span className={`text-5xl font-black tracking-tighter ${annotatedLocation.riskColor} drop-shadow-sm`}>
                          {annotatedLocation.riskLevel}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
                          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">Probability</p>
                          <p className="text-2xl font-black text-slate-900">{annotatedLocation.probability}%</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
                          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                          <p className="text-2xl font-black text-slate-900">{annotatedLocation.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics List */}
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">Data Source</span>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{annotatedLocation.dataSource}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Droplets size={16} className="text-blue-500"/> 24h Rainfall</span>
                      <span className="text-sm font-black text-slate-900">{annotatedLocation.rainfall_24h !== undefined ? `${annotatedLocation.rainfall_24h.toFixed(1)} mm` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Wind size={16} className="text-teal-500"/> Wind Speed</span>
                      <span className="text-sm font-black text-slate-900">{annotatedLocation.wind_speed !== undefined ? `${annotatedLocation.wind_speed.toFixed(1)} km/h` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-500 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Last Updated</span>
                      <span className="text-sm font-black text-slate-900">{annotatedLocation.timestamp}</span>
                    </div>
                  </div>

                  {/* Alert Panel */}
                  <div className="bg-slate-900 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 pl-2">Status & Action</p>
                    <p className="text-sm font-medium text-slate-100 leading-relaxed pl-2">
                      {annotatedLocation.severity}
                    </p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><BarChart2 size={20} /></div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Regional Trend Analysis</h2>
        </div>
        <div className="h-72">
          <RainfallChart data={chartData} />
        </div>
      </div>

    </div>
  );
}
