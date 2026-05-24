"use client";

import { useState } from "react";

interface Issue {
  severity: "critical" | "warning" | "info";
  metric: string;
  title: string;
  description: string;
  impact?: string;
  code_example?: string | null;
  recommendations: string[];
}

interface ScoreBreakdown {
  lcp_score: number;
  cls_score: number;
  inp_score: number;
  ttfb_score: number;
}

interface AnalysisData {
  overall_score: number;
  overall_rating: string;
  summary: string;
  issues: Issue[];
  quick_wins: string[];
  regression_detected: boolean;
  regression_details: string | null;
  performance_score_breakdown?: ScoreBreakdown;
  next_steps?: string[];
}

interface AIInsightsPanelProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
  onAnalyze: () => void;
  lastAnalyzed?: string;
}

function ScoreRing({ score, rating }: { score: number; rating: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  const color =
    rating === "excellent" || rating === "good" ? "#68d391" :
    rating === "needs-improvement" ? "#f6ad55" : "#fc8181";

  return (
    <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color,
      }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Score</span>
      </div>
    </div>
  );
}

function IssueItem({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass =
    issue.severity === "critical" ? "badge-critical" :
    issue.severity === "warning" ? "badge-warning" : "badge-info";

  const icon = issue.severity === "critical" ? "!" : issue.severity === "warning" ? "!" : "i";

  return (
    <div
      className="card"
      style={{ cursor: "pointer", marginBottom: "0.75rem", padding: "1rem" }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
              <span className={`badge ${badgeClass}`}>{issue.severity}</span>
              <code style={{ fontSize: "0.75rem" }}>{issue.metric}</code>
              {issue.impact && (
                <span style={{ fontSize: "0.7rem", color: "var(--accent-teal)", fontStyle: "italic" }}>{issue.impact}</span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{issue.title}</div>
          </div>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "1rem", flexShrink: 0, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>›</span>
      </div>

      {expanded && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.6 }}>
            {issue.description}
          </p>

          {issue.code_example && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-teal)", marginBottom: "0.4rem" }}>Code Example</div>
              <pre style={{
                background: "rgba(0,0,0,0.4)", borderRadius: "var(--radius-sm)",
                padding: "0.75rem", fontSize: "0.78rem", overflowX: "auto",
                color: "var(--accent-teal)", border: "1px solid var(--border)",
                whiteSpace: "pre-wrap", lineHeight: 1.6,
              }}>{issue.code_example}</pre>
            </div>
          )}

          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Recommendations
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {issue.recommendations.map((rec, i) => (
              <li key={i} style={{ display: "flex", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent-teal)", flexShrink: 0 }}>→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AIInsightsPanel({ analysis, isLoading, onAnalyze, lastAnalyzed }: AIInsightsPanelProps) {
  const handleDownloadPDF = async () => {
    const element = document.getElementById("ai-insights-report");
    if (!element) return;
    
    // Dynamically import html2pdf.js to avoid SSR issues
    const html2pdf = (await import("html2pdf.js" as any)).default;
    
    const opt = {
      margin:       0.5,
      filename:     'VitaLens_AI_Analysis.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div id="ai-insights-report" className="card" style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span></span> VitaLens AI Performance Report
            <span className="badge badge-info" style={{ fontSize: "0.65rem" }}>Gemini</span>
          </h3>
          {lastAnalyzed && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Last analyzed: {new Date(lastAnalyzed).toLocaleString()}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }} data-html2canvas-ignore="true">
          {analysis && !isLoading && (
            <button
              className="btn btn-secondary"
              onClick={handleDownloadPDF}
              style={{ minWidth: "140px" }}
            >
              Download PDF
            </button>
          )}
          <button
            id="analyze-button"
            className="btn btn-primary"
            onClick={onAnalyze}
            disabled={isLoading}
            style={{ minWidth: "160px" }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" style={{ width: "1rem", height: "1rem", display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>Analyze with AI</>
            )}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="skeleton" style={{ height: "80px", borderRadius: "var(--radius)" }} />
          <div className="skeleton" style={{ height: "60px", borderRadius: "var(--radius)" }} />
          <div className="skeleton" style={{ height: "60px", borderRadius: "var(--radius)" }} />
        </div>
      )}

      {/* No analysis yet */}
      {!isLoading && !analysis && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}></div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Analysis Yet</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "300px", margin: "0 auto" }}>
            Visit the demo pages to generate metrics, then click &quot;Analyze with AI&quot; to get Gemini-powered insights.
          </div>
        </div>
      )}

      {/* Analysis results */}
      {!isLoading && analysis && (
        <div className="animate-fade-scale">
          {/* Summary row */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1.5rem", padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <ScoreRing score={analysis.overall_score} rating={analysis.overall_rating} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className={`badge badge-${
                  analysis.overall_rating === "excellent" || analysis.overall_rating === "good" ? "good" :
                  analysis.overall_rating === "needs-improvement" ? "needs" : "poor"
                }`}>{analysis.overall_rating}</span>
                {analysis.regression_detected && (
                  <span className="badge badge-critical">Regression Detected</span>
                )}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {analysis.summary}
              </p>
              {analysis.regression_details && (
                <p style={{ color: "var(--poor)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  {analysis.regression_details}
                </p>
              )}
            </div>
          </div>

          {/* Quick wins */}
          {analysis.quick_wins && analysis.quick_wins.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "var(--accent-teal)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Quick Wins
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {analysis.quick_wins.map((win, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(79,209,197,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(79,209,197,0.15)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--accent-teal)", flexShrink: 0 }}>✓</span>
                    {win}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          {analysis.performance_score_breakdown && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginBottom: "0.75rem" }}>Score Breakdown</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {Object.entries(analysis.performance_score_breakdown).map(([key, score]) => {
                  const name = key.replace("_score", "").toUpperCase();
                  const s = score as number;
                  const color = s >= 20 ? "var(--good)" : s >= 10 ? "var(--needs)" : "var(--poor)";
                  return (
                    <div key={key} style={{ textAlign: "center", padding: "0.75rem 0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color }}>{s}<span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>/25</span></div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Issues ({analysis.issues.length})
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>— click to expand</span>
              </h4>
              {analysis.issues.map((issue, i) => (
                <IssueItem key={i} issue={issue} />
              ))}
            </div>
          )}

          {/* Next Steps */}
          {analysis.next_steps && analysis.next_steps.length > 0 && (
            <div>
              <h4 style={{ marginBottom: "0.75rem", color: "var(--accent-blue)" }}>Ordered Action Plan</h4>
              <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {analysis.next_steps.map((step: string, i: number) => (
                  <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
