import axios from "axios";

// Base URL of our FastAPI backend
const API_BASE_URL = "http://127.0.0.1:8000";

// Create an axios instance with the base URL pre-configured
// So we don't have to type the full URL every time
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;