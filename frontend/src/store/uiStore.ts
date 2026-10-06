import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  toggleSidebar: () => void;

  setSidebarCollapsed: (
    collapsed: boolean,
  ) => void;

  openMobileSidebar: () => void;

  closeMobileSidebar: () => void;

  toggleMobileSidebar: () => void;
}

export const useUIStore =
  create<UIState>((set) => ({
    sidebarCollapsed: false,
    mobileSidebarOpen: false,

    toggleSidebar: () =>
      set((state) => ({
        sidebarCollapsed:
          !state.sidebarCollapsed,
      })),

    setSidebarCollapsed: (
      collapsed,
    ) =>
      set({
        sidebarCollapsed:
          collapsed,
      }),

    openMobileSidebar: () =>
      set({
        mobileSidebarOpen: true,
      }),

    closeMobileSidebar: () =>
      set({
        mobileSidebarOpen: false,
      }),

    toggleMobileSidebar: () =>
      set((state) => ({
        mobileSidebarOpen:
          !state.mobileSidebarOpen,
      })),
  }));