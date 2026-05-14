import axios from "axios";

const api = axios.create({
  baseURL: window.location.host.includes(
    "doctorbookingclient-production.up.railway.app",
  )
    ? "https://doctorbookingapi-production.up.railway.app/api"
    : "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
