"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/providers/AuthProvider";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-zinc-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#86733B] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Always render the bare layout for the login page
  if (pathname === "/login") {
    return <main className="flex-1 w-full bg-zinc-50">{children}</main>;
  }

  // While loading, we don't know if the user is authenticated yet — show spinner
  // (isLoading check is above so this handles the authenticated check below)

  // If not authenticated and not on login page, render nothing while the
  // redirect from checkAuth is in flight. Prevents dashboard flash.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50 w-full md:ml-64 transition-all duration-300">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </>
  );
}
