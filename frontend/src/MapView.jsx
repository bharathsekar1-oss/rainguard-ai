import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRiskColor, getRiskEmoji } from '../utils/helpers';

// Fix Leaflet's default icon path issues with bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to handle map centering when location changes
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 11, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// Component for map clicks
const MapEvents = ({ onLocationClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!onLocationClick) return;
    
    const onClick = (e) => {
      onLocationClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    
    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, onLocationClick]);
  return null;
};

const MapView = ({ location, riskLevel, probability, rainfall, onLocationClick, fullHeight = false }) => {
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
  const center = location ? [location.lat, location.lng] : [defaultCenter.lat, defaultCenter.lng];
  const color = getRiskColor(riskLevel);
  const emoji = getRiskEmoji(riskLevel);

  // Calculate radius based on probability (in meters)
  const radius = probability ? Math.max(2000, (probability / 100) * 10000) : 5000;

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden relative ${fullHeight ? 'h-full' : 'h-[400px]'}`}>
      <MapContainer 
        center={center} 
        zoom={location ? 11 : 5} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tiles
        />
        
        {location && (
          <>
            <MapUpdater center={location} />
            <Marker position={[location.lat, location.lng]}>
              <Popup className="custom-popup">
                <div className="font-sans">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-1 mb-2">{location.name}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                    <span className="font-semibold">Risk Level:</span>
                    <span className="font-bold flex items-center gap-1" style={{ color }}>
                      {emoji} {riskLevel || 'LOW'}
                    </span>
                    
                    <span className="font-semibold">Probability:</span>
                    <span>{probability !== undefined ? `${probability.toFixed(1)}%` : 'N/A'}</span>
                    
                    {rainfall !== undefined && (
                      <>
                        <span className="font-semibold">Rainfall (24h):</span>
                        <span>{rainfall} mm</span>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
              <Circle 
                center={[location.lat, location.lng]} 
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
                radius={radius} 
                className="animate-pulse"
              />
            )}
            {(riskLevel === 'LOW' || riskLevel === 'MODERATE') && (
              <Circle 
                center={[location.lat, location.lng]} 
                pathOptions={{ color, fillColor: color, fillOpacity: 0.1, weight: 1 }}
                radius={radius} 
              />
            )}
          </>
        )}
        <MapEvents onLocationClick={onLocationClick} />
      </MapContainer>

      {/* Custom Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[20] bg-slate-900/90 border border-slate-700 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Risk Levels</h4>
        <div className="space-y-1.5">
          <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span><span className="text-slate-300">Low Risk (&lt;25%)</span></div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span><span className="text-slate-300">Moderate Risk (25-50%)</span></div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span><span className="text-slate-300">High Risk (50-75%)</span></div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span><span className="text-slate-300">Critical Risk (&gt;75%)</span></div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
