import api from "@/utils/api";
import { AdminLoginData, AdminRegisterData, AdminResponse } from "@/types/auth";

export const authApi = {
  // Register a new admin
  register: async (data: AdminRegisterData): Promise<AdminResponse> => {
    const response = await api.post<AdminResponse>("/api/admin/register", data);
    return response.data;
  },

  // Login admin
  login: async (data: AdminLoginData): Promise<AdminResponse> => {
    const response = await api.post<AdminResponse>("/api/admin/login", data);
    return response.data;
  },

  // Get admin profile
  getProfile: async (id: string): Promise<AdminResponse> => {
    const response = await api.get<AdminResponse>(`/api/admin/profile/${id}`);
    return response.data;
  },
};
