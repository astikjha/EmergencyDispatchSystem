import { useState } from "react";
import api from "../api/api";

function CreateEmergency() {
  // Form data — all fields the user fills in
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_age: "",
    symptoms: "",
    emergency_type: "",
    latitude: "",
    longitude: "",
  });

  // Stores the response after emergency is created
  const [createdEmergency, setCreatedEmergency] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Updates formData whenever user types in any input field
  // e.target.name matches the field name, e.target.value is what they typed
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Called when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // stops page from refreshing (default browser behavior)
    setLoading(true);
    try {
      const response = await api.post("/emergencies/", {
        ...formData,
        patient_age: parseInt(formData.patient_age),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      setCreatedEmergency(response.data);
      setDispatchResult(null); // reset any previous dispatch result
    } catch (error) {
      console.error("Error creating emergency:", error);
      alert("Failed to create emergency. Check console for details.");
    }
    setLoading(false);
  };

  // Called when "Dispatch Now" button is clicked
  const handleDispatch = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/emergencies/${createdEmergency.id}/dispatch`
      );
      setDispatchResult(response.data);
    } catch (error) {
      console.error("Error dispatching:", error);
      alert(error.response?.data?.detail || "Dispatch failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Report Emergency
      </h1>

      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Patient Name</label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Patient Age</label>
            <input
              type="number"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Symptoms</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
              placeholder="e.g. chest pain, shortness of breath"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Emergency Type</label>
            <input
              type="text"
              name="emergency_type"
              value={formData.emergency_type}
              onChange={handleChange}
              required
              placeholder="e.g. cardiac, trauma, accident"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                placeholder="25.5941"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                placeholder="85.1300"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Report Emergency"}
          </button>
        </form>

        {/* Show after emergency is created */}
        {createdEmergency && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-medium">Emergency created successfully!</p>
            <p className="text-sm text-gray-600">ID: {createdEmergency.id}</p>
            <p className="text-sm text-gray-600">
              Predicted Severity: <span className="font-semibold uppercase">{createdEmergency.severity}</span>
            </p>
            <button
              onClick={handleDispatch}
              disabled={loading}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Dispatching..." : "Dispatch Now"}
            </button>
          </div>
        )}

        {/* Show after dispatch is successful */}
        {dispatchResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="font-medium text-green-800">Dispatched!</p>
            <p className="text-sm">Ambulance: {dispatchResult.ambulance}</p>
            <p className="text-sm">Hospital: {dispatchResult.hospital}</p>
            <p className="text-sm">
              ETA: {dispatchResult.route.eta_minutes} minutes
            </p>
            <p className="text-sm">
              Distance: {dispatchResult.route.total_distance_km} km
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateEmergency;