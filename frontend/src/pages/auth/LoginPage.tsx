import { useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useLogin } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../utils/errorHandler";

export function LoginPage() {
  const navigate = useNavigate();

  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated,
    );

  const loginMutation = useLogin();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // If already logged in, go directly to dashboard
  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      const result =
        await loginMutation.mutateAsync({
          email,
          password,
        });

      if (result) {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch {
      // Error is already displayed through loginMutation.isError
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              FF
            </div>

            <h1 className="text-2xl font-bold text-slate-950">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to the Feature Flag Management System.
            </p>
          </div>

          {loginMutation.isError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getErrorMessage(
                loginMutation.error,
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                autoComplete="username"
                required
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={
                loginMutation.isPending
              }
              className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}