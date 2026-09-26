import { MapContainer, TileLayer, Circle, Popup, useMapEvents, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'
import L from 'leaflet'

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle clicks on the map
function MapClickHandler({ onLocationClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationClick) {
        onLocationClick({ lat, lng });
      }
    }
  });
  return null;
}

export default function MapView({ 
  center = [20.5937, 78.9629], // Default to India
  zoom = 5, 
  markers = [], 
  onLocationClick,
  annotatedLocation = null
}) {
  const [mapMode, setMapMode] = useState('INDIA');

  const createPulsingIcon = (color) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          width: 24px; 
          height: 24px; 
          background-color: ${color}; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -50%; left: -50%; right: -50%; bottom: -50%;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse-ring {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const currentCenter = mapMode === 'INDIA' ? [20.5937, 78.9629] : [20.0, 0.0];
  const currentZoom = mapMode === 'INDIA' ? 5 : 2;

  return (
    <div className="h-full min-h-[400px] w-full rounded-2xl overflow-hidden relative z-0">
      
      {/* Map Mode Toggle */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-xl p-1 rounded-xl shadow-lg border border-slate-200/60 flex">
        <button 
          onClick={() => setMapMode('INDIA')}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${mapMode === 'INDIA' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          🇮🇳 INDIA
        </button>
        <button 
          onClick={() => setMapMode('WORLD')}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${mapMode === 'WORLD' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          🌍 WORLD
        </button>
      </div>

      <MapContainer center={currentCenter} zoom={currentZoom} key={mapMode} style={{ height: '100%', width: '100%', background: '#f8fafc' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationClick={onLocationClick} />

        {/* Existing Markers */}
        {markers.map((marker, idx) => (
          <Circle
            key={idx}
            center={marker.position}
            radius={marker.radius || 15000}
            pathOptions={{ 
              color: marker.color || '#3b82f6', 
              fillColor: marker.color || '#3b82f6', 
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4">
                <div className="font-extrabold text-lg mb-1 text-slate-900">{marker.title}</div>
                <div className="text-slate-500 text-sm font-medium">{marker.description}</div>
                {marker.probability && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase">Risk</span>
                    <span className="text-sm font-black text-slate-900">{marker.probability}%</span>
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Annotated Location from click */}
        {annotatedLocation && (
          <Marker 
            position={[annotatedLocation.lat, annotatedLocation.lng]}
            icon={createPulsingIcon(annotatedLocation.color || '#4f46e5')}
          >
            <Popup className="custom-popup" autoPan={true}>
              <div className="p-4 min-w-[220px]">
                {annotatedLocation.loading ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Analyzing...</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-2">Location Analysis</div>
                    
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Risk Level</span>
                      <span className={`font-black text-sm ${annotatedLocation.riskColor}`}>
                        {annotatedLocation.riskLevel || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Probability</span>
                      <span className="font-black text-sm text-slate-900">{annotatedLocation.probability || 0}%</span>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
