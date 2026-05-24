"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface TrendPoint {
  timestamp: string;
  value: number;
  rating: string;
  url: string;
}

interface TrendChartProps {
  metricName: string;
  data: TrendPoint[];
  goodThreshold: number;
  poorThreshold: number;
  unit: string;
  color?: string;
}

function formatValue(value: number, metricName: string): string {
  if (metricName === "CLS") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function getStrokeColor(rating: string): string {
  switch (rating) {
    case "good": return "#68d391";
    case "needs-improvement": return "#f6ad55";
    case "poor": return "#fc8181";
    default: return "#63b3ed";
  }
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = getStrokeColor(payload.rating);
  return <circle cx={cx} cy={cy} r={3} fill={color} stroke={color} strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label, metricName }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass" style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", minWidth: "180px" }}>
      <div style={{ color: "var(--text-muted)", marginBottom: "0.3rem" }}>
        {d?.timestamp ? format(new Date(d.timestamp), "MMM d, HH:mm:ss") : ""}
      </div>
      <div style={{ fontWeight: 700, fontSize: "1rem", color: getStrokeColor(d?.rating) }}>
        {formatValue(payload[0]?.value, metricName)}
      </div>
      <span className={`badge badge-${d?.rating === "needs-improvement" ? "needs" : d?.rating}`} style={{ marginTop: "0.3rem" }}>
        {d?.rating}
      </span>
      <div style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "0.7rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {d?.url}
      </div>
    </div>
  );
};

export default function TrendChart({
  metricName,
  data,
  goodThreshold,
  poorThreshold,
  unit,
  color = "#63b3ed",
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No data yet — visit a demo page to generate metrics</div>
        </div>
      </div>
    );
  }

  const tickFormatter = (v: number) => {
    if (metricName === "CLS") return v.toFixed(2);
    if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
    return `${Math.round(v)}ms`;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) => format(new Date(t), "HH:mm")}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={tickFormatter}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip metricName={metricName} />} />
        <ReferenceLine y={goodThreshold} stroke="#68d391" strokeDasharray="4 2" strokeOpacity={0.5}
          label={{ value: "Good", fill: "#68d391", fontSize: 10, position: "right" }} />
        <ReferenceLine y={poorThreshold} stroke="#fc8181" strokeDasharray="4 2" strokeOpacity={0.5}
          label={{ value: "Poor", fill: "#fc8181", fontSize: 10, position: "right" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
