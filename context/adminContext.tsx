"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/api/auth";
import { AdminLoginData, AdminRegisterData } from "@/types/auth";

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  login: (
    data: AdminLoginData
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: AdminRegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // Load admin from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        console.error("Failed to parse admin data:", error);
        localStorage.removeItem("adminData");
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    data: AdminLoginData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(data);

      if (response.success && response.data) {
        setAdmin(response.data);
        localStorage.setItem("adminData", JSON.stringify(response.data));
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "An error occurred during login",
      };
    }
  };

  const register = async (
    data: AdminRegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        // Optionally auto-login after registration
        setAdmin(response.data);
        localStorage.setItem("adminData", JSON.stringify(response.data));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "An error occurred during registration",
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("adminData");
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
