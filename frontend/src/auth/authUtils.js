import { jwtDecode } from "jwt-decode";

// Save token and user info after login
export const saveAuth = (tokenData) => {
  localStorage.setItem("token", tokenData.access_token);
  localStorage.setItem("role", tokenData.role);
  localStorage.setItem("user_id", tokenData.user_id);
  localStorage.setItem("full_name", tokenData.full_name);
};

// Get stored token
export const getToken = () => localStorage.getItem("token");

// Get stored role
export const getRole = () => localStorage.getItem("role");

// Get full name
export const getFullName = () => localStorage.getItem("full_name");

// Check if user is logged in
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    // Check token hasn't expired
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Clear everything on logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("full_name");
};

// Get auth header for Axios requests
export const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});