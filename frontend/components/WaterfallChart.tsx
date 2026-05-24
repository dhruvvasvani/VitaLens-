"use client";

interface NavTiming {
  dns_time?: number;
  tcp_time?: number;
  ssl_time?: number;
  ttfb?: number;
  response_time?: number;
  dom_interactive?: number;
  dom_complete?: number;
  load_event?: number;
  transfer_size?: number;
  encoded_body_size?: number;
}

interface WaterfallProps {
  timing: NavTiming | null;
}

interface WaterfallBar {
  label: string;
  value: number;
  color: string;
  icon: string;
  start: number;
}

export default function WaterfallChart({ timing }: WaterfallProps) {
  if (!timing || !timing.load_event) {
    return (
      <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}></div>
          Navigation timing data will appear after page load
        </div>
      </div>
    );
  }

  const total = timing.load_event || 1;

  // Sequential waterfall phases
  const phases: WaterfallBar[] = [
    { label: "DNS Lookup",    value: timing.dns_time || 0,      color: "#9f7aea", icon: "", start: 0 },
    { label: "TCP Connect",   value: timing.tcp_time || 0,      color: "#63b3ed", icon: "", start: (timing.dns_time || 0) },
    { label: "SSL/TLS",       value: timing.ssl_time || 0,      color: "#4fd1c5", icon: "", start: (timing.dns_time || 0) + (timing.tcp_time || 0) },
    { label: "TTFB",          value: timing.ttfb || 0,          color: "#f6ad55", icon: "", start: (timing.dns_time || 0) + (timing.tcp_time || 0) + (timing.ssl_time || 0) },
    { label: "Response",      value: timing.response_time || 0, color: "#68d391", icon: "", start: (timing.dns_time || 0) + (timing.tcp_time || 0) + (timing.ssl_time || 0) + (timing.ttfb || 0) },
    { label: "DOM Build",     value: (timing.dom_complete || 0) - (timing.dom_interactive || 0), color: "#fc8181", icon: "", start: timing.dom_interactive || 0 },
  ].filter(p => p.value > 0);

  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {phases.map((phase) => {
          const widthPct = Math.min((phase.value / total) * 100, 100);
          const startPct = Math.min((phase.start / total) * 100, 100 - widthPct);

          return (
            <div key={phase.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr 55px", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                <span>{phase.icon}</span>
                <span>{phase.label}</span>
              </div>
              <div style={{ height: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute",
                  left: `${startPct}%`,
                  width: `${Math.max(widthPct, 1)}%`,
                  height: "100%",
                  background: phase.color,
                  opacity: 0.85,
                  borderRadius: "3px",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: phase.color, textAlign: "right" }}>
                {fmt(phase.value)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
        {[
          { label: "Total Load", value: fmt(timing.load_event || 0), color: "var(--accent-blue)" },
          { label: "DOM Ready",  value: fmt(timing.dom_interactive || 0), color: "var(--accent-teal)" },
          { label: "Transfer",   value: timing.transfer_size ? `${(timing.transfer_size / 1024).toFixed(1)} KB` : "—", color: "var(--accent-purple)" },
          { label: "Body Size",  value: timing.encoded_body_size ? `${(timing.encoded_body_size / 1024).toFixed(1)} KB` : "—", color: "var(--text-secondary)" },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
