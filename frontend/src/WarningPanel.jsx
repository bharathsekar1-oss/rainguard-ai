import React from 'react';
import { AlertTriangle, Clock, MapPin, Activity } from 'lucide-react';

const WarningPanel = ({ prediction, location, visible }) => {
  if (!visible || !prediction || !location) return null;

  const isCritical = prediction.risk_level === 'CRITICAL';
  const bgColor = isCritical ? 'bg-red-900/40 border-red-500' : 'bg-orange-900/40 border-orange-500';
  const headerColor = isCritical ? 'bg-red-600' : 'bg-orange-600';
  const textColor = isCritical ? 'text-red-400' : 'text-orange-400';

  return (
    <div className={`rounded-xl border ${bgColor} shadow-lg overflow-hidden ${isCritical ? 'animate-pulse-ring' : ''}`}>
      <div className={`${headerColor} px-4 py-3 flex items-center space-x-2 text-white`}>
        <AlertTriangle className="w-5 h-5 animate-bounce" />
        <h3 className="font-bold tracking-wide">
          {isCritical ? 'CRITICAL FLOOD WARNING' : 'HIGH FLOOD ALERT'}
        </h3>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className={`w-5 h-5 ${textColor} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm text-slate-400">Affected Location</p>
                <p className="font-semibold text-white">{location.name}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Activity className={`w-5 h-5 ${textColor} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm text-slate-400">Risk Assessment</p>
                <p className="font-semibold text-white">{prediction.flood_probability.toFixed(1)}% Probability</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Clock className={`w-5 h-5 ${textColor} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm text-slate-400">Expected Time Window</p>
                <p className="font-semibold text-white">Next 1-3 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Primary Risk Factors:</h4>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
            {prediction.contributing_factors?.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            )) || (
              <>
                <li>Intense localized rainfall</li>
                <li>Inadequate drainage capacity</li>
              </>
            )}
          </ul>
        </div>
        
        <div className="mt-4 p-3 bg-slate-900/60 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Recommended Actions:</h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {prediction.recommended_actions?.map((action, idx) => (
              <li key={idx}>{action}</li>
            )) || (
              <>
                <li>Move to higher ground immediately</li>
                <li>Avoid walking or driving through flood waters</li>
                <li>Follow official emergency broadcast instructions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WarningPanel;
