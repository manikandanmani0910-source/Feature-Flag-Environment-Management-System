import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  getCurrentUser,
  login,
  logout,
} from "../services/auth/authService";

import type {
  LoginRequest,
} from "../types/auth";

import { useAuthStore } from "../store/authStore";

export function useCurrentUser() {
  const setUser =
    useAuthStore(
      (state) => state.setUser,
    );

  const setLoading =
    useAuthStore(
      (state) => state.setLoading,
    );

  return useQuery({
    queryKey: ["current-user"],

    queryFn: async () => {
      setLoading(true);

      try {
        const user =
          await getCurrentUser();

        setUser(user);

        return user;
      } finally {
        setLoading(false);
      }
    },

    retry: false,
  });
}

export function useLogin() {
  const setAuth =
    useAuthStore(
      (state) => state.setAuth,
    );

  return useMutation({
    mutationFn: (
      payload: LoginRequest,
    ) => login(payload),

    onSuccess: (data) => {
      if (data.user) {
        setAuth(
          data.user,
          data.access_token,
        );
      }
    },
  });
}

export function useLogout() {
  const clearAuth =
    useAuthStore(
      (state) => state.clearAuth,
    );

  return useMutation({
    mutationFn: logout,

    onSettled: () => {
      clearAuth();
    },
  });
}