import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean; userId?: string }>;
  register: (userData: { email: string; name: string; passwordHash: string }) => Promise<void>;
  verifyEmail: (userId: string, code: string) => Promise<void>;
  verify2FA: (userId: string, code: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("auth_token"),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const response = await apiRequest("GET", "/api/user/profile");
          const user = await response.json();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("auth_token");
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth().catch(error => {
      console.error("Unhandled auth initialization error:", error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, userId: data.userId };
    }

    localStorage.setItem("auth_token", data.token);
    setAuthState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    });

    return {};
  };

  const register = async (userData: { email: string; name: string; passwordHash: string }) => {
    await apiRequest("POST", "/api/auth/register", userData);
  };

  const verifyEmail = async (userId: string, code: string) => {
    await apiRequest("POST", "/api/auth/verify-email", { userId, code });
  };

  const verify2FA = async (userId: string, code: string) => {
    const response = await apiRequest("POST", "/api/auth/verify-2fa", { userId, code });
    const data = await response.json();

    localStorage.setItem("auth_token", data.token);
    setAuthState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await apiRequest("PATCH", "/api/user/profile", data);
    const updatedUser = await response.json();
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const contextValue = {
    ...authState,
    login,
    register,
    verifyEmail,
    verify2FA,
    logout,
    updateProfile,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}