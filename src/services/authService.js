import { createApiClient } from "./apiClient";

const authService = {
  async getMe(accessToken) {
    const client = createApiClient(accessToken);
    const { data } = await client.get("/api/v1/users/me");
    return data;
  },

  async updateProfile(accessToken, payload) {
    const client = createApiClient(accessToken);
    const { data } = await client.patch(`/api/v1/users/${payload.id}`, payload);
    return data;
  },
};

export default authService;
