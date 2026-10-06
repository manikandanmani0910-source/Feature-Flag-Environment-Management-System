import {
  Bell,
  Menu,
} from "lucide-react";

import { useUIStore } from "../../store/uiStore";

import { UserMenu } from "./UserMenu";

interface TopbarProps {
  title?: string;
}

export function Topbar({
  title = "Feature Flag Management",
}: TopbarProps) {
  const {
    toggleSidebar,
  } = useUIStore();

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-sm font-semibold text-slate-900">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <UserMenu />
      </div>
    </div>
  );
}