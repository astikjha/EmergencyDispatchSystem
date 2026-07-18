import { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import Navbar from "../../components/Navbar";
import EmergencyMap from "../../components/EmergencyMap";

function DriverDashboard() {
  const [ambulanceInfo, setAmbulanceInfo] = useState(null);
  const [assignedEmergency, setAssignedEmergency] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const locationInterval = useRef(null);

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
    return () => {
      ws.close();
      stopSharing();
    };
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const ambulanceId = meRes.data.ambulance_id;

      if (ambulanceId) {
        // Get ambulance details
        const ambRes = await api.get(`/ambulances/${ambulanceId}`);
        setAmbulanceInfo(ambRes.data);

        // Find emergency assigned to this ambulance
        const emRes = await api.get("/emergencies/");
        const active = emRes.data.find(
          (em) =>
            em.ambulance_id === ambulanceId &&
            (em.status === "dispatched" || em.status === "en_route")
        );
        setAssignedEmergency(active || null);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setSharing(true);

    // Send location every 5 seconds
    locationInterval.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await api.put(`/ambulances/${ambulanceInfo.id}/location`, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          } catch (err) {
            console.error("Location update failed:", err);
          }
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }, 5000);
  };

  const stopSharing = () => {
    setSharing(false);
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  };

  const severityColors = {
    critical: "bg-red-900 text-red-300 border border-red-700",
    high: "bg-orange-900 text-orange-300 border border-orange-700",
    medium: "bg-yellow-900 text-yellow-300 border border-yellow-700",
    low: "bg-green-900 text-green-300 border border-green-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Driver Portal" />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
          <span className="text-slate-400 text-sm">
            {wsConnected ? "Live updates active" : "Disconnected"}
          </span>
        </div>

        {/* Ambulance Info */}
        {ambulanceInfo && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-white text-lg font-bold">
                  {ambulanceInfo.vehicle_number}
                </h2>
                <p className="text-slate-400 text-sm">{ambulanceInfo.driver_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ambulanceInfo.status === "available"
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}>
                {ambulanceInfo.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Current Lat</p>
                <p className="text-white font-medium">
                  {ambulanceInfo.latitude?.toFixed(4)}
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Current Lng</p>
                <p className="text-white font-medium">
                  {ambulanceInfo.longitude?.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GPS Location Sharing */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">📍 Live Location Sharing</h3>
          <p className="text-slate-400 text-sm mb-4">
            Share your real-time GPS location so patients and hospitals can track you.
            Updates every 5 seconds.
          </p>

          {!sharing ? (
            <button
              onClick={startSharing}
              disabled={!ambulanceInfo}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              📍 Start Sharing Location
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg p-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-300 text-sm font-medium">
                  Location sharing active — updating every 5 seconds
                </p>
              </div>
              <button
                onClick={stopSharing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Stop Sharing
              </button>
            </div>
          )}
        </div>

        {/* Assigned Emergency */}
        <h2 className="text-white font-semibold text-lg mb-3">
          Current Assignment
        </h2>

        {!assignedEmergency ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-4xl mb-3">🚑</p>
            <p className="text-white font-medium">No active assignment</p>
            <p className="text-slate-400 text-sm mt-1">
              You'll be notified when an emergency is assigned to you
            </p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${severityColors[assignedEmergency.severity] || "bg-slate-700 text-slate-300"}`}>
                  {assignedEmergency.severity?.toUpperCase()}
                </span>
                <span className="text-white font-medium capitalize">
                  {assignedEmergency.emergency_type}
                </span>
              </div>
              <span className="text-blue-400 text-sm font-semibold capitalize">
                {assignedEmergency.status}
              </span>
            </div>

            {assignedEmergency.eta_minutes && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-3">
                <p className="text-blue-300 text-sm">Estimated arrival time</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {assignedEmergency.eta_minutes} minutes
                </p>
              </div>
            )}

            {assignedEmergency && (
                <button
                    onClick={async () => {
                    try {
                        await api.post(`/emergencies/${assignedEmergency.id}/complete`);
                        stopSharing();
                        fetchData();
                    } catch (err) {
                        alert("Failed to complete emergency");
                    }
                    }}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    ✅ Mark as Delivered to Hospital
                </button>
            )}

            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Emergency ID</p>
              <p className="text-white text-sm font-mono">
                {assignedEmergency.id}
              </p>
            </div>

            {!sharing && (
              <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Start sharing your location so the patient can track you
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;