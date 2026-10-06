import { create } from "zustand";
import type { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (
    user: AuthUser,
    accessToken: string,
  ) => void;

  setUser: (
    user: AuthUser | null,
  ) => void;

  setLoading: (
    loading: boolean,
  ) => void;

  clearAuth: () => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    accessToken:
      localStorage.getItem("access_token"),

    isAuthenticated:
      Boolean(
        localStorage.getItem("access_token"),
      ),

    // Start as false so the app does not remain
    // permanently stuck on "Loading..."
    isLoading: false,

    setAuth: (
      user,
      accessToken,
    ) => {
      localStorage.setItem(
        "access_token",
        accessToken,
      );

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    setUser: (user) => {
      set({
        user,
        isAuthenticated:
          Boolean(user),
        isLoading: false,
      });
    },

    setLoading: (loading) => {
      set({
        isLoading: loading,
      });
    },

    clearAuth: () => {
      localStorage.removeItem(
        "access_token",
      );

      localStorage.removeItem(
        "refresh_token",
      );

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },
  }));