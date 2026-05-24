"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CWVRadarProps {
  aggregated: Array<{
    metric_name: string;
    avg_value: number;
    good_count: number;
    needs_improvement_count: number;
    poor_count: number;
    sample_count: number;
  }>;
}

const BENCHMARKS: Record<string, { good: number; poor: number; label: string }> = {
  LCP:  { good: 2500,  poor: 4000,  label: "LCP" },
  CLS:  { good: 0.1,   poor: 0.25,  label: "CLS" },
  INP:  { good: 200,   poor: 500,   label: "INP" },
  TTFB: { good: 800,   poor: 1800,  label: "TTFB" },
  FCP:  { good: 1800,  poor: 3000,  label: "FCP" },
};

/** Maps avg value → 0–100 score (100 = perfectly good) */
function toScore(metricName: string, value: number): number {
  const b = BENCHMARKS[metricName];
  if (!b) return 50;
  if (value <= b.good) return 100;
  if (value >= b.poor) return 0;
  // Linear interpolation in the needs-improvement band
  return Math.round(100 - ((value - b.good) / (b.poor - b.good)) * 100);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass" style={{ padding: "0.6rem 0.9rem", fontSize: "0.8rem" }}>
      <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{d.metric}</div>
      <div style={{ color: "var(--text-muted)" }}>Score: <strong style={{ color: "var(--accent-blue)" }}>{d.score}/100</strong></div>
    </div>
  );
};

export default function CWVRadar({ aggregated }: CWVRadarProps) {
  const data = Object.keys(BENCHMARKS).map((name) => {
    const m = aggregated.find((a) => a.metric_name === name);
    return {
      metric: name,
      score: m ? toScore(name, m.avg_value) : 0,
      fullMark: 100,
    };
  });

  const hasData = data.some((d) => d.score > 0);

  if (!hasData) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}></div>
          Collect metrics to see radar chart
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "var(--text-muted)", fontSize: 9 }}
          tickCount={4}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#63b3ed"
          fill="#63b3ed"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: "#63b3ed", strokeWidth: 2, r: 4 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
