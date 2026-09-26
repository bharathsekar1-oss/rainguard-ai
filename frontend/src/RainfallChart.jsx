import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

const RainfallChart = ({ rainfallData }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4 text-slate-300">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">24-Hour Rainfall Trend (Simulated)</h3>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        {rainfallData && rainfallData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={rainfallData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={12}
                tickMargin={10}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => `${value}mm`}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <ReferenceLine y={50} label={{ position: 'insideTopLeft', value: 'High Risk Threshold', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="rainfall" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRainfall)" 
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default RainfallChart;
