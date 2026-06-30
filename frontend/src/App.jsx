import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateEmergency from "./pages/CreateEmergency";
import AmbulanceTracking from "./pages/AmbulanceTracking";
import HospitalView from "./pages/HospitalView";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/create-emergency" className="hover:text-blue-400">Report Emergency</Link>
        <Link to="/tracking" className="hover:text-blue-400">Ambulance Tracking</Link>
        <Link to="/hospitals" className="hover:text-blue-400">Hospitals</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-emergency" element={<CreateEmergency />} />
        <Route path="/tracking" element={<AmbulanceTracking />} />
        <Route path="/hospitals" element={<HospitalView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;