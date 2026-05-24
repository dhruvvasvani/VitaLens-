"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────── */
type Step = {
  title: string;
  desc: string;
  code?: string;
  lang?: string;
  note?: string;
  warning?: string;
};

type Framework = {
  id: string;
  name: string;
  icon: string;
  color: string;
  badge: string;
  tagline: string;
  prereqs: string[];
  steps: Step[];
  verify: string;
  liveDemo?: string;
};

/* ─── Copy button ────────────────────────────────────────── */
function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className={`btn btn-xs ${copied ? "btn-success" : "btn-ghost"}`}
      style={{ fontFamily: "var(--font)" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

/* ─── Code block ─────────────────────────────────────────── */
function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="code-block" style={{ marginTop: "1rem" }}>
      <div className="code-block-header">
        <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
          {title || "code"}
        </span>
        <CopyBtn code={code} />
      </div>
      <pre style={{ margin: 0, borderRadius: 0, border: "none", maxHeight: "420px", overflowY: "auto" }}>
        {code}
      </pre>
    </div>
  );
}

/* ─── Step card ──────────────────────────────────────────── */
function StepCard({ step, index, color }: { step: Step; index: number; color: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="card"
      style={{
        marginBottom: "1rem",
        borderLeft: `3px solid ${color}40`,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = color; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderLeftColor = `${color}40`; }}
    >
      {/* Step header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          fontFamily: "var(--font)",
        }}
      >
        {/* Step number */}
        <div style={{
          width: "32px", height: "32px",
          borderRadius: "50%",
          background: `${color}15`,
          border: `1px solid ${color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700,
          color: color,
          flexShrink: 0,
        }}>
          {index}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-1)" }}>{step.title}</div>
          {!open && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "2px" }}>Click to expand</div>
          )}
        </div>

        <span style={{ color: "var(--text-3)", fontSize: "0.9rem", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
      </button>

      {/* Step body */}
      {open && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-2)", marginBottom: step.code ? 0 : "0" }}>
            {step.desc}
          </p>

          {step.warning && (
            <div className="callout callout-error" style={{ marginTop: "0.85rem", fontSize: "0.82rem" }}>
              <span>⚠️</span>
              <span>{step.warning}</span>
            </div>
          )}

          {step.code && (
            <CodeBlock code={step.code} title={step.lang ? `.${step.lang}` : "code"} />
          )}

          {step.note && (
            <div className="callout callout-info" style={{ marginTop: "0.85rem", fontSize: "0.82rem" }}>
              <span>💡</span>
              <span>{step.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main client component ──────────────────────────────── */
export default function DocsClient({
  fw,
  prev,
  next,
  allFrameworks,
}: {
  fw: Framework;
  prev?: Framework;
  next?: Framework;
  allFrameworks: Framework[];
}) {
  return (
    <main style={{ minHeight: "100vh", paddingBottom: "5rem" }}>

      {/* ── Breadcrumb + header ─────────────────────────── */}
      <section style={{
        padding: "3rem 0 2.5rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--grad-mesh)",
      }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "var(--text-3)" }}>
            <Link href="/" style={{ color: "var(--text-3)", transition: "color 0.15s" }}>Home</Link>
            <span>›</span>
            <Link href="/docs" style={{ color: "var(--text-3)", transition: "color 0.15s" }}>Integration Guides</Link>
            <span>›</span>
            <span style={{ color: "var(--text-2)" }}>{fw.name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
            {/* Icon */}
            <div style={{
              width: "56px", height: "56px",
              borderRadius: "14px",
              background: `${fw.color}15`,
              border: `1px solid ${fw.color}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", flexShrink: 0,
            }}>
              {fw.icon}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)" }}>{fw.name} Integration Guide</h1>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  padding: "0.18rem 0.6rem",
                  background: `${fw.color}12`,
                  border: `1px solid ${fw.color}25`,
                  borderRadius: "var(--r-full)",
                  color: fw.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>
                  {fw.badge}
                </span>
              </div>
              <p style={{ maxWidth: "600px", fontSize: "0.95rem" }}>{fw.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "2rem", alignItems: "start" }}>

          {/* ── Main content ───────────────────────────── */}
          <div>

            {/* Prerequisites */}
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "0.85rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>✅</span> Before you start
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {fw.prereqs.map((req, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-2)", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--good)", flexShrink: 0, marginTop: "0.1rem" }}>›</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--text-1)" }}>
                Step-by-step guide
              </h2>
              {fw.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i + 1} color={fw.color} />
              ))}
            </div>

            {/* Verify */}
            <div className="card" style={{ marginBottom: "2rem", borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.04)" }}>
              <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--good)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🎉</span> How to verify it works
              </h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{fw.verify}</p>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/dashboard" className="btn btn-success btn-sm">
                  📊 Open Dashboard
                </Link>
                {fw.liveDemo && (
                  <Link href={fw.liveDemo} className="btn btn-ghost btn-sm">
                    ⚡ See live demo
                  </Link>
                )}
              </div>
            </div>

            {/* What gets tracked */}
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>📏 What gets tracked</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.6rem" }}>
                {[
                  { name: "LCP",  desc: "Largest Contentful Paint", good: "≤ 2.5s",  color: "#60a5fa" },
                  { name: "CLS",  desc: "Cumulative Layout Shift",  good: "≤ 0.1",   color: "#a78bfa" },
                  { name: "INP",  desc: "Interaction to Next Paint",good: "≤ 200ms", color: "#2dd4bf" },
                  { name: "TTFB", desc: "Time to First Byte",       good: "≤ 800ms", color: "#4ade80" },
                  { name: "FCP",  desc: "First Contentful Paint",   good: "≤ 1.8s",  color: "#fbbf24" },
                ].map((m) => (
                  <div key={m.name} style={{ padding: "0.7rem 0.85rem", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", borderLeft: `3px solid ${m.color}` }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: m.color }}>{m.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-2)", marginTop: "0.15rem" }}>{m.desc}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "0.1rem" }}>{m.good}</div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: "0.85rem", fontSize: "0.8rem" }}>
                Plus: navigation timing (DNS, TCP, TTFB, DOM), JS errors, device type, connection type.
              </p>
            </div>

            {/* Nav: prev / next */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              {prev ? (
                <Link href={`/docs/${prev.id}`} className="btn btn-ghost" style={{ flex: 1, justifyContent: "flex-start" }}>
                  ← {prev.icon} {prev.name}
                </Link>
              ) : (
                <Link href="/docs" className="btn btn-ghost" style={{ flex: 1, justifyContent: "flex-start" }}>
                  ← All frameworks
                </Link>
              )}
              {next && (
                <Link href={`/docs/${next.id}`} className="btn btn-ghost" style={{ flex: 1, justifyContent: "flex-end" }}>
                  {next.icon} {next.name} →
                </Link>
              )}
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────── */}
          <div style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Quick links */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "0.85rem" }}>On this page</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {["Before you start", "Step-by-step guide", "Verify it works", "What gets tracked"].map((label) => (
                  <div key={label} style={{ fontSize: "0.82rem", color: "var(--text-2)", padding: "0.3rem 0.5rem", borderRadius: "5px", cursor: "pointer" }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Other frameworks */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "0.85rem" }}>Other Frameworks</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {allFrameworks.map((f) => (
                  <Link
                    key={f.id}
                    href={`/docs/${f.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.4rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: f.id === fw.id ? 600 : 400,
                      color: f.id === fw.id ? f.color : "var(--text-2)",
                      background: f.id === fw.id ? `${f.color}10` : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>{f.icon}</span>
                    {f.name}
                    {f.id === fw.id && <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: f.color }}>← current</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links to app */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "0.85rem" }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ justifyContent: "center" }}>📊 Dashboard</Link>
                <Link href="/snippet" className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>📋 Get Script</Link>
                <Link href="/demo/fast" className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>⚡ Fast Demo</Link>
                <Link href="/demo/slow" className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>🐢 Slow Demo</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
