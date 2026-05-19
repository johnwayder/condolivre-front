import { ConcentrationStatus, StateConcentration } from "@/lib/api";
import { stateName } from "@/lib/brazilianStates";
import { formatBRLFromCents, formatPercent } from "@/lib/formatters";

const STATUS_TEXT: Record<ConcentrationStatus, string> = {
  OK: "cl-status-ok",
  WARNING: "cl-status-warning",
  BREACH: "cl-status-breach",
};

const STATUS_BAR: Record<ConcentrationStatus, string> = {
  OK: "bg-success",
  WARNING: "bg-warning",
  BREACH: "bg-danger",
};

export default function ConcentrationPanel({
  states,
}: {
  states: StateConcentration[];
}) {
  if (states.length === 0) {
    return (
      <p className="text-secondary mb-0">Nenhum empréstimo registrado ainda.</p>
    );
  }

  return (
    <div className="row g-3">
      {states.map((state) => {
        const fill =
          state.limit > 0
            ? Math.min(100, (state.share / state.limit) * 100)
            : 0;
        return (
          <div className="col-sm-6 col-lg-4" key={state.uf}>
            <div className="card cl-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-baseline">
                  <strong>{state.uf}</strong>
                  <span className={`fw-semibold ${STATUS_TEXT[state.status]}`}>
                    {formatPercent(state.share)}
                  </span>
                </div>
                <div className="small text-secondary">
                  {stateName(state.uf)}
                </div>

                <div className="progress mt-2" style={{ height: 8 }}>
                  <div
                    className={`progress-bar ${STATUS_BAR[state.status]}`}
                    style={{ width: `${fill}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between small text-secondary mt-2">
                  <span>Limite {formatPercent(state.limit)}</span>
                  <span>{formatBRLFromCents(state.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
