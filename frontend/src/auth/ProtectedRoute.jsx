import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./authUtils";

function ProtectedRoute({ children, allowedRoles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const role = getRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Wrong role — redirect to their correct dashboard
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  return children;
}

export default ProtectedRoute;