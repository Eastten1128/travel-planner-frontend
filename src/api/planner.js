import client from "./client";

export const createPlanner = async ({
  plannerTitle,
  plannerStartDay,
  plannerEndDay,
}) => {
  const response = await client.post("/api/planners", {
    plannerTitle,
    plannerStartDay,
    plannerEndDay,
  });
  return response.data;
};

export const getMyPlanners = async (options = {}) => {
  const { email, ...rest } = options || {};

  try {
    const response = await client.get("/api/planners/me", { params: rest });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (email && status && [400, 404, 405].includes(status)) {
      const fallbackResponse = await client.get("/api/planners", {
        params: { email, ...rest },
      });
      return fallbackResponse.data;
    }
    throw error;
  }
};

export const getPlannerById = async (plannerNo) => {
  const response = await client.get(`/api/planners/${plannerNo}`);
  return response.data;
};
