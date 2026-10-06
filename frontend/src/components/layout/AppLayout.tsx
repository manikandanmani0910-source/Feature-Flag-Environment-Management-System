import type { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF7F9]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main application area */}
      <div className="min-h-screen pl-0 md:pl-64">

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default AppLayout;