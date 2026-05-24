import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VitaLens – AI Performance Monitoring",
  description: "Real User Monitoring with AI-powered analysis. Add one script, get Core Web Vitals, errors, and AI-powered code fixes.",
};

const features = [
  { 
    step: "1", 
    color: "#2563eb",
    bgGradient: "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>, 
    title: "Performance Data Collection", 
    desc: "Inject a lightweight script that passively captures real user Core Web Vitals (LCP, CLS, INP, TTFB) and JS errors without affecting UX." 
  },
  { 
    step: "2", 
    color: "#7c3aed",
    bgGradient: "linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>, 
    title: "Data Transmission",           
    desc: "Collected metrics are securely and asynchronously sent to our robust FastAPI backend using standard APIs." 
  },
  { 
    step: "3", 
    color: "#0d9488",
    bgGradient: "linear-gradient(135deg, #f0fdfa 0%, #99f6e4 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>, 
    title: "Storage & Baselines",         
    desc: "Data is validated and stored with timestamps to build historical baselines and detect performance regressions over time." 
  },
  { 
    step: "4", 
    color: "#db2777",
    bgGradient: "linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, 
    title: "AI-Powered Analysis",         
    desc: "The Core Intelligence Layer performs issue detection, root cause analysis, and multi-session pattern recognition." 
  },
  { 
    step: "5", 
    color: "#ea580c",
    bgGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>, 
    title: "Optimization Suggestions",    
    desc: "AI generates actionable, prioritized recommendations with specific code fixes and estimated impact." 
  },
  { 
    step: "6", 
    color: "#4f46e5",
    bgGradient: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>, 
    title: "Visualization & Alerting",    
    desc: "A clean dashboard visualizes real-time charts, AI insights, and triggers alerts when performance drops below thresholds." 
  },
];



export default function Home() {
  return (
    <>
      <Navbar />

      {/* ── 3D Hero Section ──────────────────────────────────────── */}
      <section className="hero-3d-wrapper" style={{ padding: "8rem 0 6rem", textAlign: "center", minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <div className="hero-gradient-bg" />
        <div className="container" style={{ position: "relative", zIndex: 10 }}>

          <h1 className="animate-up d1 float-anim" style={{ maxWidth: "800px", margin: "0 auto 1.5rem", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1 }}>
            Monitor web performance<br />
            <span className="gradient-text" style={{ textShadow: "0 10px 30px rgba(37,99,235,0.2)" }}>with VitaLens</span>
          </h1>

          <p className="animate-up d2" style={{ maxWidth: "540px", margin: "0 auto 3rem", fontSize: "1.125rem", color: "var(--text-3)", lineHeight: 1.6 }}>
            Paste 2 lines into your site. Get real Core Web Vitals from real users.
            Let our AI detect issues before users complain and generate downloadable action plans.
          </p>

          <div className="animate-up d3" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/demo/fast" className="btn btn-lg glow-btn" style={{ fontSize: "1rem", padding: "0.8rem 2rem", borderRadius: "var(--r-full)" }}>
              Demo Work
            </Link>
            <Link href="/docs" className="btn btn-lg btn-secondary" style={{ fontSize: "1rem", padding: "0.8rem 2rem", borderRadius: "var(--r-full)", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
              Start Work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features (How it works) ──────────────────────────────────── */}
      <section className="section" style={{ position: "relative", zIndex: 5, background: "var(--bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="label" style={{ marginBottom: "0.8rem", fontSize: "0.8rem" }}>Complete Data Flow</div>
            <h2 style={{ fontSize: "2.5rem" }}>How VitaLens Works</h2>
          </div>
          <div className="grid-3" style={{ perspective: "1000px" }}>
            {features.map((f, i) => (
              <div key={f.title} className={`card-3d animate-up d${Math.min(i+1,6)} step-card`} style={{ 
                display: "flex", flexDirection: "column", gap: "1rem", 
                padding: "2.5rem 2rem", position: "relative",
                background: "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "10px 15px 40px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,1)",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}>
                <div style={{ 
                  position: "absolute", top: "-5%", right: "-5%", 
                  fontSize: "12rem", fontWeight: 900, 
                  color: "transparent",
                  WebkitTextStroke: "2px rgba(0,0,0,0.03)",
                  lineHeight: 1,
                  userSelect: "none",
                  zIndex: 0,
                  transition: "all 0.4s ease"
                }} className="step-number">{f.step}</div>
                
                <div style={{ 
                  position: "relative", zIndex: 10,
                  color: f.color, background: f.bgGradient,
                  width: "64px", height: "64px", borderRadius: "18px", 
                  display: "flex", alignItems: "center", justifyContent: "center", 
                  boxShadow: `inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 16px ${f.color}33`,
                  border: "1px solid rgba(255,255,255,0.5)",
                  marginBottom: "0.5rem",
                  transition: "transform 0.4s ease"
                }} className="step-icon-wrap">
                  {f.icon}
                </div>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, position: "relative", zIndex: 10, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{f.title}</h3>
                <p style={{ fontSize: "0.95rem", color: "var(--text-2)", zIndex: 10, position: "relative", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy First ───────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-sub)" }}>
        <div className="container" style={{ maxWidth: "800px", textAlign: "center" }}>
          <div className="label" style={{ marginBottom: "0.8rem", fontSize: "0.8rem" }}>Compliance & Security</div>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>Privacy First. GDPR Compliant by Design.</h2>
          <div className="card-3d" style={{ padding: "3rem 2rem", textAlign: "left", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ fontSize: "2rem", background: "rgba(96, 165, 250, 0.1)", borderRadius: "50%", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}></div>
              <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Deploy for Real Users with Confidence</h3>
                <p style={{ color: "var(--text-2)", lineHeight: 1.6 }}>
                  VitaLens is built from the ground up to respect user privacy. We only collect performance timing data, error messages, and device type.
                </p>
              </div>
            </div>
            
            <div className="divider" />
            
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem", color: "var(--text-1)" }}>
                <span style={{ color: "var(--good)" }}>✓</span> No personal user data (PII) collected
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem", color: "var(--text-1)" }}>
                <span style={{ color: "var(--good)" }}>✓</span> No cookies used or stored
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem", color: "var(--text-1)" }}>
                <span style={{ color: "var(--good)" }}>✓</span> No device fingerprinting
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Guide Script Dashboard Option ──────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div className="hero-gradient-bg" style={{ opacity: 0.5, top: 0, bottom: 0, left: 0, right: 0 }} />
        <div className="container container-sm" style={{ position: "relative", zIndex: 10 }}>
          <div className="card-3d" style={{ padding: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <div className="label" style={{ marginBottom: "0.8rem" }}>2-line integration guide</div>
              <h2 style={{ marginBottom: "1rem", fontSize: "2rem" }}>Add to any site in 60 seconds</h2>
              <p style={{ marginBottom: "2rem", fontSize: "1rem", color: "var(--text-2)" }}>Works with React, Next.js, Vue, Nuxt, plain HTML, or WordPress. No npm install needed.</p>
              <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ borderRadius: "var(--r-full)", padding: "0.75rem 2rem" }}>Go to Dashboard →</Link>
            </div>
            <div className="isometric-container" style={{ margin: 0 }}>
              <div className="isometric-layer code-block" style={{ width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                <div className="code-block-header">
                  <span>HTML — inside &lt;head&gt;</span>
                </div>
                <pre style={{ margin: 0, borderRadius: 0, border: "none", fontSize: "0.85rem", background: "#0d1117" }}>{`<script>
  window.PERF_PROJECT_ID = "proj_...";
  window.PERF_API = "https://your-api.com";
</script>
<script src=".../rum.js" async></script>`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer style={{ padding: "3rem 0", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-1)" }}>
              <div className="logo-mark" style={{ width: "32px", height: "32px", fontSize: "1rem", borderRadius: "10px" }}>VL</div>
              VitaLens
            </div>
            <div style={{ color: "var(--text-4)", fontSize: "0.9rem" }}>Next.js · FastAPI · SQLite · AI</div>
            <div style={{ display: "flex", gap: "2rem" }}>
              {[
                { href: "/demo/fast", label: "Demo Work" },
                { href: "/docs",      label: "Guides" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: "0.95rem", color: "var(--text-3)", fontWeight: 500 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
