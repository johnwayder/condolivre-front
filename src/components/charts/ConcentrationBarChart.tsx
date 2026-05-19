"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ConcentrationStatus, StateConcentration } from "@/lib/api";

const STATUS_COLOR: Record<ConcentrationStatus, string> = {
  OK: "#16b981",
  WARNING: "#f4b740",
  BREACH: "#f0323c",
};

export default function ConcentrationBarChart({
  states,
}: {
  states: StateConcentration[];
}) {
  const data = states.map((state) => ({
    uf: state.uf,
    status: state.status,
    share: Number((state.share * 100).toFixed(2)),
    limit: Number((state.limit * 100).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="uf" fontSize={12} />
        <YAxis unit="%" fontSize={12} />
        <Tooltip
          formatter={(value: number) =>
            `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
          }
        />
        <Legend />
        <Bar dataKey="share" name="Concentração" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.uf} fill={STATUS_COLOR[entry.status]} />
          ))}
        </Bar>
        <Bar
          dataKey="limit"
          name="Limite"
          fill="#cfd1e6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
