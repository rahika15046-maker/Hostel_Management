import axios from 'axios';

// Normalise the API base URL.
// VITE_API_URL must include the /api prefix, e.g.:
//   https://hostel-awdt.onrender.com/api
// If the env var is accidentally set without /api we append it automatically.
function resolveBaseURL() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

const api = axios.create({ baseURL: resolveBaseURL() });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('hx_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const errMsg = (e, fallback = 'Something went wrong. Please try again.') =>
  e?.response?.data?.message || fallback;
export default api;
