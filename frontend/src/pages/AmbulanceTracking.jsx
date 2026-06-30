import { useEffect, useState } from "react";
import api from "../api/api";

function AmbulanceTracking() {
  const [ambulances, setAmbulances] = useState([]);
  const [connected, setConnected] = useState(false);

  // Runs once when page loads
  useEffect(() => {
    // Step 1 — Load initial ambulance data via normal API call
    fetchAmbulances();

    // Step 2 — Open WebSocket connection to listen for live updates
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // We only care about ambulance location updates here
      if (message.event === "ambulance_location_update") {
        const update = message.data;

        // Update only the specific ambulance that moved, keep others unchanged
        setAmbulances((prevAmbulances) =>
          prevAmbulances.map((amb) =>
            amb.id === update.ambulance_id
              ? { ...amb, latitude: update.latitude, longitude: update.longitude, status: update.status }
              : amb
          )
        );
      }

      // Also listen for dispatch events — ambulance status changes to "busy"
      if (message.event === "emergency_dispatched") {
        fetchAmbulances(); // simplest way to refresh full list after a dispatch
      }

      if (message.event === "emergency_completed") {
        fetchAmbulances(); // refresh again when ambulance becomes available
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    // Cleanup — close connection when leaving this page
    // Without this, you'd get multiple connections piling up
    return () => {
      ws.close();
    };
  }, []); // empty array — run once on mount

  const fetchAmbulances = async () => {
    try {
      const response = await api.get("/ambulances/");
      setAmbulances(response.data);
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Live Ambulance Tracking</h1>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {connected ? "Live" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ambulances.map((amb) => (
          <div key={amb.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{amb.vehicle_number}</h3>
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
            <p className="text-sm text-gray-500">Driver: {amb.driver_name}</p>
            <p className="text-sm text-gray-500">
              Lat: {amb.latitude.toFixed(4)}, Lng: {amb.longitude.toFixed(4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AmbulanceTracking;