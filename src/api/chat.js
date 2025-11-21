import axios from "axios";

const chatApi = axios.create({
  baseURL: "http://localhost:8080/api/chat",
});

// JWT 자동 포함
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendChatMessage = async (message) => {
  const response = await chatApi.post("/travel", {
    message: message,
  });
  return response.data; // ChatResponseDTO { answer: "..." }
};

export default chatApi;
