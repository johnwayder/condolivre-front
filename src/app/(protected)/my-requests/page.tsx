"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, PlusCircle } from "lucide-react";
import { listMyLoans, LoanResource } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";
import { stateName } from "@/lib/brazilianStates";
import { productLabel } from "@/lib/loanProducts";
import { formatBRLFromCents, formatDate } from "@/lib/formatters";
import LoanStatusBadge from "@/components/LoanStatusBadge";
import Spinner from "@/components/ui/Spinner";

export default function MyRequestsPage() {
  const router = useRouter();
  const { isClient, isStaff, loading } = useAuth();
  const { openNewRequest, dataVersion } = useModals();
  const [requests, setRequests] = useState<LoanResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isStaff) {
      router.replace("/dashboard");
    }
  }, [loading, isStaff, router]);

  const load = useCallback(() => {
    listMyLoans()
      .then(setRequests)
      .catch((caught) =>
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Falha ao carregar solicitações",
        ),
      );
  }, []);

  useEffect(() => {
    if (!isStaff) {
      load();
    }
  }, [load, dataVersion, isStaff]);

  if (isStaff && !isClient) {
    return <Spinner fullscreen />;
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span className="text-secondary small">
          {requests ? `${requests.length} solicitação(ões)` : " "}
        </span>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={openNewRequest}
        >
          <PlusCircle size={18} />
          Nova solicitação
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!requests && !error && <Spinner />}

      {requests && requests.length === 0 && (
        <div className="card cl-card">
          <div className="card-body text-center text-secondary py-5">
            <FileText size={40} className="mb-2 opacity-50" />
            <p className="mb-0">Você ainda não tem solicitações.</p>
            <p className="small mb-0">
              Use “Nova solicitação” para contratar um serviço.
            </p>
          </div>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="card cl-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 cl-table-cards">
              <thead>
                <tr className="text-secondary small text-uppercase">
                  <th className="ps-3">Serviço</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Status</th>
                  <th className="pe-3">Solicitada em</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="ps-3 fw-semibold" data-label="Serviço">
                      {productLabel(request.productType)}
                    </td>
                    <td data-label="Valor">
                      {formatBRLFromCents(request.amountCents)}
                    </td>
                    <td data-label="Estado">
                      <span>
                        {request.uf}
                        <span className="text-secondary small ms-2 d-none d-md-inline">
                          {stateName(request.uf)}
                        </span>
                      </span>
                    </td>
                    <td data-label="Status">
                      <LoanStatusBadge status={request.status} />
                    </td>
                    <td
                      className="text-secondary pe-3"
                      data-label="Solicitada em"
                    >
                      {formatDate(request.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
