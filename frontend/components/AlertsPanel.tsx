"use client";

interface Alert {
  id: number;
  timestamp: string;
  metric_name: string;
  value: number;
  budget_value: number;
  url: string;
  severity: "critical" | "warning";
  acknowledged: number;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => Promise<void>;
}

function formatVal(name: string, val: number) {
  if (name === "CLS") return val.toFixed(3);
  if (val >= 1000) return `${(val / 1000).toFixed(1)}s`;
  return `${Math.round(val)}ms`;
}

export default function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}></div>
        <div style={{ fontWeight: 600, color: "var(--good)" }}>All within budget</div>
        <div style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}>No threshold violations detected</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {alerts.map((alert) => {
        const overPct = Math.round(((alert.value - alert.budget_value) / alert.budget_value) * 100);
        return (
          <div key={alert.id} className="animate-fade-in"
            style={{
              display: "flex", gap: "0.75rem", alignItems: "flex-start",
              padding: "0.85rem 1rem",
              background: alert.severity === "critical"
                ? "rgba(252,129,129,0.07)" : "rgba(246,173,85,0.07)",
              border: `1px solid ${alert.severity === "critical"
                ? "rgba(252,129,129,0.25)" : "rgba(246,173,85,0.25)"}`,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
              {alert.severity === "critical" ? "!" : "!"}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                <span className={`badge badge-${alert.severity === "critical" ? "critical" : "warning"}`}>
                  {alert.severity}
                </span>
                <code style={{ fontSize: "0.8rem" }}>{alert.metric_name}</code>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--poor)" }}>
                  {formatVal(alert.metric_name, alert.value)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  (+{overPct}% over budget of {formatVal(alert.metric_name, alert.budget_value)})
                </span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                {alert.url}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>

            <button
              className="btn btn-ghost"
              style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", flexShrink: 0 }}
              onClick={() => onAcknowledge(alert.id)}
            >
              ✓ Ack
            </button>
          </div>
        );
      })}
    </div>
  );
}
