"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FilterX, PlusCircle } from "lucide-react";
import { deleteLoan, listLoans, LoanPage, LoanResource } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";
import { useToast } from "@/context/ToastContext";
import { BRAZILIAN_STATES } from "@/lib/brazilianStates";
import { LOAN_PRODUCTS } from "@/lib/loanProducts";
import LoanList from "@/components/LoanList";
import LoanDetails from "@/components/LoanDetails";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoanForm from "@/components/LoanForm";
import Spinner from "@/components/ui/Spinner";

const PAGE_SIZE = 8;

export default function LoansPage() {
  const router = useRouter();
  const { isAdmin, isStaff, loading } = useAuth();
  const { openNewLoan, dataVersion } = useModals();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LoanPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<LoanResource | null>(null);
  const [viewing, setViewing] = useState<LoanResource | null>(null);
  const [deleting, setDeleting] = useState<LoanResource | null>(null);
  const [removing, setRemoving] = useState(false);

  const [ufFilter, setUfFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  const hasFilters = Boolean(
    ufFilter || productFilter || fromFilter || toFilter,
  );

  useEffect(() => {
    if (!loading && !isStaff) {
      router.replace("/my-requests");
    }
  }, [loading, isStaff, router]);

  const load = useCallback(
    (targetPage: number) => {
      listLoans(targetPage, PAGE_SIZE, {
        uf: ufFilter || undefined,
        productType: productFilter || undefined,
        createdFrom: fromFilter || undefined,
        createdTo: toFilter || undefined,
      })
        .then(setData)
        .catch((caught) =>
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Falha ao carregar empréstimos",
          ),
        );
    },
    [ufFilter, productFilter, fromFilter, toFilter],
  );

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

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const clearFilters = () => {
    setUfFilter("");
    setProductFilter("");
    setFromFilter("");
    setToFilter("");
    setPage(1);
  };

  const reload = () => {
    if (data && data.items.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      load(page);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    setRemoving(true);
    try {
      const uf = deleting.uf;
      await deleteLoan(deleting.id);
      setDeleting(null);
      reload();
      toast.success(`Empréstimo de ${uf} removido da carteira.`);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Falha ao remover empréstimo",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span className="text-secondary small">
          {data
            ? `${data.total} empréstimo(s)${hasFilters ? " no filtro" : " na carteira"}`
            : " "}
        </span>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={openNewLoan}
        >
          <PlusCircle size={18} />
          Novo empréstimo
        </button>
      </div>

      <div className="card cl-card">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-sm-6 col-lg-3">
              <label className="form-label small mb-1" htmlFor="filter-uf">
                Estado
              </label>
              <select
                id="filter-uf"
                className="form-select form-select-sm"
                value={ufFilter}
                onChange={(event) =>
                  changeFilter(() => setUfFilter(event.target.value))
                }
              >
                <option value="">Todos os estados</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.uf} — {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="form-label small mb-1" htmlFor="filter-product">
                Produto
              </label>
              <select
                id="filter-product"
                className="form-select form-select-sm"
                value={productFilter}
                onChange={(event) =>
                  changeFilter(() => setProductFilter(event.target.value))
                }
              >
                <option value="">Todos os produtos</option>
                {LOAN_PRODUCTS.map((product) => (
                  <option key={product.value} value={product.value}>
                    {product.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label small mb-1" htmlFor="filter-from">
                Criado de
              </label>
              <input
                id="filter-from"
                type="date"
                className="form-control form-control-sm"
                value={fromFilter}
                onChange={(event) =>
                  changeFilter(() => setFromFilter(event.target.value))
                }
              />
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label small mb-1" htmlFor="filter-to">
                Criado até
              </label>
              <input
                id="filter-to"
                type="date"
                className="form-control form-control-sm"
                value={toFilter}
                onChange={(event) =>
                  changeFilter(() => setToFilter(event.target.value))
                }
              />
            </div>
            <div className="col-sm-6 col-lg-2">
              <button
                type="button"
                className="btn btn-sm btn-light w-100 d-flex align-items-center justify-content-center gap-1"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                <FilterX size={15} />
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!data && !error && <Spinner />}

      {data && hasFilters && data.items.length === 0 ? (
        <div className="card cl-card">
          <div className="card-body text-center text-secondary py-5">
            Nenhum empréstimo encontrado para os filtros selecionados.
          </div>
        </div>
      ) : (
        data && (
          <>
            <LoanList
              loans={data.items}
              onView={setViewing}
              onEdit={isAdmin ? setEditing : undefined}
              onDelete={isAdmin ? setDeleting : undefined}
            />

            {data.total > data.pageSize && (
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-secondary">
                  Página {data.page} de {totalPages}
                </span>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-light d-flex align-items-center gap-1"
                    disabled={data.page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
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
          </>
        )
      )}

      <Modal
        open={viewing !== null}
        title="Detalhes do empréstimo"
        onClose={() => setViewing(null)}
      >
        {viewing && <LoanDetails loan={viewing} />}
      </Modal>

      <Modal
        open={editing !== null}
        title="Editar empréstimo"
        onClose={() => setEditing(null)}
      >
        {editing && (
          <LoanForm
            loan={editing}
            onSaved={() => {
              setEditing(null);
              load(page);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Remover empréstimo"
        variant="danger"
        confirmLabel="Remover"
        loading={removing}
        message={
          deleting && (
            <>
              O empréstimo de <strong>{deleting.uf}</strong> será removido da
              carteira. A concentração dos demais estados será recalculada. Esta
              ação não pode ser desfeita.
            </>
          )
        }
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
