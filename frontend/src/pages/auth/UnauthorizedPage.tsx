import {
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <p className="mt-8 text-6xl font-bold tracking-tight text-slate-900">
          403
        </p>

        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Access denied
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          You do not have permission to access this
          resource. Contact an administrator if you
          believe this is incorrect.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/", {
              replace: true,
            })
          }
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>
    </div>
  );
}