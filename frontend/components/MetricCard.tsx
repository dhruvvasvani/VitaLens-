"use client";

interface MetricCardProps {
  name: string;
  label: string;
  avgValue: number | null;
  unit: string;
  goodThreshold: number;
  poorThreshold: number;
  sampleCount?: number;
  goodCount?: number;
  needsCount?: number;
  poorCount?: number;
}

function getRating(value: number, good: number, poor: number): "good" | "needs-improvement" | "poor" {
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function getScoreColor(rating: string): string {
  switch (rating) {
    case "good": return "var(--good)";
    case "needs-improvement": return "var(--needs)";
    case "poor": return "var(--poor)";
    default: return "var(--text-muted)";
  }
}

function formatValue(value: number, unit: string, name: string): string {
  if (name === "CLS") return value.toFixed(3);
  if (unit === "ms") {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
    return `${Math.round(value)}ms`;
  }
  return String(value);
}

export default function MetricCard({
  name,
  label,
  avgValue,
  unit,
  goodThreshold,
  poorThreshold,
  sampleCount = 0,
  goodCount = 0,
  needsCount = 0,
  poorCount = 0,
}: MetricCardProps) {
  const rating = avgValue !== null ? getRating(avgValue, goodThreshold, poorThreshold) : null;
  const color = rating ? getScoreColor(rating) : "var(--text-muted)";

  const total = goodCount + needsCount + poorCount;
  const goodPct = total > 0 ? (goodCount / total) * 100 : 0;
  const needsPct = total > 0 ? (needsCount / total) * 100 : 0;
  const poorPct = total > 0 ? (poorCount / total) * 100 : 0;

  return (
    <div className="card animate-fade-in" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background glow based on rating */}
      {rating && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</div>
        </div>
        {rating && (
          <span className={`badge badge-${rating === "needs-improvement" ? "needs" : rating}`}>
            {rating === "needs-improvement" ? "Needs Work" : rating}
          </span>
        )}
      </div>

      {/* Main value */}
      <div style={{ marginBottom: "1rem" }}>
        {avgValue !== null ? (
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color, lineHeight: 1 }}>
            {formatValue(avgValue, unit, name)}
          </div>
        ) : (
          <div className="skeleton" style={{ height: "2.5rem", width: "120px" }} />
        )}
        {sampleCount > 0 && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {sampleCount} sample{sampleCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Thresholds */}
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", gap: "0.75rem" }}>
        <span>Good ≤ {formatValue(goodThreshold, unit, name)}</span>
        <span>Poor &gt; {formatValue(poorThreshold, unit, name)}</span>
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div>
          <div style={{ display: "flex", gap: "2px", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
            {goodPct > 0 && <div style={{ width: `${goodPct}%`, background: "var(--good)", borderRadius: "2px" }} />}
            {needsPct > 0 && <div style={{ width: `${needsPct}%`, background: "var(--needs)" }} />}
            {poorPct > 0 && <div style={{ width: `${poorPct}%`, background: "var(--poor)", borderRadius: "2px" }} />}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
            <span style={{ color: "var(--good)" }}>●&nbsp;{Math.round(goodPct)}%</span>
            <span style={{ color: "var(--needs)" }}>●&nbsp;{Math.round(needsPct)}%</span>
            <span style={{ color: "var(--poor)" }}>●&nbsp;{Math.round(poorPct)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
