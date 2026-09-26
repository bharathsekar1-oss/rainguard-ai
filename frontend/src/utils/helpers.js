import { RISK_COLORS } from './constants';

export const getRiskColor = (level) => {
  return RISK_COLORS[level] || '#94a3b8';
};

export const getRiskEmoji = (level) => {
  switch(level) {
    case 'LOW': return '🟢';
    case 'MODERATE': return '🟡';
    case 'HIGH': return '🟠';
    case 'CRITICAL': return '🔴';
    default: return '⚪';
  }
};

export const formatDateTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const generateMockRainfallTrend = (currentRainfall24h) => {
  const data = [];
  let currentVal = 0;
  const step = currentRainfall24h / 24;
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date();
    time.setHours(time.getHours() - i);
    currentVal += step + (Math.random() * step * 0.5 - step * 0.25);
    
    // Simulate risk trend matching rain trend
    let risk = 10;
    if (currentVal > 150) risk = 85;
    else if (currentVal > 80) risk = 65;
    else if (currentVal > 30) risk = 40;

    data.push({
      time: time.getHours() + ':00',
      rainfall: Math.max(0, currentVal).toFixed(1),
      risk: risk + (Math.random() * 10 - 5)
    });
  }
  return data;
};
