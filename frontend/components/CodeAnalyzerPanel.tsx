"use client";

import { useState, useRef } from "react";

interface CodeAnalysisResult {
  performance_score: {
    grade: "Excellent" | "Good" | "Fair" | "Poor";
    problem_areas: string[];
  };
  critical_issues: {
    title: string;
    location: string;
    impact: string;
    explanation: string;
    fix_suggestion: string;
    fix_confidence_score: "High" | "Medium" | "Low";
  }[];
  optimized_code: string;
  additional_recommendations: {
    quick_wins: string[];
    long_term: string[];
    estimated_gain_percent: string;
  };
}

interface CodeAnalyzerPanelProps {
  availableUrls: string[];
}

export default function CodeAnalyzerPanel({ availableUrls }: CodeAnalyzerPanelProps) {
  const [code, setCode] = useState("");
  const [urlContext, setUrlContext] = useState(availableUrls[0] || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please paste or upload some code to analyze.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analyze-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_snippet: code,
          url_filter: urlContext || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleIssue = (index: number) => {
    setExpandedIssues(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="card animate-fade-in" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Code-Level Performance Analysis
            <span className="badge badge-info" style={{ fontSize: "0.65rem" }}>Gemini</span>
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Directly review your JS/React/Vue code and get line-level performance improvements.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {availableUrls.length > 0 && (
            <select 
              value={urlContext} 
              onChange={(e) => setUrlContext(e.target.value)}
              style={{
                padding: "0.5rem", borderRadius: "var(--radius-sm)", 
                background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", 
                color: "var(--text-primary)", fontSize: "0.85rem"
              }}
            >
              <option value="">All Pages Context</option>
              {availableUrls.map(url => <option key={url} value={url}>{url}</option>)}
            </select>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".js,.jsx,.ts,.tsx,.vue,.html" 
            style={{ display: "none" }} 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>
            Upload File
          </button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={isAnalyzing || !code.trim()}>
            {isAnalyzing ? <><span className="animate-spin">⟳</span> Analyzing...</> : "Analyze Code"}
          </button>
        </div>
      </div>

      {error && (
        <div className="callout callout-warning" style={{ marginBottom: "1.5rem" }}>
          Warning: {error}
        </div>
      )}

      {/* Input Section */}
      {!result && !isAnalyzing && (
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your React/Next.js/Vue component here...&#10;// Example:&#10;export default function HeavyComponent() { ... }"
            style={{
              width: "100%", height: "400px", padding: "1rem", 
              fontFamily: "monospace", fontSize: "0.85rem", 
              background: "rgba(0,0,0,0.3)", color: "var(--text-primary)", 
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              resize: "vertical"
            }}
            spellCheck="false"
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--text-muted)" }}>
            <div style={{ textAlign: "center" }}>
              <div className="animate-spin" style={{ fontSize: "3rem", marginBottom: "1rem", display: "inline-block" }}></div>
              <div>Gemini is deeply analyzing your code...</div>
            </div>
          </div>
          <div className="skeleton" style={{ height: "100px", borderRadius: "var(--radius)" }} />
          <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius)" }} />
        </div>
      )}

      {/* Results Section */}
      {result && !isAnalyzing && (
        <div className="animate-fade-scale" style={{ marginTop: "1rem" }}>
          <button 
            className="btn btn-ghost" 
            onClick={() => setResult(null)} 
            style={{ marginBottom: "1.5rem", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
          >
            ← Back to Editor
          </button>

          {/* Grade & Summary */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius)", border: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <span className={`badge badge-${
                  result.performance_score.grade === "Excellent" || result.performance_score.grade === "Good" ? "good" :
                  result.performance_score.grade === "Fair" ? "needs" : "poor"
                }`} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
                  {result.performance_score.grade} Grade
                </span>
                {result.additional_recommendations.estimated_gain_percent && (
                  <span style={{ fontSize: "0.85rem", color: "var(--good)", fontWeight: 600 }}>
                    ~{result.additional_recommendations.estimated_gain_percent} Potential Gain
                  </span>
                )}
              </div>
              
              <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Problem Areas</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {result.performance_score.problem_areas.map((area, i) => (
                  <span key={i} className="badge badge-info">{area}</span>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "250px", borderLeft: "1px solid var(--border)", paddingLeft: "1.5rem" }}>
              <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Quick Wins</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {result.additional_recommendations.quick_wins.map((win, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--accent-teal)" }}></span> {win}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Issues */}
          {result.critical_issues && result.critical_issues.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Critical Code Issues Found ({result.critical_issues.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.critical_issues.map((issue, i) => {
                  const isExpanded = expandedIssues.includes(i);
                  const confColor = issue.fix_confidence_score === "High" ? "var(--good)" : issue.fix_confidence_score === "Medium" ? "var(--needs)" : "var(--poor)";
                  
                  return (
                    <div key={i} className="card" style={{ padding: "1.25rem", borderLeft: `3px solid ${confColor}` }}>
                      <div 
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                        onClick={() => toggleIssue(i)}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                            <h5 style={{ margin: 0, fontSize: "1rem" }}>{issue.title}</h5>
                            <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                              {issue.location}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                            {issue.explanation}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", color: confColor, border: `1px solid ${confColor}`, padding: "0.2rem 0.5rem", borderRadius: "12px", whiteSpace: "nowrap" }}>
                            {issue.fix_confidence_score} Confidence
                          </span>
                          <span style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="animate-fade-in" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 700 }}>Impact</div>
                              <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{issue.impact}</div>
                            </div>
                            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 700 }}>Fix Suggestion</div>
                              <div style={{ fontSize: "0.85rem", color: "var(--accent-blue)" }}>{issue.fix_suggestion}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Before / After Comparison */}
          {result.optimized_code && (
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ marginBottom: "1rem" }}>Optimized Code</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ flex: 1, background: "#1e1e1e", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--good)" }}>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.5)", fontSize: "0.75rem", color: "var(--good)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span></span> AI Improved Version
                  </div>
                  <pre style={{ padding: "1rem", margin: 0, overflowX: "auto", fontSize: "0.85rem", lineHeight: 1.6, color: "#d4d4d4" }}>
                    {result.optimized_code}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
