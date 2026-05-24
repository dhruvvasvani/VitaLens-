"use client";

import { useState } from "react";

interface Budget {
  metric_name: string;
  budget_value: number;
}

interface AggregatedMetric {
  metric_name: string;
  avg_value: number;
}

interface BudgetPanelProps {
  budgets: Budget[];
  aggregated: AggregatedMetric[];
  onUpdate: (metricName: string, value: number) => Promise<void>;
}

const UNITS: Record<string, string> = {
  LCP: "ms", CLS: "", INP: "ms", TTFB: "ms", FCP: "ms",
};

function formatVal(name: string, val: number) {
  if (name === "CLS") return val.toFixed(3);
  if (val >= 1000) return `${(val / 1000).toFixed(1)}s`;
  return `${Math.round(val)}ms`;
}

export default function BudgetPanel({ budgets, aggregated, onUpdate }: BudgetPanelProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving] = useState(false);

  const getActual = (name: string) =>
    aggregated.find((a) => a.metric_name === name)?.avg_value ?? null;

  const handleSave = async (name: string) => {
    const num = parseFloat(editVal);
    if (isNaN(num) || num <= 0) return;
    setSaving(true);
    await onUpdate(name, num);
    setSaving(false);
    setEditing(null);
    setEditVal("");
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 style={{ marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        Performance Budgets
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
        Set thresholds — alerts fire when metrics exceed budget.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {budgets.map((b) => {
          const actual = getActual(b.metric_name);
          const overBudget = actual !== null && actual > b.budget_value;
          const overage = actual !== null && overBudget
            ? Math.round(((actual - b.budget_value) / b.budget_value) * 100)
            : 0;
          const pct = actual !== null
            ? Math.min((actual / b.budget_value) * 100, 130)
            : 0;
          const barColor = overBudget ? "var(--poor)" : pct > 80 ? "var(--needs)" : "var(--good)";
          const isEditing = editing === b.metric_name;

          return (
            <div key={b.metric_name}
              style={{
                padding: "0.9rem 1rem",
                background: overBudget ? "rgba(252,129,129,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${overBudget ? "rgba(252,129,129,0.25)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <code style={{ fontSize: "0.8rem" }}>{b.metric_name}</code>
                  {overBudget && (
                    <span className="badge badge-critical" style={{ animation: "none" }}>
                      +{overage}% over
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {actual !== null && (
                    <span style={{ fontSize: "0.8rem", color: overBudget ? "var(--poor)" : "var(--good)", fontWeight: 700 }}>
                      {formatVal(b.metric_name, actual)}
                    </span>
                  )}
                  {!isEditing ? (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                      onClick={() => { setEditing(b.metric_name); setEditVal(String(b.budget_value)); }}
                    >
                      Edit: {formatVal(b.metric_name, b.budget_value)}
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <input
                        type="number"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        style={{ width: "80px", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSave(b.metric_name); if (e.key === "Escape") setEditing(null); }}
                      />
                      <button className="btn btn-primary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem" }}
                        onClick={() => handleSave(b.metric_name)} disabled={saving}>
                        {saving ? "…" : "Save"}
                      </button>
                      <button className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                        onClick={() => setEditing(null)}>✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(pct, 100)}%`,
                  background: barColor,
                  borderRadius: "2px",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                <span>{actual !== null ? `${Math.round(pct)}% of budget` : "No data"}</span>
                <span>Budget: {formatVal(b.metric_name, b.budget_value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
