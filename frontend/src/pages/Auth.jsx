import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { saveAuth } from "../auth/authUtils";

function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login"); // "login" or "register"
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    full_name: "",
    age: "",
    symptoms: "",
    latitude: "",
    longitude: "",
    total_beds: "",
    vehicle_number: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", loginData);
      saveAuth(res.data);
      // Redirect based on role
      navigate(`/dashboard/${res.data.role}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Build payload based on selected role
      let payload = {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
      };

      if (role === "patient") {
        payload = {
          ...payload,
          age: parseInt(registerData.age),
          symptoms: registerData.symptoms || "",
          latitude: parseFloat(registerData.latitude),
          longitude: parseFloat(registerData.longitude),
        };
      } else if (role === "hospital") {
        payload = {
          ...payload,
          latitude: parseFloat(registerData.latitude),
          longitude: parseFloat(registerData.longitude),
          total_beds: parseInt(registerData.total_beds),
        };
      } else if (role === "driver") {
        payload = {
          ...payload,
          vehicle_number: registerData.vehicle_number,
          latitude: parseFloat(registerData.latitude),
          longitude: parseFloat(registerData.longitude),
        };
      }

      await api.post(`/auth/register/${role}`, payload);
      setTab("login");
      setError("");
      alert("Registration successful! Please login.");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🚑</span>
            <h1 className="text-3xl font-bold text-white">EmergencyDispatch</h1>
          </div>
          <p className="text-slate-400">AI-Powered Emergency Response System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">

          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "login"
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "register"
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role selector */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Register as</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="hospital">Hospital</option>
                    <option value="driver">Ambulance Driver</option>
                  </select>
                </div>

                {/* Common fields */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    {role === "hospital" ? "Hospital Name" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={registerData.full_name}
                    onChange={handleRegisterChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Patient specific fields */}
                {role === "patient" && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={registerData.age}
                        onChange={handleRegisterChange}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={registerData.latitude}
                          onChange={handleRegisterChange}
                          required
                          placeholder="25.5941"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={registerData.longitude}
                          onChange={handleRegisterChange}
                          required
                          placeholder="85.1300"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Hospital specific fields */}
                {role === "hospital" && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Total Beds</label>
                      <input
                        type="number"
                        name="total_beds"
                        value={registerData.total_beds}
                        onChange={handleRegisterChange}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={registerData.latitude}
                          onChange={handleRegisterChange}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={registerData.longitude}
                          onChange={handleRegisterChange}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Driver specific fields */}
                {role === "driver" && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicle_number"
                        value={registerData.vehicle_number}
                        onChange={handleRegisterChange}
                        required
                        placeholder="AMB-001"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={registerData.latitude}
                          onChange={handleRegisterChange}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={registerData.longitude}
                          onChange={handleRegisterChange}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          Emergency Dispatch System — MNIT Jaipur
        </p>
      </div>
    </div>
  );
}

export default Auth;