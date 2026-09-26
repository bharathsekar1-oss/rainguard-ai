export default function RiskIndicator({ level = 'LOW', probability = 0, confidence = 0, loading = false }) {
  const getColors = () => {
    switch(level) {
      case 'CRITICAL': return { stroke: '#f43f5e', fill: 'text-rose-500', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.6)]' };
      case 'HIGH': return { stroke: '#f97316', fill: 'text-orange-500', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]' };
      case 'MODERATE': return { stroke: '#fbbf24', fill: 'text-amber-500', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]' };
      case 'LOW': default: return { stroke: '#34d399', fill: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]' };
    }
  };

  const colors = getColors();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center w-48 h-48 rounded-full bg-slate-900 border border-slate-700/50 ${colors.glow}`}>
        
        {/* SVG Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle 
            cx="80" cy="80" r={radius} 
            stroke="#1e293b" strokeWidth="8" fill="none" 
          />
          <circle 
            cx="80" cy="80" r={radius} 
            stroke={colors.stroke} strokeWidth="8" fill="none" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="text-center z-10 flex flex-col items-center">
          {loading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
          ) : (
            <>
              <span className={`text-4xl font-extrabold ${colors.fill}`}>
                {probability.toFixed(0)}%
              </span>
              <span className={`text-xs font-bold tracking-widest uppercase mt-1 ${colors.fill}`}>
                {level}
              </span>
            </>
          )}
        </div>
      </div>
      
      {!loading && (
        <div className="mt-4 text-xs text-slate-400 font-medium tracking-wide">
          Confidence Score: <span className="text-slate-200">{confidence}%</span>
        </div>
      )}
    </div>
  );
}
