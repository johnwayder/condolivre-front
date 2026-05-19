"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { StateConcentration } from "@/lib/api";
import { stateName } from "@/lib/brazilianStates";

const STATUS_COLOR = {
  OK: "#16b981",
  WARNING: "#f4b740",
  BREACH: "#f0323c",
} as const;

export default function RiskGauge({
  states,
}: {
  states: StateConcentration[];
}) {
  if (states.length === 0) {
    return <p className="text-secondary mb-0">Sem dados de carteira.</p>;
  }

  const mostAtRisk = [...states].sort(
    (a, b) => b.share / b.limit - a.share / a.limit,
  )[0];
  const utilization = Math.min(
    150,
    Math.round((mostAtRisk.share / mostAtRisk.limit) * 100),
  );
  const color = STATUS_COLOR[mostAtRisk.status];

  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={190}>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={[{ name: mostAtRisk.uf, value: utilization, fill: color }]}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="mt-1">
        <span className="h5 fw-bold" style={{ color }}>
          {mostAtRisk.uf}
        </span>
        <div className="small text-secondary">{stateName(mostAtRisk.uf)}</div>
        <div className="small">
          usa <strong>{utilization}%</strong> do limite permitido
        </div>
      </div>
    </div>
  );
}
