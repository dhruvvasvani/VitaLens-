import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration Guides – VitaLens",
  description: "Step-by-step guides to add VitaLens performance monitoring to HTML, Next.js, React, Nuxt, and Vue sites.",
};

const frameworks = [
  {
    id: "html",
    name: "Plain HTML",
    icon: "🌐",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    badge: "Any site",
    desc: "Works on any website. Just paste 2 tags into your HTML head. No build tools, no npm, no config.",
    time: "2 min",
    difficulty: "Beginner",
    steps: 3,
  },
  {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.2)",
    badge: "Recommended",
    desc: "Use next/script for optimized loading. Works with App Router and Pages Router. Perfect for SSR and SSG.",
    time: "3 min",
    difficulty: "Easy",
    steps: 4,
  },
  {
    id: "react",
    name: "React (Vite / CRA)",
    icon: "⚛️",
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.08)",
    border: "rgba(45,212,191,0.2)",
    badge: "Popular",
    desc: "Add to index.html and optionally initialize via useEffect. Works with Vite, Create React App, and custom setups.",
    time: "3 min",
    difficulty: "Easy",
    steps: 4,
  },
  {
    id: "nuxt",
    name: "Nuxt",
    icon: "💚",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
    badge: "SSR ready",
    desc: "Configure via nuxt.config.ts. Supports Nuxt 3 and Bridge. Auto-loads on every page including SSR pages.",
    time: "3 min",
    difficulty: "Easy",
    steps: 4,
  },
  {
    id: "vue",
    name: "Vue 3",
    icon: "💚",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    badge: "SPA",
    desc: "Add to index.html and initialize in main.ts. Works with Vue CLI, Vite + Vue, and Quasar Framework.",
    time: "3 min",
    difficulty: "Easy",
    steps: 4,
  },
  {
    id: "wordpress",
    name: "WordPress",
    icon: "📝",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    badge: "No-code",
    desc: "Add via the Appearance → Theme Editor, or use a plugin like Insert Headers and Footers. No coding required.",
    time: "2 min",
    difficulty: "Beginner",
    steps: 3,
  },
];

const difficultyColor: Record<string, string> = {
  Beginner: "var(--good)",
  Easy: "var(--blue)",
  Moderate: "var(--needs)",
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ padding: "4rem 0 3rem", borderBottom: "1px solid var(--border)", background: "var(--grad-mesh)", textAlign: "center" }}>
          <div className="container">
            <div className="animate-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0.3rem 0.9rem", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "var(--r-full)", fontSize: "0.75rem", color: "var(--blue)", fontWeight: 600, marginBottom: "1.5rem" }}>
              📚 Integration Guides
            </div>
            <h1 className="animate-up d1" style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", marginBottom: "1rem" }}>
              Add VitaLens to <span className="gradient-text">any framework</span>
            </h1>
            <p className="animate-up d2" style={{ fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
              Step-by-step guides for every popular framework. Each takes under 5 minutes and requires no backend changes.
            </p>
          </div>
        </section>

        {/* Framework cards */}
        <section style={{ padding: "3rem 0 5rem" }}>
          <div className="container">
            <div className="grid-3">
              {frameworks.map((fw, i) => (
                <Link
                  key={fw.id}
                  href={`/docs/${fw.id}`}
                  className={`card card-hover animate-up d${Math.min(i + 1, 6)}`}
                  style={{ display: "block", cursor: "pointer", textDecoration: "none", transition: "all 0.2s" }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: fw.bg, border: `1px solid ${fw.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                      {fw.icon}
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.18rem 0.6rem", background: fw.bg, border: `1px solid ${fw.border}`, borderRadius: "var(--r-full)", color: fw.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {fw.badge}
                    </span>
                  </div>

                  {/* Name + desc */}
                  <h3 style={{ marginBottom: "0.4rem", fontSize: "1.05rem", color: "var(--text-1)" }}>{fw.name}</h3>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>{fw.desc}</p>

                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>⏱</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500 }}>{fw.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: difficultyColor[fw.difficulty], flexShrink: 0 }} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500 }}>{fw.difficulty}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>📋</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500 }}>{fw.steps} steps</span>
                    </div>
                    <span style={{ marginLeft: "auto", color: fw.color, fontSize: "0.85rem", fontWeight: 600 }}>View guide →</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom note */}
            <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
              <div className="callout callout-info" style={{ maxWidth: "560px", margin: "0 auto" }}>
                <span>💡</span>
                <div style={{ fontSize: "0.875rem" }}>
                  <strong>Any other framework?</strong> VitaLens is a plain JavaScript script. If your framework lets you add a <code>&lt;script&gt;</code> tag to the HTML head, it works — no matter what stack you use.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
