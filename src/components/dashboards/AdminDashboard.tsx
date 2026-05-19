import {
  AlertTriangle,
  ListChecks,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ConcentrationReport } from "@/lib/api";
import { formatBRLFromCents, formatPercent } from "@/lib/formatters";
import StatCard from "@/components/StatCard";
import ConcentrationPanel from "@/components/ConcentrationPanel";
import ConcentrationBarChart from "@/components/charts/ConcentrationBarChart";
import PortfolioDonutChart from "@/components/charts/PortfolioDonutChart";
import RiskGauge from "@/components/charts/RiskGauge";

interface AdminDashboardProps {
  report: ConcentrationReport;
  isAdmin: boolean;
}

export default function AdminDashboard({
  report,
  isAdmin,
}: AdminDashboardProps) {
  const breaches = report.states.filter((state) => state.status === "BREACH");

  return (
    <div className="d-flex flex-column gap-4">
      {breaches.length > 0 ? (
        <div className="alert alert-danger d-flex gap-2 mb-0" role="alert">
          <AlertTriangle size={20} className="flex-shrink-0 mt-1" />
          <div>
            <strong>
              {breaches.length} estado(s) em violação:{" "}
              {breaches.map((state) => state.uf).join(", ")}.
            </strong>
            <div className="small">
              Um estado entra em violação quando um administrador força o
              registro de um empréstimo acima do limite de concentração.{" "}
              {isAdmin
                ? "Reveja a carteira ou ajuste os limites de concentração."
                : "Reveja a carteira e acione um administrador para ajustar os limites, se necessário."}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-success d-flex gap-2 mb-0" role="alert">
          <ShieldCheck size={20} className="flex-shrink-0 mt-1" />
          <div className="small">
            Nenhum estado em violação — toda a carteira está dentro dos limites
            de concentração.
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Total da carteira"
            value={formatBRLFromCents(report.grandTotalCents)}
            icon={<Wallet size={20} />}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Empréstimos"
            value={report.totalLoans}
            icon={<ListChecks size={20} />}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Estados com carteira"
            value={report.states.length}
            icon={<MapPin size={20} />}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Estados em violação"
            value={breaches.length}
            hint={
              breaches.length > 0 ? "Atenção necessária" : "Carteira saudável"
            }
            icon={<AlertTriangle size={20} />}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card cl-card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold">Concentração x limite por estado</h2>
              <ConcentrationBarChart states={report.states} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card cl-card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold">Estado em maior risco</h2>
              <RiskGauge states={report.states} />
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card cl-card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold">Distribuição da carteira</h2>
              <PortfolioDonutChart states={report.states} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card cl-card h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold">Política vigente</h2>
              <ul className="list-unstyled small mb-0">
                {report.policy.map((descriptor) => (
                  <li
                    key={`${descriptor.scope}-${descriptor.uf ?? "default"}`}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>
                      {descriptor.uf ?? "Limite padrão (todos os estados)"}
                    </span>
                    <strong>
                      {formatPercent(descriptor.limitFraction, 1)}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="h6 fw-bold text-uppercase text-secondary">
          Concentração por estado
        </h2>
        <ConcentrationPanel states={report.states} />
      </section>
    </div>
  );
}
