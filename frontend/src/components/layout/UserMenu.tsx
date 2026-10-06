import {
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export function UserMenu() {
  const navigate = useNavigate();

  const {
    user,
    clearAuth,
  } = useAuthStore();

  const [open, setOpen] =
    useState(false);

  const displayName =
    user?.full_name ||
    user?.email ||
    "User";

  const handleLogout = () => {
    clearAuth();
    setOpen(false);
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {displayName
            .charAt(0)
            .toUpperCase()}
        </span>

        <span className="hidden max-w-[160px] truncate text-sm font-medium text-slate-700 sm:block">
          {displayName}
        </span>

        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setOpen(false)
            }
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              {user?.email && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {user.email}
                </p>
              )}
            </div>

            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <User className="h-4 w-4" />
                Profile / Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}