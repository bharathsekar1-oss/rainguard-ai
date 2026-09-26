export default function WeatherInputs({ inputs, setInputs }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Rainfall (mm/hr)</label>
        <input
          type="number"
          name="rainfall"
          value={inputs?.rainfall || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="e.g. 50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Soil Moisture (%)</label>
        <input
          type="number"
          name="soilMoisture"
          value={inputs?.soilMoisture || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="e.g. 80"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">River Level (m)</label>
        <input
          type="number"
          name="riverLevel"
          value={inputs?.riverLevel || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="e.g. 3.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (hrs)</label>
        <input
          type="number"
          name="duration"
          value={inputs?.duration || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="e.g. 24"
        />
      </div>
    </div>
  )
}
