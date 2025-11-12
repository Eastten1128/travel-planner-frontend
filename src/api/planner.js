import client from "./client";

export const createPlanner = async ({
  userId,
  plannerTitle,
  plannerStartday,
  plannerEndday,
}) => {
  const response = await client.post("/api/planners", {
    userId,
    plannerTitle,
    plannerStartday,
    plannerEndday,
  });
  return response.data;
};

export const getMyPlanners = async (options = {}) => {
  const { userId, ...rest } = options || {};
  const params = { ...rest };

  if (userId !== undefined) {
    params.userId = userId;
  }

  const response = await client.get("/api/planners", { params });
  return response.data;
};

export const getPlannerById = async (plannerNo) => {
  const response = await client.get(`/api/planners/${plannerNo}`);
  return response.data;
};
