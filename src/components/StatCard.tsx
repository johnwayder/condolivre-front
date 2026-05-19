import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="card cl-stat-card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <span className="cl-stat-label">{label}</span>
          {icon && <span className="text-primary">{icon}</span>}
        </div>
        <div className="cl-stat-value mt-2">{value}</div>
        {hint && <div className="small text-secondary">{hint}</div>}
      </div>
    </div>
  );
}
