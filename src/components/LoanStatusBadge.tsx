import { LoanStatus } from "@/lib/api";

const STATUS_MAP: Record<LoanStatus, { label: string; className: string }> = {
  PENDING: { label: "Em análise", className: "text-bg-warning" },
  APPROVED: { label: "Aprovado", className: "text-bg-success" },
  REJECTED: { label: "Recusado", className: "text-bg-danger" },
};

export default function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const entry = STATUS_MAP[status];
  return <span className={`badge ${entry.className}`}>{entry.label}</span>;
}
