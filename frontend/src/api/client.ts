import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // IMPORTANT: This tells the browser to always attach the HttpOnly cookie
});

export default apiClient;
