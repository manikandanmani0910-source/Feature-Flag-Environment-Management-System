import {
  ArrowLeft,
  Home,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <span className="text-xl font-bold">
            FF
          </span>
        </div>

        <p className="mt-8 text-7xl font-bold tracking-tight text-slate-900">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          The page you are looking for does not exist,
          has been moved, or is no longer available.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/", {
                replace: true,
              })
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}