"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConcentrationReport, getConcentration } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import Spinner from "@/components/ui/Spinner";

export default function DashboardPage() {
  const router = useRouter();
  const { isStaff, isAdmin, loading } = useAuth();
  const { dataVersion } = useModals();
  const [report, setReport] = useState<ConcentrationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isStaff) {
      router.replace("/my-requests");
    }
  }, [loading, isStaff, router]);

  const load = useCallback(() => {
    getConcentration()
      .then(setReport)
      .catch((caught) =>
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Falha ao carregar o dashboard",
        ),
      );
  }, []);

  useEffect(() => {
    if (isStaff) {
      load();
    }
  }, [load, dataVersion, isStaff]);

  if (!isStaff) {
    return <Spinner fullscreen />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!report) {
    return <Spinner />;
  }

  return <AdminDashboard report={report} isAdmin={isAdmin} />;
}
