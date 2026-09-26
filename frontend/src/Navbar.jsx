import React, { useEffect, useState } from 'react';
import { getHealth } from '../services/api';

const Navbar = ({ title }) => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealth();
        setIsHealthy(true);
      } catch (e) {
        setIsHealthy(false);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
      
      <div className="flex items-center space-x-4 mt-2 md:mt-0 text-sm text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            {isHealthy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span>{isHealthy ? 'System Online' : 'System Offline'}</span>
        </div>
        <span>•</span>
        <span>Updated: {lastUpdated}</span>
      </div>
    </div>
  );
};

export default Navbar;
