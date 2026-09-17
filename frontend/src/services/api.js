import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('talentiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      } else if (error.response.status === 429) {
        errorMessage = 'AI service usage limit reached. Please check Gemini API quota or try again shortly.';
      } else if (error.response.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied. You do not have permission for this resource.';
      } else if (error.response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the TalentIQ backend server. Please verify it is running on http://localhost:8080.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.original = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
