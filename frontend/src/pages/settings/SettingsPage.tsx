import {
  Bell,
  Lock,
  Save,
  Settings,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { useAuthStore } from "../../store/authStore";

export function SettingsPage() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const [fullName, setFullName] =
    useState(
      user?.full_name ?? "",
    );

  const [email, setEmail] =
    useState(
      user?.email ?? "",
    );

  const [notifications, setNotifications] =
    useState(true);

  const [emailAlerts, setEmailAlerts] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const handleSave = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 text-left text-sm font-semibold text-white"
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Lock className="h-4 w-4" />
            Security
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4" />
            Preferences
          </button>
        </aside>

        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-sm font-bold text-slate-950">
                Profile Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Update the information associated with your account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full name
                </label>

                <input
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Username
                </label>

                <input
                  value={
                    user?.email ?? ""
                  }
                  disabled
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Account role
                </label>

                <input
                  value={
                    user?.role?.name ??
                    (user?.is_superuser
                      ? "Administrator"
                      : "User")
                  }
                  disabled
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              {saved ? (
                <p className="text-sm font-medium text-emerald-600">
                  Settings saved successfully.
                </p>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                Save changes
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-sm font-bold text-slate-950">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Configure how the platform communicates with you.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <SettingToggle
                title="Application notifications"
                description="Receive notifications about important feature flag and platform events."
                checked={notifications}
                onChange={setNotifications}
              />

              <SettingToggle
                title="Email alerts"
                description="Receive important system alerts and account notifications by email."
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Lock className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Password and authentication settings are managed through the account security service.
                </p>

                <button
                  type="button"
                  className="mt-4 inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Manage security
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked
            ? "bg-slate-900"
            : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
            checked
              ? "left-6"
              : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}