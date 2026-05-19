"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ModalsProvider } from "@/context/ModalsContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Spinner from "@/components/ui/Spinner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <Spinner fullscreen />;
  }

  return (
    <ModalsProvider>
      <div className="cl-layout">
        <div
          className={`cl-sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        <div className="cl-content">
          <Topbar onMenu={() => setSidebarOpen(true)} />
          <div className="cl-page">{children}</div>
        </div>
      </div>
    </ModalsProvider>
  );
}
