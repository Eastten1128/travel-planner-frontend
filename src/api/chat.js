// src/api/chat.js

import axios from "axios";

const chatApi = axios.create({
  baseURL: "https://sw6885travelplannerfin.uk/api/chat",
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
  // 백엔드: ChatResponseDTO { speech, places }
  return response.data;
};

export const createAutoPlan = async (message) => {
  const response = await chatApi.post("/auto-plan", {
    message,
  });
  // ✅ 이제 백엔드가 PlannerResponse 하나를 바로 내려줌
  // { plannerNo, userid, plannerStartDate, plannerEndDate, plannerTitle }
  return response.data;
};

export default chatApi;