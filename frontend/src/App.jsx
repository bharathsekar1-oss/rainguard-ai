import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RiskMap from './pages/RiskMap'
import Prediction from './pages/Prediction'
import Alerts from './pages/Alerts'
import History from './pages/History'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<RiskMap />} />
        <Route path="predict" element={<Prediction />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="history" element={<History />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
