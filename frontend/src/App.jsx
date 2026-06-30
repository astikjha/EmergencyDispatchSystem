import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateEmergency from "./pages/CreateEmergency";

function App() {
  return (
    <BrowserRouter>
      {/* Navigation bar — visible on every page */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/create-emergency" className="hover:text-blue-400">Report Emergency</Link>
      </nav>

      {/* Routes — defines which page shows for which URL */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-emergency" element={<CreateEmergency />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;