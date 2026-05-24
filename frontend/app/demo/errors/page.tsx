"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

function triggerReferenceError() {
  // @ts-ignore
  const x = undefinedVariable.property;
}

function triggerTypeError() {
  const obj = null;
  // @ts-ignore
  obj.nonExistentMethod();
}

function triggerCustomError() {
  throw new Error("Custom application error: Payment processing failed — invalid card token");
}

function triggerPromiseRejection() {
  Promise.reject(new Error("Unhandled rejection: API rate limit exceeded (429)"));
}

function triggerNetworkError() {
  fetch("http://localhost:9999/nonexistent-endpoint")
    .then((r) => r.json())
    .catch(() => {
      throw new Error("Network request failed: connection refused to analytics endpoint");
    });
}

const errorScenarios = [
  {
    id: "reference-error",
    label: "ReferenceError",
    icon: "💥",
    description: "Access an undefined variable",
    severity: "critical" as const,
    fn: triggerReferenceError,
  },
  {
    id: "type-error",
    label: "TypeError",
    icon: "🔴",
    description: "Call a method on null",
    severity: "critical" as const,
    fn: triggerTypeError,
  },
  {
    id: "custom-error",
    label: "Custom Error",
    icon: "⚠️",
    description: "Application-level error throw",
    severity: "warning" as const,
    fn: triggerCustomError,
  },
  {
    id: "promise-rejection",
    label: "Unhandled Promise Rejection",
    icon: "🟡",
    description: "Promise rejected without .catch()",
    severity: "warning" as const,
    fn: triggerPromiseRejection,
  },
  {
    id: "network-error",
    label: "Network Error",
    icon: "🌐",
    description: "Failed fetch to non-existent endpoint",
    severity: "info" as const,
    fn: triggerNetworkError,
  },
];

export default function ErrorsDemo() {
  const [fired, setFired] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<Array<{ id: string; label: string; time: string }>>([]);

  const trigger = (scenario: typeof errorScenarios[number]) => {
    try {
      scenario.fn();
    } catch {
      // Errors are caught by window.onerror, we just swallow here
    }
    setFired((prev) => ({ ...prev, [scenario.id]: true }));
    setLog((prev) => [
      { id: scenario.id, label: scenario.label, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Warning banner */}
        <div style={{ background: "rgba(246,173,85,0.1)", borderBottom: "1px solid rgba(246,173,85,0.3)", padding: "0.75rem" }}>
          <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
            <span>🧪</span>
            <span style={{ color: "var(--needs)", fontWeight: 600 }}>All errors below are intentional for demo purposes. They are captured by the RUM script and sent to the backend.</span>
          </div>
        </div>

        <section style={{ padding: "4rem 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <span className="badge badge-warning" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
              🐛 Error Simulation Lab
            </span>
            <h1 style={{ marginBottom: "1rem" }}>
              JavaScript Error <span className="gradient-text">Demo Page</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "550px", margin: "0 auto 1rem", lineHeight: 1.7 }}>
              Click the buttons below to trigger real JavaScript errors. Each one is captured by
              our RUM script and sent to the backend. Visit the dashboard to see them appear in the error log.
            </p>
          </div>
        </section>

        <section style={{ padding: "0 0 4rem" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

              {/* Error buttons */}
              <div>
                <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>🔴 Trigger Errors</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {errorScenarios.map((scenario) => (
                    <div key={scenario.id} className="card" style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      borderColor: fired[scenario.id] ? "rgba(252,129,129,0.3)" : "var(--border)",
                    }}>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <span style={{ fontSize: "1.5rem" }}>{scenario.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{scenario.label}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{scenario.description}</div>
                        </div>
                      </div>
                      <button
                        id={`trigger-${scenario.id}`}
                        className={`btn ${fired[scenario.id] ? "btn-ghost" : "btn-secondary"}`}
                        style={{ flexShrink: 0, minWidth: "110px" }}
                        onClick={() => trigger(scenario)}
                      >
                        {fired[scenario.id] ? "✓ Fired" : "Trigger"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Trigger all */}
                <button
                  id="trigger-all-errors"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "1rem" }}
                  onClick={() => errorScenarios.forEach(trigger)}
                >
                  💥 Trigger All Errors
                </button>
              </div>

              {/* Live event log */}
              <div>
                <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📋 Live Event Log
                  {log.length > 0 && <span className="badge badge-critical">{log.length}</span>}
                </h2>

                {log.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                    <div>No errors triggered yet</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Click a button above to start</div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {log.map((entry, i) => (
                      <div
                        key={i}
                        className="animate-fade-in"
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "center",
                          padding: "0.85rem 1rem",
                          borderBottom: i < log.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <span style={{ color: "var(--poor)", fontSize: "0.8rem" }}>●</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{entry.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Captured by window.onerror</div>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{entry.time}</div>
                        <span className="badge badge-good" style={{ flexShrink: 0 }}>sent ✓</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="card" style={{ marginTop: "1rem", background: "rgba(104,211,145,0.05)", borderColor: "rgba(104,211,145,0.2)" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span>💡</span>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      Errors are batched and sent every <strong>2 seconds</strong> via the RUM script.
                      Open the <a href="/dashboard" style={{ color: "var(--accent-blue)" }}>Dashboard</a> in another tab to see them appear in real time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
