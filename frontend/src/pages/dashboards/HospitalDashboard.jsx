import { useEffect, useState } from "react";
import api from "../../api/api";
import Navbar from "../../components/Navbar";

function HospitalDashboard() {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [incomingEmergencies, setIncomingEmergencies] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (["emergency_dispatched", "emergency_completed"].includes(message.event)) {
        fetchData();
      }
    };
    return () => ws.close();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user to find hospital_id
      const meRes = await api.get("/auth/me");
      const hospitalId = meRes.data.hospital_id;

      if (hospitalId) {
        // Get hospital details
        const hospRes = await api.get(`/hospitals/${hospitalId}`);
        setHospitalInfo(hospRes.data);

        // Get all emergencies and filter by this hospital
        const emRes = await api.get("/emergencies/");
        const myEmergencies = emRes.data.filter(
          (em) => em.hospital_id === hospitalId
        );
        setIncomingEmergencies(myEmergencies);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const occupancy = hospitalInfo
    ? Math.round(
        ((hospitalInfo.total_beds - hospitalInfo.available_beds) /
          hospitalInfo.total_beds) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Hospital Portal" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${
              wsConnected ? "bg-green-400 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-slate-400 text-sm">
            {wsConnected ? "Live updates active" : "Disconnected"}
          </span>
        </div>

        {/* Hospital Info Card */}
        {hospitalInfo && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white text-xl font-bold">
                  {hospitalInfo.name}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Lat: {hospitalInfo.latitude} | Lng: {hospitalInfo.longitude}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hospitalInfo.available_beds === 0
                    ? "bg-red-900 text-red-300"
                    : "bg-green-900 text-green-300"
                }`}
              >
                {hospitalInfo.available_beds === 0 ? "Full" : "Accepting"}
              </span>
            </div>

            {/* Bed capacity */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {hospitalInfo.total_beds}
                </p>
                <p className="text-slate-400 text-xs mt-1">Total Beds</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-400">
                  {hospitalInfo.available_beds}
                </p>
                <p className="text-slate-400 text-xs mt-1">Available</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-400">
                  {hospitalInfo.total_beds - hospitalInfo.available_beds}
                </p>
                <p className="text-slate-400 text-xs mt-1">Occupied</p>
              </div>
            </div>

            {/* Occupancy bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Occupancy</span>
                <span>{occupancy}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    occupancy >= 90
                      ? "bg-red-500"
                      : occupancy >= 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Incoming Emergencies */}
        <h2 className="text-white font-semibold text-lg mb-3">
          Incoming Patients ({incomingEmergencies.length})
        </h2>

        {incomingEmergencies.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-4xl mb-3">🏥</p>
            <p className="text-white font-medium">No incoming patients</p>
            <p className="text-slate-400 text-sm mt-1">
              Patients dispatched to your hospital will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingEmergencies.map((em) => (
              <div
                key={em.id}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        severityColors[em.severity] ||
                        "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {em.severity?.toUpperCase()}
                    </span>
                    <span className="text-white font-medium capitalize">
                      {em.emergency_type}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold capitalize ${
                      statusColors[em.status]
                    }`}
                  >
                    {em.status}
                  </span>
                </div>

                {em.eta_minutes && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-2">
                    <p className="text-blue-300 text-sm">
                      🚑 Ambulance arriving in{" "}
                      <span className="font-bold text-white">
                        {em.eta_minutes} minutes
                      </span>
                    </p>
                  </div>
                )}

                {em.status === "completed" && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-2">
                    <p className="text-green-300 text-sm">✅ Patient discharged</p>
                  </div>
                )}

                <p className="text-slate-500 text-xs">
                  Emergency ID: {em.id.slice(0, 8)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalDashboard;