"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import {
  approveRequest,
  listRequests,
  LoanPage,
  LoanResource,
  rejectRequest,
} from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";
import { useToast } from "@/context/ToastContext";
import { stateName } from "@/lib/brazilianStates";
import { productLabel } from "@/lib/loanProducts";
import {
  formatBRLFromCents,
  formatDate,
  formatPercent,
} from "@/lib/formatters";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";

const PAGE_SIZE = 8;

interface ForceTarget {
  request: LoanResource;
  uf: string;
  projectedShareUf: number;
  limit: number;
}

export default function RequestsPage() {
  const router = useRouter();
  const { isStaff, isAdmin, loading } = useAuth();
  const { dataVersion } = useModals();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LoanPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<LoanResource | null>(null);
  const [forceTarget, setForceTarget] = useState<ForceTarget | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LoanResource | null>(null);

  useEffect(() => {
    if (!loading && !isStaff) {
      router.replace("/my-requests");
    }
  }, [loading, isStaff, router]);

  const load = useCallback((targetPage: number) => {
    listRequests(targetPage, PAGE_SIZE)
      .then(setData)
      .catch((caught) =>
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Falha ao carregar solicitações",
        ),
      );
  }, []);

  useEffect(() => {
    if (isStaff) {
      load(page);
    }
  }, [load, page, dataVersion, isStaff]);

  if (!isStaff) {
    return <Spinner fullscreen />;
  }

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;

  const reload = () => {
    if (data && data.items.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      load(page);
    }
  };

  const runApprove = async (request: LoanResource, force: boolean) => {
    setBusyId(request.id);
    setApproveTarget(null);
    try {
      await approveRequest(request.id, force);
      setForceTarget(null);
      toast.success(
        force
          ? `Solicitação de ${request.uf} aprovada (forçada acima do limite).`
          : `Solicitação de ${request.uf} aprovada com sucesso.`,
      );
      reload();
    } catch (caught) {
      const isConcentrationBreach =
        caught instanceof ApiError &&
        caught.status === 422 &&
        caught.errors?.code === "CONCENTRATION_LIMIT_EXCEEDED";

      if (isConcentrationBreach && isAdmin && !force) {
        const apiError = caught as ApiError;
        setForceTarget({
          request,
          uf: String(apiError.errors?.uf),
          projectedShareUf: Number(apiError.errors?.projectedShareUf),
          limit: Number(apiError.errors?.limit),
        });
      } else if (isConcentrationBreach && !isAdmin) {
        toast.error(
          `${(caught as ApiError).message}. Apenas um administrador do sistema pode aprovar ` +
            "um empréstimo acima do limite de concentração.",
        );
      } else {
        toast.error(
          caught instanceof ApiError
            ? caught.message
            : "Falha ao aprovar solicitação",
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const runReject = async () => {
    if (!rejectTarget) {
      return;
    }
    setBusyId(rejectTarget.id);
    try {
      const uf = rejectTarget.uf;
      await rejectRequest(rejectTarget.id);
      setRejectTarget(null);
      toast.success(`Solicitação de ${uf} recusada.`);
      reload();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Falha ao recusar solicitação",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <span className="text-secondary small">
        {data ? `${data.total} solicitação(ões) em análise` : " "}
      </span>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!data && !error && <Spinner />}

      {data && data.items.length === 0 && (
        <div className="card cl-card">
          <div className="card-body text-center text-secondary py-5">
            <Inbox size={40} className="mb-2 opacity-50" />
            <p className="mb-0">Nenhuma solicitação em análise.</p>
          </div>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="card cl-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 cl-table-cards">
              <thead>
                <tr className="text-secondary small text-uppercase">
                  <th className="ps-3">Estado</th>
                  <th>Valor</th>
                  <th>Serviço</th>
                  <th>Recebida em</th>
                  <th className="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((request) => (
                  <tr key={request.id}>
                    <td className="ps-3" data-label="Estado">
                      <span>
                        <strong>{request.uf}</strong>
                        <span className="text-secondary small ms-2 d-none d-md-inline">
                          {stateName(request.uf)}
                        </span>
                      </span>
                    </td>
                    <td className="fw-semibold" data-label="Valor">
                      {formatBRLFromCents(request.amountCents)}
                    </td>
                    <td data-label="Serviço">
                      <span className="badge text-bg-light">
                        {productLabel(request.productType)}
                      </span>
                    </td>
                    <td className="text-secondary" data-label="Recebida em">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="text-end pe-3 cl-cell-actions">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={busyId === request.id}
                          onClick={() => setApproveTarget(request)}
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={busyId === request.id}
                          onClick={() => setRejectTarget(request)}
                        >
                          Recusar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.total > data.pageSize && (
        <div className="d-flex justify-content-between align-items-center">
          <span className="small text-secondary">
            Página {data.page} de {totalPages}
          </span>
          <div className="d-flex gap-1">
            <button
              type="button"
              className="btn btn-sm btn-light d-flex align-items-center gap-1"
              disabled={data.page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light d-flex align-items-center gap-1"
              disabled={data.page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={approveTarget !== null}
        title="Aprovar solicitação"
        variant="primary"
        confirmLabel="Aprovar"
        loading={busyId !== null}
        message={
          approveTarget && (
            <>
              Aprovar a solicitação de{" "}
              <strong>{formatBRLFromCents(approveTarget.amountCents)}</strong>{" "}
              em {stateName(approveTarget.uf)}? A validação de concentração da
              carteira será executada e, se aprovada, o empréstimo passa a
              integrar a carteira.
            </>
          )
        }
        onCancel={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && runApprove(approveTarget, false)}
      />

      <ConfirmDialog
        open={forceTarget !== null}
        title="Limite de concentração ultrapassado"
        variant="danger"
        confirmLabel="Forçar aprovação"
        loading={busyId !== null}
        message={
          forceTarget && (
            <>
              Aprovar esta solicitação levaria{" "}
              <strong>{stateName(forceTarget.uf)}</strong> a{" "}
              <strong>{formatPercent(forceTarget.projectedShareUf)}</strong> da
              carteira, acima do limite de{" "}
              <strong>{formatPercent(forceTarget.limit)}</strong>. Como
              administrador, você pode forçar a aprovação — o empréstimo ficará
              marcado como <strong>forçado</strong>.
            </>
          )
        }
        onCancel={() => setForceTarget(null)}
        onConfirm={() => forceTarget && runApprove(forceTarget.request, true)}
      />

      <ConfirmDialog
        open={rejectTarget !== null}
        title="Recusar solicitação"
        variant="danger"
        confirmLabel="Recusar"
        loading={busyId !== null}
        message={
          rejectTarget && (
            <>
              A solicitação de{" "}
              <strong>{formatBRLFromCents(rejectTarget.amountCents)}</strong> em{" "}
              {rejectTarget.uf} será recusada. O cliente verá o resultado no
              painel dele.
            </>
          )
        }
        onCancel={() => setRejectTarget(null)}
        onConfirm={runReject}
      />
    </div>
  );
}
