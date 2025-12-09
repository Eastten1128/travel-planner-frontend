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


export const getPlannerByNo = async (plannerNo) => {
  if (plannerNo === null || plannerNo === undefined) {
    throw new Error("plannerNo가 필요합니다.");
  }

  const response = await client.get(`/api/planners/${plannerNo}`);
  return response.data; // PlannerResponse 하나
};


export const getPlannerById = async (plannerNo) => {
  const response = await client.get(`/api/planners/${plannerNo}`);
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

export const deletePlanner = (plannerNo) =>
  client.delete(`/api/planners/${plannerNo}`);


