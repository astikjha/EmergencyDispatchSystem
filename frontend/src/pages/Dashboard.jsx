import { useEffect, useState } from "react";
import api from "../api/api";

function Dashboard() {
  // useState creates a piece of data that React tracks
  // When this data changes, React automatically re-renders the UI
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  // useEffect runs code when the component first loads (and optionally when data changes)
  // Here we fetch all data from backend the moment Dashboard appears on screen
  useEffect(() => {
    fetchData();
  }, []); // empty array means "run only once, when page loads"

  const fetchData = async () => {
    try {
      const ambulanceRes = await api.get("/ambulances/");
      const hospitalRes = await api.get("/hospitals/");
      const emergencyRes = await api.get("/emergencies/");

      setAmbulances(ambulanceRes.data);
      setHospitals(hospitalRes.data);
      setEmergencies(emergencyRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Emergency Dispatch Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Ambulances Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            Ambulances ({ambulances.length})
          </h2>
          {ambulances.map((amb) => (
            <div key={amb.id} className="border-b py-2">
              <p className="font-medium">{amb.vehicle_number}</p>
              <p className="text-sm text-gray-500">Driver: {amb.driver_name}</p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  amb.status === "available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {amb.status}
              </span>
            </div>
          ))}
        </div>

        {/* Hospitals Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            Hospitals ({hospitals.length})
          </h2>
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="border-b py-2">
              <p className="font-medium">{hosp.name}</p>
              <p className="text-sm text-gray-500">
                Beds available: {hosp.available_beds} / {hosp.total_beds}
              </p>
            </div>
          ))}
        </div>

        {/* Emergencies Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3 text-red-600">
            Emergencies ({emergencies.length})
          </h2>
          {emergencies.map((em) => (
            <div key={em.id} className="border-b py-2">
              <p className="font-medium">{em.emergency_type}</p>
              <p className="text-sm text-gray-500">
                Severity: {em.severity} | Status: {em.status}
              </p>
              {em.eta_minutes && (
                <p className="text-sm text-gray-500">
                  ETA: {em.eta_minutes} min
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;