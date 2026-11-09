"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, LoginCredentials, RegisterData, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session from HTTP-only cookie on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include", // Send HTTP-only session cookie
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Real API login call (Claude's FastAPI backend)
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return { success: true };
        }
        return { success: false, error: "Invalid response received from authentication service." };
      }

      if (res.status === 401 || res.status === 400) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || "Invalid email or password. Access denied." };
      }

      if (res.status === 404) {
        return {
          success: false,
          error: "Backend Auth Service Pending: FastAPI endpoint POST /api/v1/auth/login is currently being implemented by Claude.",
        };
      }

      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.detail || `Authentication failed with status HTTP ${res.status}` };
    } catch {
      return {
        success: false,
        error: "Unable to reach FastAPI backend (http://127.0.0.1:8000). Please ensure the backend server is running.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Real API registration call (Claude's FastAPI backend)
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: data.full_name.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
      });

      if (res.ok) {
        return { success: true };
      }

      if (res.status === 404) {
        return {
          success: false,
          error: "Backend Auth Service Pending: FastAPI endpoint POST /api/v1/auth/register is currently being implemented by Claude.",
        };
      }

      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.detail || `Registration failed with status HTTP ${res.status}` };
    } catch {
      return {
        success: false,
        error: "Unable to reach FastAPI backend (http://127.0.0.1:8000). Please ensure the backend server is running.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Real API logout call
  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

