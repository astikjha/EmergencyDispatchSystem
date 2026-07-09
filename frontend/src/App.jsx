import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./auth/authUtils";
import Auth from "./pages/Auth";
import ProtectedRoute from "./auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CreateEmergency from "./pages/CreateEmergency";
import AmbulanceTracking from "./pages/AmbulanceTracking";
import HospitalView from "./pages/HospitalView";

// Placeholder dashboards — we'll build these next
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import HospitalDashboard from "./pages/dashboards/HospitalDashboard";
import DriverDashboard from "./pages/dashboards/DriverDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — login/register */}
        <Route
          path="/"
          element={
            isLoggedIn()
              ? <Navigate to={`/dashboard/${getRole()}`} replace />
              : <Auth />
          }
        />

        {/* Role-based protected dashboards */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hospital"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/driver"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all — redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;