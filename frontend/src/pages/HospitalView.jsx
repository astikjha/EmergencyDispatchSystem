import { useEffect, useState } from "react";
import api from "../api/api";

function HospitalView() {
  const [hospitals, setHospitals] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchHospitals();

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Hospital bed counts change on dispatch (bed taken) and completion (bed freed)
      // Simplest reliable way to stay in sync is refetch on these events
      if (message.event === "emergency_dispatched" || message.event === "emergency_completed") {
        fetchHospitals();
      }
    };

    return () => ws.close();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/hospitals/");
      setHospitals(response.data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  // Helper to calculate occupancy percentage for the visual bar
  const getOccupancyPercent = (hospital) => {
    const occupied = hospital.total_beds - hospital.available_beds;
    return Math.round((occupied / hospital.total_beds) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hospital Capacity</h1>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {connected ? "Live" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((hosp) => {
          const occupancy = getOccupancyPercent(hosp);
          const isFull = hosp.available_beds === 0;

          return (
            <div key={hosp.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-2">{hosp.name}</h3>

              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Beds available</span>
                <span className="font-medium">
                  {hosp.available_beds} / {hosp.total_beds}
                </span>
              </div>

              {/* Visual occupancy bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full ${
                    occupancy >= 90 ? "bg-red-500" : occupancy >= 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${occupancy}%` }}
                ></div>
              </div>

              {isFull && (
                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  No beds available
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HospitalView;