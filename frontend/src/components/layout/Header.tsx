import { Menu } from "lucide-react";

import { useUIStore } from "../../store/uiStore";

import { UserMenu } from "./UserMenu";

export function Header() {
  const {
    toggleSidebar,
  } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block">
        <p className="text-sm font-semibold text-slate-900">
          Feature Flag Management
        </p>
      </div>

      <UserMenu />
    </header>
  );
}