import { useEffect, useState } from "react";
import api from "../../api/api";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";

function AdminDashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    fetchAll();

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (["emergency_dispatched", "emergency_completed",
           "ambulance_location_update"].includes(message.event)) {
        fetchAll();
      }
    };
    return () => ws.close();
  }, []);

  const fetchAll = async () => {
    try {
      const [emRes, ambRes, hospRes] = await Promise.all([
        api.get("/emergencies/"),
        api.get("/ambulances/"),
        api.get("/hospitals/"),
      ]);
      setEmergencies(emRes.data);
      setAmbulances(ambRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleDispatch = async (emergencyId) => {
    setDispatching(emergencyId);
    try {
      await api.post(`/emergencies/${emergencyId}/dispatch`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Dispatch failed");
    }
    setDispatching(null);
  };

  const handleComplete = async (emergencyId) => {
    try {
      await api.post(`/emergencies/${emergencyId}/complete`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to complete");
    }
  };

  const severityColors = {
    critical: "bg-red-900 text-red-300 border border-red-700",
    high: "bg-orange-900 text-orange-300 border border-orange-700",
    medium: "bg-yellow-900 text-yellow-300 border border-yellow-700",
    low: "bg-green-900 text-green-300 border border-green-700",
  };

  const statusColors = {
    pending: "text-yellow-400",
    dispatched: "text-blue-400",
    en_route: "text-blue-400",
    completed: "text-green-400",
    cancelled: "text-slate-400",
  };

  const pendingCount = emergencies.filter(e => e.status === "pending").length;
  const activeCount = emergencies.filter(e => e.status === "dispatched" || e.status === "en_route").length;
  const availableAmb = ambulances.filter(a => a.status === "available").length;
  const criticalCount = emergencies.filter(e => e.severity === "critical" && e.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Admin Control Center" />

      <div className="p-6">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400 animate-pulse" : "bg-red-500"}`}></div>
          <span className="text-slate-400 text-sm">
            {wsConnected ? "Live updates active" : "Disconnected"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Pending Emergencies" value={pendingCount} color="yellow" />
          <StatCard title="Active Dispatches" value={activeCount} color="blue" />
          <StatCard title="Available Ambulances" value={availableAmb} color="green" />
          <StatCard title="Critical Pending" value={criticalCount} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Emergencies */}
          <div className="lg:col-span-2">
            <h2 className="text-white font-semibold text-lg mb-3">
              All Emergencies ({emergencies.length})
            </h2>
            <div className="space-y-3">
              {emergencies.length === 0 && (
                <div className="bg-slate-800 rounded-lg p-4 text-slate-500">
                  No emergencies yet
                </div>
              )}
              {emergencies.map((em) => (
                <div key={em.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${severityColors[em.severity] || "bg-slate-700 text-slate-300"}`}>
                        {em.severity?.toUpperCase()}
                      </span>
                      <span className="text-white font-medium capitalize">
                        {em.emergency_type}
                      </span>
                    </div>
                    <span className={`text-sm font-medium capitalize ${statusColors[em.status]}`}>
                      {em.status}
                    </span>
                  </div>

                  {em.eta_minutes && (
                    <p className="text-slate-400 text-sm mb-2">
                      ETA: <span className="text-white">{em.eta_minutes} min</span>
                    </p>
                  )}

                  <p className="text-slate-500 text-xs mb-3">
                    ID: {em.id.slice(0, 8)}...
                  </p>

                  <div className="flex gap-2">
                    {em.status === "pending" && (
                      <button
                        onClick={() => handleDispatch(em.id)}
                        disabled={dispatching === em.id}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {dispatching === em.id ? "Dispatching..." : "Dispatch"}
                      </button>
                    )}
                    {em.status === "dispatched" && (
                      <button
                        onClick={() => handleComplete(em.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Ambulances */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-3">
                Ambulances ({ambulances.length})
              </h2>
              <div className="space-y-2">
                {ambulances.map((amb) => (
                  <div key={amb.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm font-medium">{amb.vehicle_number}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        amb.status === "available"
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}>
                        {amb.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{amb.driver_name}</p>
                  </div>
                ))}
                {ambulances.length === 0 && (
                  <p className="text-slate-500 text-sm">No ambulances registered</p>
                )}
              </div>
            </div>

            {/* Hospitals */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-3">
                Hospitals ({hospitals.length})
              </h2>
              <div className="space-y-2">
                {hospitals.map((hosp) => {
                  const occupancy = Math.round(
                    ((hosp.total_beds - hosp.available_beds) / hosp.total_beds) * 100
                  );
                  return (
                    <div key={hosp.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                      <p className="text-white text-sm font-medium mb-1">{hosp.name}</p>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Beds available</span>
                        <span>{hosp.available_beds}/{hosp.total_beds}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            occupancy >= 90 ? "bg-red-500" :
                            occupancy >= 60 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {hospitals.length === 0 && (
                  <p className="text-slate-500 text-sm">No hospitals registered</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;