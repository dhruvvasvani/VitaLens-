"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button 
      onClick={copy} 
      className={`btn btn-sm ${copied ? "btn-success" : "btn-secondary"}`} 
      style={{ minWidth: "74px" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{title}</span>
        <CopyButton text={code} />
      </div>
      <pre style={{ margin: 0, borderRadius: 0, border: "none", fontSize: "0.83rem" }}>{code}</pre>
    </div>
  );
}

const frameworks = [
  { id: "html",   label: "HTML" },
  { id: "nextjs", label: "Next.js" },
  { id: "react",  label: "React" },
  { id: "nuxt",   label: "Nuxt" },
];

export default function SnippetPage() {
  const [projectId] = useState(() => `proj_${Math.random().toString(36).slice(2, 10)}`);
  const [fw, setFw] = useState("html");

  const snippets: Record<string, string> = {
    html: `<!-- VitaLens – paste inside <head> -->
<script>
  window.PERF_PROJECT_ID = "${projectId}";
  window.PERF_API        = "${API_URL}";
</script>
<script src="${API_URL}/rum.js" async></script>`,

    nextjs: `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script id="perf-config" strategy="beforeInteractive">{\`
          window.PERF_PROJECT_ID = "${projectId}";
          window.PERF_API = "${API_URL}";
        \`}</Script>
        <Script src="${API_URL}/rum.js" strategy="afterInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}`,

    react: `// src/index.jsx – add before ReactDOM.render
window.PERF_PROJECT_ID = "${projectId}";
window.PERF_API        = "${API_URL}";

// Also add to public/index.html <head>:
// <script src="${API_URL}/rum.js" async></script>`,

    nuxt: `// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          innerHTML: \`
            window.PERF_PROJECT_ID = "${projectId}";
            window.PERF_API = "${API_URL}";
          \`,
        },
        { src: "${API_URL}/rum.js", async: true },
      ],
    },
  },
});`,
  };

  const titles: Record<string, string> = {
    html:   "HTML — paste in <head>",
    nextjs: "app/layout.tsx",
    react:  "src/index.jsx",
    nuxt:   "nuxt.config.ts",
  };

  const metrics = [
    { name: "LCP",  full: "Largest Contentful Paint",  good: "≤ 2.5s",  color: "#60a5fa" },
    { name: "CLS",  full: "Cumulative Layout Shift",   good: "≤ 0.1",   color: "#a78bfa" },
    { name: "INP",  full: "Interaction to Next Paint", good: "≤ 200ms", color: "#2dd4bf" },
    { name: "TTFB", full: "Time to First Byte",        good: "≤ 800ms", color: "#4ade80" },
    { name: "FCP",  full: "First Contentful Paint",    good: "≤ 1.8s",  color: "#fbbf24" },
  ];



  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", paddingBottom: "5rem" }}>

        {/* Header */}
        <section style={{ padding: "3.5rem 0 2.5rem", borderBottom: "1px solid var(--border)", background: "var(--grad-mesh)" }}>
          <div className="container container-sm">
            <div className="animate-up" style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span className="badge badge-info">Integration</span>
              <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
                Your Project ID: <code>{projectId}</code>
              </span>
            </div>
            <h1 className="animate-up d1" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", marginBottom: "0.85rem" }}>
              Add VitaLens to your site
            </h1>
            <p className="animate-up d2" style={{ fontSize: "1rem", maxWidth: "520px" }}>
              Paste two lines into your website and start collecting real user performance data instantly.
              Works with any framework or plain HTML.
            </p>
          </div>
        </section>

        <div className="container container-sm" style={{ paddingTop: "2.5rem" }}>

          {/* Framework selector + code */}
          <div style={{ marginBottom: "0.75rem" }}>
            <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Choose your framework</div>
            <div className="tab-bar" style={{ display: "inline-flex" }}>
              {frameworks.map((f) => (
                <button key={f.id} className={`tab-btn ${fw === f.id ? "active" : ""}`} onClick={() => setFw(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-scale" style={{ marginBottom: "2.5rem" }}>
            <CodeBlock title={titles[fw]} code={snippets[fw]} />
          </div>

          {/* What gets tracked */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>📏 What gets tracked automatically</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.65rem" }}>
              {metrics.map((m) => (
                <div key={m.name} style={{ padding: "0.8rem 1rem", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", borderLeft: `3px solid ${m.color}` }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: m.color, marginBottom: "0.2rem" }}>{m.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-2)", marginBottom: "0.15rem" }}>{m.full}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Good: {m.good}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", fontSize: "0.82rem" }}>
              Also: <strong style={{ color: "var(--text-1)" }}>Navigation timing</strong> (DNS, TCP, TTFB, DOM),{" "}
              <strong style={{ color: "var(--text-1)" }}>JS errors</strong> (stack traces, line numbers),{" "}
              <strong style={{ color: "var(--text-1)" }}>device type</strong> & <strong style={{ color: "var(--text-1)" }}>connection type</strong>.
            </p>
          </div>


          {/* Privacy note */}
          <div className="callout callout-info" style={{ marginBottom: "2rem" }}>
            <span>🔒</span>
            <div>
              <strong>Privacy first.</strong> VitaLens collects only performance timing data, error messages, and device type.
              No personal user data, no cookies, no fingerprinting. Compliant with GDPR by design.
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-primary">📊 Open Dashboard</Link>
            <Link href="/demo/fast" className="btn btn-ghost">⚡ See a demo first</Link>
          </div>
        </div>
      </main>
    </>
  );
}
