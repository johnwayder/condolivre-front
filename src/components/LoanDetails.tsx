import { ReactNode } from "react";
import { LoanResource } from "@/lib/api";
import { stateName } from "@/lib/brazilianStates";
import { productLabel } from "@/lib/loanProducts";
import { formatBRLFromCents, formatDate } from "@/lib/formatters";
import LoanStatusBadge from "@/components/LoanStatusBadge";

interface LoanDetailsProps {
  loan: LoanResource;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
      <span className="text-secondary small">{label}</span>
      <span className="text-end fw-medium">{children}</span>
    </div>
  );
}

export default function LoanDetails({ loan }: LoanDetailsProps) {
  const { requester } = loan;

  return (
    <div className="d-flex flex-column gap-4">
      <section>
        <h3 className="h6 fw-bold text-uppercase text-secondary mb-2">
          Empréstimo
        </h3>
        <DetailRow label="Estado">
          {loan.uf} — {stateName(loan.uf)}
        </DetailRow>
        <DetailRow label="Valor">
          {formatBRLFromCents(loan.amountCents)}
        </DetailRow>
        <DetailRow label="Produto de crédito">
          {loan.productType ? productLabel(loan.productType) : "Não informado"}
        </DetailRow>
        <DetailRow label="Situação">
          <LoanStatusBadge status={loan.status} />
        </DetailRow>
        <DetailRow label="Origem">
          {loan.forced ? (
            <span className="badge text-bg-danger">
              Forçado acima do limite
            </span>
          ) : (
            <span className="badge text-bg-light">Dentro do limite</span>
          )}
        </DetailRow>
        <DetailRow label="Aprovado por">{loan.approvedBy ?? "—"}</DetailRow>
        {loan.approvedAt && (
          <DetailRow label="Aprovado em">
            {formatDate(loan.approvedAt)}
          </DetailRow>
        )}
        <DetailRow label="Criado em">{formatDate(loan.createdAt)}</DetailRow>
      </section>

      <section>
        <h3 className="h6 fw-bold text-uppercase text-secondary mb-2">
          Cliente
        </h3>
        {requester ? (
          <>
            <DetailRow label="Nome">{requester.name}</DetailRow>
            <DetailRow label="E-mail">{requester.email}</DetailRow>
            <DetailRow label="Perfil">
              <span className="badge text-bg-light">{requester.role}</span>
            </DetailRow>
            <DetailRow label="Status">
              {requester.active ? (
                <span className="cl-status-ok">Ativo</span>
              ) : (
                <span className="text-secondary">Inativo</span>
              )}
            </DetailRow>
            <DetailRow label="Cliente desde">
              {formatDate(requester.createdAt)}
            </DetailRow>
          </>
        ) : (
          <p className="text-secondary small mb-0">
            Este empréstimo não está vinculado a um cliente.
          </p>
        )}
      </section>
    </div>
  );
}
