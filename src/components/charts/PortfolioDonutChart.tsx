"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { StateConcentration } from "@/lib/api";
import { formatBRLFromCents } from "@/lib/formatters";

const PALETTE = [
  "#5c4ee5",
  "#2ee6c8",
  "#2f6bff",
  "#f4b740",
  "#16b981",
  "#f0323c",
  "#9b8cff",
  "#0ea5a3",
  "#ff9f43",
  "#6b7280",
];

export default function PortfolioDonutChart({
  states,
}: {
  states: StateConcentration[];
}) {
  const data = states.map((state) => ({
    name: state.uf,
    value: state.totalCents,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatBRLFromCents(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
