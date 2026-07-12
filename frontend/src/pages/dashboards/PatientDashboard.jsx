import { useEffect, useState } from "react";
import api from "../../api/api";
import Navbar from "../../components/Navbar";

function PatientDashboard() {
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: "",
    emergency_type: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchMyEmergencies();

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (["emergency_dispatched", "emergency_completed"].includes(message.event)) {
        fetchMyEmergencies();
      }
    };
    return () => ws.close();
  }, []);

  const fetchMyEmergencies = async () => {
    try {
      const res = await api.get("/emergencies/my");
      setMyEmergencies(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          });
        },
        () => alert("Could not get location. Please enter manually.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await api.post("/emergencies/report", {
            symptoms: formData.symptoms,
            emergency_type: formData.emergency_type,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
        });
        setShowForm(false);
        setFormData({ symptoms: "", emergency_type: "", latitude: "", longitude: "" });
        fetchMyEmergencies();
    } catch (err) {
        alert(err.response?.data?.detail || "Failed to report emergency");
    }
    setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Patient Portal" />

      <div className="p-6 max-w-3xl mx-auto">
        {/* Live indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
            <span className="text-slate-400 text-sm">
              {wsConnected ? "Live updates active" : "Disconnected"}
            </span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? "Cancel" : "🚨 Report Emergency"}
          </button>
        </div>

        {/* Emergency Form */}
        {showForm && (
          <div className="bg-slate-800 border border-red-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4">
              Report Emergency
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Emergency Type
                </label>
                <input
                  type="text"
                  name="emergency_type"
                  value={formData.emergency_type}
                  onChange={handleChange}
                  required
                  placeholder="e.g. cardiac, accident, trauma"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Describe Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="e.g. chest pain, difficulty breathing, severe headache"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg text-sm transition-colors"
              >
                📍 Use My Current Location
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "🚨 Send Emergency Alert"}
              </button>
            </form>
          </div>
        )}

        {/* My Emergencies */}
        <h2 className="text-white font-semibold text-lg mb-3">
          My Emergencies
        </h2>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : myEmergencies.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-medium">No emergencies reported</p>
            <p className="text-slate-400 text-sm mt-1">
              Click "Report Emergency" if you need help
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myEmergencies.map((em) => (
              <div key={em.id}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${severityColors[em.severity] || "bg-slate-700 text-slate-300"}`}>
                      {em.severity?.toUpperCase()}
                    </span>
                    <span className="text-white font-medium capitalize">
                      {em.emergency_type}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold capitalize ${statusColors[em.status]}`}>
                    {em.status}
                  </span>
                </div>

                {em.status === "pending" && (
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-3">
                    <p className="text-yellow-300 text-sm">
                      ⏳ Waiting for ambulance to be dispatched...
                    </p>
                  </div>
                )}

                {(em.status === "dispatched" || em.status === "en_route") && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-3">
                    <p className="text-blue-300 text-sm font-medium">
                      🚑 Ambulance is on the way!
                    </p>
                    {em.eta_minutes && (
                      <p className="text-blue-200 text-lg font-bold mt-1">
                        ETA: {em.eta_minutes} minutes
                      </p>
                    )}
                  </div>
                )}

                {em.status === "completed" && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-3">
                    <p className="text-green-300 text-sm">
                      ✅ Emergency resolved
                    </p>
                  </div>
                )}

                <p className="text-slate-500 text-xs">
                  ID: {em.id.slice(0, 8)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;