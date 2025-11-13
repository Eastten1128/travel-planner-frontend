import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}/oauth2/authorization/google`;
    }
    return Promise.reject(error);
  }
);

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
