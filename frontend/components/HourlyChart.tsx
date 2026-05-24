"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";

interface HourlyDataPoint {
  hour: string;
  metric_name: string;
  avg_value: number;
  count: number;
}

interface HourlyChartProps {
  data: HourlyDataPoint[];
  selectedMetric?: string;
}

const COLORS: Record<string, string> = {
  LCP: "#63b3ed",
  CLS: "#9f7aea",
  INP: "#4fd1c5",
  TTFB: "#68d391",
  FCP: "#f6ad55",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass" style={{ padding: "0.6rem 0.9rem", fontSize: "0.8rem" }}>
      <div style={{ color: "var(--text-muted)", marginBottom: "0.2rem" }}>
        {new Date(label).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div style={{ fontWeight: 700, color: COLORS[d?.metric_name] || "var(--accent-blue)" }}>
        {d?.avg_value?.toFixed?.(2)} {d?.metric_name === "CLS" ? "" : "ms"}
      </div>
      <div style={{ color: "var(--text-muted)" }}>{d?.count} samples</div>
    </div>
  );
};

export default function HourlyChart({ data, selectedMetric = "LCP" }: HourlyChartProps) {
  const filtered = data
    .filter((d) => d.metric_name === selectedMetric)
    .map((d) => ({ ...d }));

  const color = COLORS[selectedMetric] || "#63b3ed";

  if (!filtered.length) {
    return (
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
          No hourly data yet
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="hour"
          tickFormatter={(v) =>
            new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
          tick={{ fill: "var(--text-muted)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => (selectedMetric === "CLS" ? v.toFixed(2) : `${Math.round(v)}ms`)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_value" radius={[4, 4, 0, 0]}>
          {filtered.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
