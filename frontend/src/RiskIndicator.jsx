import React from 'react';
import { getRiskColor, getRiskEmoji } from '../utils/helpers';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const RiskIndicator = ({ probability, riskLevel, confidence }) => {
  const safeProb = probability !== undefined ? probability : 0;
  const safeRiskLevel = riskLevel || 'LOW';
  const color = getRiskColor(safeRiskLevel);
  const isHighRisk = safeRiskLevel === 'HIGH' || safeRiskLevel === 'CRITICAL';
  
  // Calculate stroke dasharray for the circular progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeProb / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
      {/* Background glow for critical risk */}
      {safeRiskLevel === 'CRITICAL' && (
        <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"></div>
      )}

      <h3 className="text-lg font-semibold text-slate-300 mb-6">Flood Probability</h3>

      <div className={`relative flex items-center justify-center w-48 h-48 mb-6 ${isHighRisk ? 'animate-pulse-ring' : ''}`}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#334155" // slate-700
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-white tracking-tighter">
            {Math.round(safeProb)}%
          </span>
          <span className="text-sm font-medium mt-1" style={{ color }}>
            {safeRiskLevel}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/50 px-4 py-2 rounded-full">
        {isHighRisk ? (
          <ShieldAlert className="w-5 h-5 text-red-400" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-green-400" />
        )}
        <span className="text-sm">
          Model Confidence: <strong className="text-white">{(confidence * 100).toFixed(1)}%</strong>
        </span>
      </div>
    </div>
  );
};

export default RiskIndicator;
