import { MapPin } from 'lucide-react';

export default function LocationSelector({ locations = [], selected, onSelect }) {
  const handleChange = (e) => {
    const loc = locations.find(l => l.name === e.target.value);
    if (loc) {
      onSelect(loc);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Monitored Region</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-blue-400" />
        </div>
        <select
          value={selected?.name || ''}
          onChange={handleChange}
          className="block w-full pl-10 pr-10 py-3 text-base bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-xl text-slate-100 appearance-none cursor-pointer shadow-inner"
        >
          <option value="" disabled>Select a demo region...</option>
          {locations.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
        {/* Custom arrow for select */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {selected?.description && (
         <p className="text-xs text-slate-500 ml-1 mt-1 truncate">{selected.description}</p>
      )}
    </div>
  );
}
