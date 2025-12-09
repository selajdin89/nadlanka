// API Configuration
// In production, this will use the environment variable or default to relative paths
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Configure axios default base URL if API_BASE_URL is set
import axios from "axios";

if (API_BASE_URL) {
	axios.defaults.baseURL = API_BASE_URL;
}

export default API_BASE_URL;

