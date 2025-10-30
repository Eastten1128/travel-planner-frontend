import { createApiClient } from "./apiClient";

const plannerService = {
  async getPlanners(accessToken) {
    const client = createApiClient(accessToken);
    const { data } = await client.get("/api/v1/planners");
    return data;
  },

  async getPlanner(accessToken, plannerId) {
    const client = createApiClient(accessToken);
    const { data } = await client.get(`/api/v1/planners/${plannerId}`);
    return data;
  },

  async createPlanner(accessToken, payload) {
    const client = createApiClient(accessToken);
    const { data } = await client.post("/api/v1/planners", payload);
    return data;
  },

  async updatePlanner(accessToken, plannerId, payload) {
    const client = createApiClient(accessToken);
    const { data } = await client.patch(`/api/v1/planners/${plannerId}`, payload);
    return data;
  },

  async deletePlanner(accessToken, plannerId) {
    const client = createApiClient(accessToken);
    await client.delete(`/api/v1/planners/${plannerId}`);
  },

  async getTodayPlans(accessToken, plannerId) {
    const client = createApiClient(accessToken);
    const { data } = await client.get(`/api/v1/planners/${plannerId}/today-plans`);
    return data;
  },

  async createTodayPlan(accessToken, plannerId, payload) {
    const client = createApiClient(accessToken);
    const { data } = await client.post(`/api/v1/planners/${plannerId}/today-plans`, payload);
    return data;
  },

  async updateTodayPlan(accessToken, todayPlanId, payload) {
    const client = createApiClient(accessToken);
    const { data } = await client.patch(`/api/v1/today-plans/${todayPlanId}`, payload);
    return data;
  },

  async deleteTodayPlan(accessToken, todayPlanId) {
    const client = createApiClient(accessToken);
    await client.delete(`/api/v1/today-plans/${todayPlanId}`);
  },
};

export default plannerService;
