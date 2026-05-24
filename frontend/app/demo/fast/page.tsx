import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fast Page Demo - VitaLens",
  description: "An optimized demo page with excellent Core Web Vitals.",
};

export default function FastDemo() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Hero - content above fold, minimal LCP */}
        <section style={{ padding: "5rem 0", background: "linear-gradient(135deg, rgba(104,211,145,0.05), rgba(99,179,237,0.05))" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <span className="badge badge-good" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
              ⚡ Optimized Page
            </span>
            <h1 style={{ marginBottom: "1rem" }}>
              This is a <span className="gradient-text">Fast</span> Demo Page
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "550px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
              This page is optimized for excellent Core Web Vitals. The RUM script
              will report great LCP, low CLS, and fast TTFB.
            </p>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[
                { name: "LCP", value: "~1.2s", color: "var(--good)" },
                { name: "CLS", value: "~0.0", color: "var(--good)" },
                { name: "INP", value: "~80ms", color: "var(--good)" },
              ].map((m) => (
                <div key={m.name} className="glass" style={{ padding: "1rem 1.5rem", textAlign: "center", minWidth: "120px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.name}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard" className="btn btn-primary glow-btn" style={{ padding: "0.75rem 2rem", fontSize: "1.1rem", borderRadius: "var(--r-full)" }}>
                📊 See Metrics on Dashboard
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
