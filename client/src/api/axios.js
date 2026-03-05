import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

export default api;
