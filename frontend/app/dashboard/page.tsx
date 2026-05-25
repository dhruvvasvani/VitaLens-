"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import MetricCard from "@/components/MetricCard";
const TrendChart = dynamic(() => import("@/components/TrendChart"), { ssr: false });
import AIInsightsPanel from "@/components/AIInsightsPanel";
import ErrorTable from "@/components/ErrorTable";
const CWVRadar = dynamic(() => import("@/components/CWVRadar"), { ssr: false });
const HourlyChart = dynamic(() => import("@/components/HourlyChart"), { ssr: false });
import BudgetPanel from "@/components/BudgetPanel";
import AlertsPanel from "@/components/AlertsPanel";
const WaterfallChart = dynamic(() => import("@/components/WaterfallChart"), { ssr: false });
import LiveFeed from "@/components/LiveFeed";
import CodeAnalyzerPanel from "@/components/CodeAnalyzerPanel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const METRIC_CONFIG: Record<string, {
  label: string; unit: string; goodThreshold: number; poorThreshold: number; color: string;
}> = {
  LCP:  { label: "Largest Contentful Paint",  unit: "ms", goodThreshold: 2500,  poorThreshold: 4000,  color: "#60a5fa" },
  CLS:  { label: "Cumulative Layout Shift",   unit: "",   goodThreshold: 0.1,   poorThreshold: 0.25,  color: "#a78bfa" },
  INP:  { label: "Interaction to Next Paint", unit: "ms", goodThreshold: 200,   poorThreshold: 500,   color: "#2dd4bf" },
  TTFB: { label: "Time to First Byte",        unit: "ms", goodThreshold: 800,   poorThreshold: 1800,  color: "#4ade80" },
  FCP:  { label: "First Contentful Paint",    unit: "ms", goodThreshold: 1800,  poorThreshold: 3000,  color: "#fbbf24" },
};

type TabId = "overview" | "trends" | "waterfall" | "budgets" | "alerts" | "ai" | "code";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "trends",     label: "Trends" },
  { id: "waterfall",  label: "Waterfall" },
  { id: "budgets",    label: "Budgets" },
  { id: "alerts",     label: "Alerts" },
  { id: "ai",         label: "AI Agent Analysis" },
  { id: "code",       label: "Code Analyzer" },
];

// Empty State component for new users
function GettingStarted() {
  const steps = [
    {
      num: "1",
      icon: "",
      title: "Demo Work",
      desc: "Click one of the demo links below. The RUM script will auto-run in your browser and start collecting performance data.",
      links: [
        { href: "/demo/fast",   label: "Fast Demo",  style: "glow-btn" },
      ],
    },
    {
      num: "2",
      icon: "",
      title: "Start Work",
      desc: "Integrate the script into your own site, or if you already have data, run an AI Analysis.",
      links: [
        { href: "/docs", label: "Get Script", style: "btn-primary" }
      ],
    },
    {
      num: "3",
      icon: "",
      title: "Run AI Analysis",
      desc: "Click \u2018Analyze with AI\u2019 (top right). Gemini reads all your metrics and gives you expert-level recommendations and code fixes.",
      note: "Requires a valid GEMINI_API_KEY in backend/.env",
      links: [],
    },
  ];

  return (
    <div className="animate-fade-in" style={{ marginTop: "2rem", position: "relative" }}>
      {/* Banner */}
      <div className="card-3d" style={{
        padding: "3rem 2rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        flexWrap: "wrap",
        overflow: "hidden",
        position: "relative"
      }}>
        <div className="hero-gradient-bg" style={{ opacity: 0.6 }} />

        <div style={{ flex: 1, minWidth: "250px", zIndex: 10 }}>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", fontWeight: 800 }}>No initialization of work done</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px" }}>
            You have two options: click <b>Demo Work</b> to generate sample data, or <b>Start Work</b> to integrate our 2-line snippet into your application.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", zIndex: 10 }}>
          <Link href="/demo/fast" className="btn btn-lg glow-btn" style={{ borderRadius: "var(--r-full)" }}>Demo Work</Link>
          <Link href="/docs" className="btn btn-lg btn-secondary" style={{ borderRadius: "var(--r-full)" }}>Start Work</Link>
        </div>
      </div>

      {/* Steps */}
      <div className="grid-3" style={{ perspective: "1000px" }}>
        {steps.map((step, i) => (
          <div key={step.num} className={`card-3d animate-up d${i+1}`} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="step-num" style={{ width: "32px", height: "32px", fontSize: "0.85rem", background: "var(--blue)", color: "white", border: "none" }}>{step.num}</div>

              <h3 style={{ fontSize: "1.1rem" }}>{step.title}</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65 }}>
              {step.desc}
            </p>
            {step.note && (
              <div className="callout callout-warning" style={{ fontSize: "0.8rem", padding: "0.6rem 0.85rem", marginTop: "0.5rem" }}>
                Note: {step.note}
              </div>
            )}
            {step.links.length > 0 && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "auto", paddingTop: "1rem" }}>
                {step.links.map((l) => (
                  <a key={l.href} href={l.href} className={`btn ${l.style}`} style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem", borderRadius: "var(--r-full)" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Header Stats component showing connection and data overview
function HeaderStats({ totalSamples, wsConnected, lastRefresh, alertCount, isRefreshing }: any) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className="live-dot" style={{ background: wsConnected ? "var(--good)" : "var(--text-muted)" }} />
        <span style={{ fontSize: "0.78rem", color: wsConnected ? "var(--good)" : "var(--text-muted)", fontWeight: 500 }}>
          {wsConnected ? "WebSocket live" : "Polling 30s"}
        </span>
      </div>
      <div style={{ width: "1px", height: "14px", background: "var(--border)" }} />
      <span suppressHydrationWarning style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
        Updated {lastRefresh.toLocaleTimeString()}
      </span>
      {totalSamples > 0 && (
        <>
          <div style={{ width: "1px", height: "14px", background: "var(--border)" }} />
          <span className="badge badge-info">{totalSamples.toLocaleString()} samples</span>
        </>
      )}
      {alertCount > 0 && (
        <>
          <div style={{ width: "1px", height: "14px", background: "var(--border)" }} />
          <span className="badge badge-critical">{alertCount} alert{alertCount > 1 ? "s" : ""}</span>
        </>
      )}
    </div>
  );
}

// Main Dashboard view
export default function Dashboard() {
  const [summary, setSummary]               = useState<any>(null);
  const [analysis, setAnalysis]             = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [lastAnalyzed, setLastAnalyzed]     = useState<string>();
  const [activeTab, setActiveTab]           = useState<TabId>("overview");
  const [selectedHourlyMetric, setSelectedHourlyMetric] = useState("LCP");
  const [lastRefresh, setLastRefresh]       = useState(new Date());
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [liveEvents, setLiveEvents]         = useState<any[]>([]);
  const [wsConnected, setWsConnected]       = useState(false);
  const [codeFix, setCodeFix]               = useState<{ metric: string; content: string } | null>(null);
  const [loadingCodeFix, setLoadingCodeFix] = useState(false);
  const [alertCount, setAlertCount]         = useState(0);
  const liveRef = useRef<any[]>([]);

  const fetchSummary = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API}/api/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setAlertCount(data.alerts?.length || 0);
      }
    } catch (_) {}
    setIsRefreshing(false);
    setLastRefresh(new Date());
  }, []);

  const fetchLatestAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/analysis/latest`);
      if (res.ok) {
        const data = await res.json();
        if (data) { setAnalysis(data.analysis); setLastAnalyzed(data.timestamp); }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
    fetchLatestAnalysis();
    const timer = setInterval(fetchSummary, 30_000);
    return () => clearInterval(timer);
  }, [fetchSummary, fetchLatestAnalysis]);

  const handleLiveEvent = useCallback((event: any) => {
    if (event.type === "analysis_complete") { fetchLatestAnalysis(); return; }
    setWsConnected(true);
    const newEvent = { ...event, ts: new Date().toLocaleTimeString() };
    liveRef.current = [newEvent, ...liveRef.current].slice(0, 20);
    setLiveEvents([...liveRef.current]);
    if (event.type === "bulk") fetchSummary();
  }, [fetchSummary, fetchLatestAnalysis]);

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setActiveTab("ai");
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_filter: null }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setLastAnalyzed(new Date().toISOString());
      } else {
        const err = await res.json();
        alert(err.detail || "Analysis failed");
      }
    } catch {
      alert("Cannot reach backend. Is the FastAPI server running on port 8000?");
    }
    setLoadingAnalysis(false);
  };

  const handleGetCodeFix = async (metricName: string) => {
    const m = (summary?.aggregated || []).find((a: any) => a.metric_name === metricName);
    if (!m) return;
    setLoadingCodeFix(true);
    setCodeFix(null);
    try {
      const res = await fetch(`${API}/api/code-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric_name: metricName, avg_value: m.avg_value, context: "Next.js 14 App Router" }),
      });
      if (res.ok) { const data = await res.json(); setCodeFix({ metric: metricName, content: data.fix }); }
    } catch (_) {}
    setLoadingCodeFix(false);
  };

  const handleUpdateBudget = async (metricName: string, value: number) => {
    await fetch(`${API}/api/budgets`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric_name: metricName, budget_value: value }),
    });
    fetchSummary();
  };

  const handleAcknowledgeAlert = async (id: number) => {
    await fetch(`${API}/api/alerts/${id}/acknowledge`, { method: "POST" });
    fetchSummary();
  };

  const metricMap: Record<string, any> = {};
  if (summary?.aggregated) {
    for (const m of summary.aggregated) metricMap[m.metric_name] = m;
  }

  const totalSamples = Object.values(metricMap).reduce((acc: number, m: any) => acc + (m?.sample_count || 0), 0);
  const hasData = totalSamples > 0;

  return (
    <>
      <Navbar />
      <LiveFeed onEvent={handleLiveEvent} />

      <div className="container" style={{ paddingTop: "1.75rem", paddingBottom: "4rem" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Performance Dashboard
            </h1>
            <HeaderStats
              totalSamples={totalSamples}
              wsConnected={wsConnected}
              lastRefresh={lastRefresh}
              alertCount={alertCount}
              isRefreshing={isRefreshing}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              className={`btn btn-ghost ${isRefreshing ? "animate-pulse" : ""}`}
              onClick={fetchSummary}
              disabled={isRefreshing}
              style={{ fontSize: "0.82rem" }}
            >
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loadingAnalysis || !hasData}
              style={{ fontSize: "0.82rem" }}
              title={!hasData ? "Visit a demo page first to generate data" : ""}
            >
              {loadingAnalysis ? "Analyzing…" : "Analyze with AI"}
            </button>
          </div>
        </div>

        {/* Empty state fallback */}
        {!hasData && <GettingStarted />}

        {/* Navigation Tabs */}
        {hasData && (
          <>
            <div className="tab-bar" style={{ marginBottom: "1.5rem", overflowX: "auto" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ position: "relative" }}
                >

                  <span>{tab.label}</span>
                  {tab.id === "alerts" && alertCount > 0 && (
                    <span style={{
                      background: "var(--poor)", color: "#fff",
                      borderRadius: "50%", width: "16px", height: "16px",
                      fontSize: "0.6rem", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, marginLeft: "2px",
                    }}>
                      {alertCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="animate-fade-in">
                {/* Metric Cards */}
                <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
                  {Object.entries(METRIC_CONFIG).map(([name, cfg], i) => {
                    const m = metricMap[name];
                    return (
                      <div key={name} className={`delay-${i + 1}`}>
                        <MetricCard
                          name={name} label={cfg.label}
                          avgValue={m?.avg_value ?? null} unit={cfg.unit}
                          goodThreshold={cfg.goodThreshold} poorThreshold={cfg.poorThreshold}
                          sampleCount={m?.sample_count ?? 0}
                          goodCount={m?.good_count ?? 0}
                          needsCount={m?.needs_improvement_count ?? 0}
                          poorCount={m?.poor_count ?? 0}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Radar + Live Feed */}
                <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                  <div className="card animate-fade-in">
                    <h3 style={{ marginBottom: "1rem" }}>CWV Score Radar</h3>
                    <CWVRadar aggregated={summary?.aggregated || []} />
                  </div>

                  <div className="card animate-fade-in">
                    <h3 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
                      <span className="live-dot" />
                      Live Event Feed
                      {liveEvents.length > 0 && (
                        <span className="badge badge-info">{liveEvents.length}</span>
                      )}
                    </h3>
                    {liveEvents.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>

                        <div style={{ fontWeight: 500, marginBottom: "0.3rem" }}>Waiting for live events</div>
                        <div style={{ fontSize: "0.75rem" }}>Visit a demo page to stream metrics</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "230px", overflowY: "auto" }}>
                        {liveEvents.map((ev, i) => (
                          <div key={i} className="animate-fade-in" style={{
                            display: "flex", alignItems: "center", gap: "0.6rem",
                            padding: "0.45rem 0.7rem",
                            background: "rgba(255,255,255,0.025)",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            border: "1px solid var(--border)",
                          }}>
                            <span>{ev.type === "error" ? "Error:" : "Event:"}</span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {ev.metric_name || ev.message?.slice(0, 30)}
                            </span>
                            {ev.value != null && (
                              <span style={{ color: ev.rating === "good" ? "var(--good)" : ev.rating === "poor" ? "var(--poor)" : "var(--needs)" }}>
                                {ev.value.toFixed(ev.metric_name === "CLS" ? 3 : 0)}{ev.metric_name !== "CLS" ? "ms" : ""}
                              </span>
                            )}
                            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.72rem" }}>{ev.ts}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hourly Chart + Errors */}
                <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                  <div className="card animate-fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "1rem" }}>24h Hourly Average</h3>
                      <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "2px" }}>
                        {["LCP", "INP", "TTFB", "CLS", "FCP"].map((m) => (
                          <button key={m}
                            onClick={() => setSelectedHourlyMetric(m)}
                            style={{
                              padding: "0.2rem 0.5rem",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "var(--font)",
                              background: selectedHourlyMetric === m ? "var(--bg-card)" : "transparent",
                              color: selectedHourlyMetric === m ? "var(--text-primary)" : "var(--text-muted)",
                              transition: "all 0.15s",
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <HourlyChart data={summary?.hourly_stats || []} selectedMetric={selectedHourlyMetric} />
                  </div>

                  <div className="card animate-fade-in">
                    <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1rem" }}>
                      JS Errors
                      {(summary?.errors?.length || 0) > 0 && (
                        <span className="badge badge-critical">{summary.errors.length}</span>
                      )}
                    </h3>
                    <ErrorTable errors={summary?.errors || []} />
                  </div>
                </div>

                {/* Per-Page Breakdown */}
                {(summary?.page_breakdown?.length || 0) > 0 && (
                  <div className="card animate-fade-in">
                    <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Per-Page Breakdown</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>URL</th>
                            <th>Metric</th>
                            <th>Avg Value</th>
                            <th>Samples</th>
                            <th>Poor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.page_breakdown.slice(0, 15).map((row: any, i: number) => (
                            <tr key={i}>
                              <td style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                                {row.url}
                              </td>
                              <td><code>{row.metric_name}</code></td>
                              <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.avg_value?.toFixed?.(2)}</td>
                              <td>{row.count}</td>
                              <td>
                                {row.poor_count > 0
                                  ? <span className="badge badge-poor">{row.poor_count}</span>
                                  : <span style={{ color: "var(--good)", fontSize: "0.8rem" }}>✓ 0</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === "trends" && (
              <div className="animate-fade-in">
                <div className="grid-2">
                  {(["LCP", "INP", "TTFB", "CLS", "FCP"] as const).map((name) => {
                    const cfg = METRIC_CONFIG[name];
                    return (
                      <div key={name} className="card animate-fade-in">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                          <div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{name}</div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cfg.label}</div>
                          </div>
                          {metricMap[name] && (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}
                              onClick={() => handleGetCodeFix(name)}
                              disabled={loadingCodeFix}
                            >
                              {loadingCodeFix && codeFix === null ? (
                                <svg className="animate-spin" style={{ width: "12px", height: "12px", display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"></circle>
                                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : "Fix"}
                            </button>
                          )}
                        </div>
                        <TrendChart
                          metricName={name}
                          data={summary?.trends?.[name] || []}
                          goodThreshold={cfg.goodThreshold}
                          poorThreshold={cfg.poorThreshold}
                          unit={cfg.unit}
                          color={cfg.color}
                        />
                      </div>
                    );
                  })}
                </div>

                {codeFix && (
                  <div className="card animate-fade-scale" style={{ marginTop: "1.5rem", borderColor: "var(--border-accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3>AI Code Fix — {codeFix.metric}</h3>
                      <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => setCodeFix(null)}>✕ Close</button>
                    </div>
                    <pre style={{ fontSize: "0.8rem", lineHeight: 1.7, maxHeight: "400px", overflowY: "auto" }}>
                      {codeFix.content}
                    </pre>
                  </div>
                )}

                {(summary?.device_breakdown?.length || 0) > 0 && (
                  <div className="card animate-fade-in" style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Device Breakdown</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead><tr><th>Device</th><th>Metric</th><th>Avg</th><th>Samples</th></tr></thead>
                        <tbody>
                          {summary.device_breakdown.map((d: any, i: number) => (
                            <tr key={i}>
                              <td style={{ textTransform: "capitalize", fontWeight: 500 }}>{d.device_type}</td>
                              <td><code>{d.metric_name}</code></td>
                              <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.avg_value?.toFixed?.(2)}</td>
                              <td>{d.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Waterfall Tab */}
            {activeTab === "waterfall" && (
              <div className="animate-fade-in">
                <div className="card">
                  <div style={{ marginBottom: "1.25rem" }}>
                    <h3 style={{ marginBottom: "0.3rem" }}>Navigation Timing Waterfall</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Full request lifecycle — DNS → TCP → SSL → TTFB → DOM → Load
                    </p>
                  </div>
                  <WaterfallChart timing={summary?.navigation?.[0] || null} />
                </div>

                {(summary?.navigation?.length || 0) > 1 && (
                  <div className="card" style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Recent Navigation Records</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead><tr><th>URL</th><th>TTFB</th><th>DOM Ready</th><th>Load Time</th><th>Transfer</th></tr></thead>
                        <tbody>
                          {summary.navigation.map((n: any, i: number) => (
                            <tr key={i}>
                              <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{n.url}</td>
                              <td>{n.ttfb ? `${Math.round(n.ttfb)}ms` : "—"}</td>
                              <td>{n.dom_interactive ? `${Math.round(n.dom_interactive)}ms` : "—"}</td>
                              <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{n.load_event ? `${Math.round(n.load_event)}ms` : "—"}</td>
                              <td>{n.transfer_size ? `${(n.transfer_size / 1024).toFixed(1)} KB` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Budgets Tab */}
            {activeTab === "budgets" && (
              <div className="animate-fade-in">
                <BudgetPanel
                  budgets={summary?.budgets || []}
                  aggregated={summary?.aggregated || []}
                  onUpdate={handleUpdateBudget}
                />
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === "alerts" && (
              <div className="animate-fade-in">
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3>Budget Violation Alerts</h3>
                    {alertCount > 0 && (
                      <span className="badge badge-critical">{alertCount} unacknowledged</span>
                    )}
                  </div>
                  <AlertsPanel alerts={summary?.alerts || []} onAcknowledge={handleAcknowledgeAlert} />
                </div>
              </div>
            )}

            {/* AI Agent Tab */}
            {activeTab === "ai" && (
              <div className="animate-fade-in">
                <AIInsightsPanel
                  analysis={analysis}
                  isLoading={loadingAnalysis}
                  onAnalyze={handleAnalyze}
                  lastAnalyzed={lastAnalyzed}
                />
              </div>
            )}

            {/* Code Analyzer Tab */}
            {activeTab === "code" && (
              <div className="animate-fade-in">
                <CodeAnalyzerPanel
                  availableUrls={summary?.page_breakdown?.map((p: any) => p.url) || []}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
