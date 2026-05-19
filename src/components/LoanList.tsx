import { Eye, Inbox, Pencil, Trash2 } from "lucide-react";
import { LoanResource } from "@/lib/api";
import { stateName } from "@/lib/brazilianStates";
import { productLabel } from "@/lib/loanProducts";
import { formatBRLFromCents, formatDate } from "@/lib/formatters";

interface LoanListProps {
  loans: LoanResource[];
  onView: (loan: LoanResource) => void;
  onEdit?: (loan: LoanResource) => void;
  onDelete?: (loan: LoanResource) => void;
}

const firstName = (loan: LoanResource): string =>
  loan.requester ? loan.requester.name.trim().split(/\s+/)[0] : "—";

export default function LoanList({
  loans,
  onView,
  onEdit,
  onDelete,
}: LoanListProps) {
  if (loans.length === 0) {
    return (
      <div className="card cl-card">
        <div className="card-body text-center text-secondary py-5">
          <Inbox size={40} className="mb-2 opacity-50" />
          <p className="mb-0">Nenhum empréstimo registrado ainda.</p>
          <p className="small mb-0">
            Use “Novo empréstimo” no menu lateral para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card cl-card">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 cl-table-cards">
          <thead>
            <tr className="text-secondary small text-uppercase">
              <th className="ps-3">Estado</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Produto</th>
              <th>Origem</th>
              <th>Aprovado por</th>
              <th>Criado em</th>
              <th className="text-end pe-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="ps-3" data-label="Estado">
                  <span>
                    <strong>{loan.uf}</strong>
                    <span className="text-secondary small ms-2 d-none d-md-inline">
                      {stateName(loan.uf)}
                    </span>
                  </span>
                </td>
                <td data-label="Cliente">
                  {loan.requester ? (
                    firstName(loan)
                  ) : (
                    <span className="text-secondary">—</span>
                  )}
                </td>
                <td className="fw-semibold" data-label="Valor">
                  {formatBRLFromCents(loan.amountCents)}
                </td>
                <td data-label="Produto">
                  {loan.productType ? (
                    <span className="badge text-bg-light">
                      {productLabel(loan.productType)}
                    </span>
                  ) : (
                    <span className="text-secondary">—</span>
                  )}
                </td>
                <td data-label="Origem">
                  {loan.forced ? (
                    <span className="badge text-bg-danger">Forçado</span>
                  ) : (
                    <span className="badge text-bg-light">Normal</span>
                  )}
                </td>
                <td data-label="Aprovado por">
                  {loan.approvedBy ? (
                    <span>
                      <span>{loan.approvedBy}</span>
                      {loan.approvedAt && (
                        <span className="text-secondary small d-block">
                          {formatDate(loan.approvedAt)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-secondary">—</span>
                  )}
                </td>
                <td className="text-secondary" data-label="Criado em">
                  {formatDate(loan.createdAt)}
                </td>
                <td className="text-end pe-3 cl-cell-actions">
                  <div className="d-flex gap-1 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => onView(loan)}
                      aria-label="Ver detalhes do empréstimo"
                    >
                      <Eye size={15} />
                    </button>
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => onEdit(loan)}
                        aria-label="Editar empréstimo"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(loan)}
                        aria-label="Remover empréstimo"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
