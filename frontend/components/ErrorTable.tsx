"use client";

interface JsError {
  id: number;
  timestamp: string;
  url: string;
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  user_agent?: string;
}

interface ErrorTableProps {
  errors: JsError[];
}

export default function ErrorTable({ errors }: ErrorTableProps) {
  if (!errors || errors.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></div>
        <div style={{ fontWeight: 600, color: "var(--good)" }}>No errors recorded</div>
        <div style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Visit the Error Demo page to simulate JS errors</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Error Message</th>
            <th>Source</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((err) => (
            <tr key={err.id} className="animate-fade-in">
              <td style={{ whiteSpace: "nowrap", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {new Date(err.timestamp).toLocaleTimeString()}
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "var(--poor)", flexShrink: 0 }}>●</span>
                  <div>
                    <div style={{ color: "var(--poor)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                      {err.message.length > 80 ? err.message.slice(0, 80) + "…" : err.message}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {err.url}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                {err.source ? (
                  <code style={{ fontSize: "0.75rem", maxWidth: "200px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {err.source.split("/").slice(-2).join("/")}
                  </code>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>unknown</span>
                )}
              </td>
              <td>
                {err.lineno != null ? (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    L{err.lineno}{err.colno != null ? `:${err.colno}` : ""}
                  </span>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
