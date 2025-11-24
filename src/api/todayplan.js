import client from "./client";

//씨발
export const createTodayPlan = async (payload) => {
  const response = await client.post("/api/today-plans", payload);
  return response.data;
};

export const updateTodayPlan = async (todayPlanNo, payload) => {
  const response = await client.put(`/api/today-plans/${todayPlanNo}`, payload);
  return response.data;
};

export const deleteTodayPlan = async (todayPlanNo) => {
  await client.delete(`/api/today-plans/${todayPlanNo}`);
};

export const getTodayPlansByPlanner = async (plannerNo) => {
  const response = await client.get("/api/today-plans", {
    params: { plannerNo },
  });
  return response.data;
};