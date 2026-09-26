export const RISK_COLORS = { LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };
export const RISK_BG_COLORS = { LOW: 'bg-green-500', MODERATE: 'bg-yellow-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500' };

export const DEFAULT_WEATHER = { 
  rainfall_1h: 5, 
  rainfall_3h: 12, 
  rainfall_6h: 20, 
  rainfall_24h: 35, 
  temperature: 30, 
  humidity: 70, 
  wind_speed: 15, 
  elevation: 50, 
  urbanization_factor: 0.5, 
  drainage_factor: 0.5 
};

export const RAIN_PRESETS = { 
  normal: {rainfall_1h: 5, rainfall_3h: 12, rainfall_6h: 20, rainfall_24h: 35}, 
  heavy: {rainfall_1h: 40, rainfall_3h: 90, rainfall_6h: 160, rainfall_24h: 280}, 
  extreme: {rainfall_1h: 85, rainfall_3h: 200, rainfall_6h: 380, rainfall_24h: 600} 
};
