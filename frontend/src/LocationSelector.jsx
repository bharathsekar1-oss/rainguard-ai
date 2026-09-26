import React, { useState, useEffect } from 'react';
import { getLocations } from '../services/api';
import { MapPin, Navigation } from 'lucide-react';

const LocationSelector = ({ selectedLocation, onLocationSelect }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        // Since we are mocking the API if it's down, let's provide fallbacks
        const locationsData = data && data.length ? data : [
          { id: 'loc-1', name: 'Mumbai', description: 'Coastal city, high risk during monsoon', lat: 19.0760, lng: 72.8777, elevation: 14, urbanization: 0.9, drainage: 0.4 },
          { id: 'loc-2', name: 'Chennai', description: 'Flat terrain, susceptible to cyclones', lat: 13.0827, lng: 80.2707, elevation: 6, urbanization: 0.8, drainage: 0.3 },
          { id: 'loc-3', name: 'Pune', description: 'Inland city, moderate risk', lat: 18.5204, lng: 73.8567, elevation: 560, urbanization: 0.7, drainage: 0.6 }
        ];
        setLocations(locationsData);
      } catch (e) {
        console.error("Failed to fetch locations", e);
        // Fallback demo data
        setLocations([
          { id: 'loc-1', name: 'Mumbai', description: 'Coastal city, high risk', lat: 19.0760, lng: 72.8777, elevation: 14, urbanization: 0.9, drainage: 0.4 },
          { id: 'loc-2', name: 'Chennai', description: 'Flat terrain, cyclonic', lat: 13.0827, lng: 80.2707, elevation: 6, urbanization: 0.8, drainage: 0.3 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-4">
      <div className="flex items-center space-x-2 mb-4 text-slate-300">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Select Location</h3>
      </div>
      
      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((loc) => (
            <div 
              key={loc.id || loc.name}
              onClick={() => onLocationSelect(loc)}
              className={`cursor-pointer p-3 rounded-lg border transition-all ${
                selectedLocation?.name === loc.name 
                  ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-white">{loc.name}</h4>
                {selectedLocation?.name === loc.name && <Navigation className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{loc.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
