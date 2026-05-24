/**
 * PerfAgent RUM v2 – Real User Monitoring Script
 * Captures: Core Web Vitals, Navigation Timing, Resource Timing, JS Errors, Device info
 */

import { onLCP, onCLS, onINP, onTTFB, onFCP, type Metric } from "web-vitals";

const API_BASE = (typeof window !== "undefined" && (window as any).PERF_API) || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Session Management ─────────────────────────────────────────────────────────
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("rum_session_id");
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("rum_session_id", sid);
  }
  return sid;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm|smartphone|iemobile/i.test(ua))
    return "mobile";
  return "desktop";
}

function getConnectionType(): string {
  // @ts-ignore
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return conn?.effectiveType || conn?.type || "unknown";
}

// ── Payload Types ──────────────────────────────────────────────────────────────
interface MetricPayload {
  session_id: string;
  url: string;
  metric_name: string;
  value: number;
  user_agent: string;
  device_type: string;
  connection_type: string;
  page_context?: string;
}

interface ErrorPayload {
  session_id: string;
  url: string;
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  user_agent: string;
}

interface NavigationTimingPayload {
  session_id: string;
  url: string;
  dns_time?: number;
  tcp_time?: number;
  ssl_time?: number;
  ttfb?: number;
  response_time?: number;
  dom_interactive?: number;
  dom_complete?: number;
  load_event?: number;
  redirect_count?: number;
  transfer_size?: number;
  encoded_body_size?: number;
}

// ── Batching Queue ─────────────────────────────────────────────────────────────
const metricQueue: MetricPayload[] = [];
const errorQueue: ErrorPayload[] = [];
let navTimingPayload: NavigationTimingPayload | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
}

async function flush() {
  if (metricQueue.length === 0 && errorQueue.length === 0 && !navTimingPayload) return;

  const metricsToSend = [...metricQueue];
  const errorsToSend = [...errorQueue];
  const navTiming = navTimingPayload;
  metricQueue.length = 0;
  errorQueue.length = 0;
  navTimingPayload = null;

  try {
    await fetch(`${API_BASE}/api/performance/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metrics: metricsToSend,
        errors: errorsToSend,
        navigation_timing: navTiming,
      }),
      keepalive: true,
    });
  } catch (err) {
    console.debug("[RUM] Flush failed:", err);
  }
}

// ── Core Web Vitals ────────────────────────────────────────────────────────────
function queueMetric(name: string, value: number) {
  if (typeof window === "undefined") return;
  metricQueue.push({
    session_id: getSessionId(),
    url: window.location.href,
    metric_name: name,
    value: parseFloat(value.toFixed(3)),
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    connection_type: getConnectionType(),
    page_context: document.title,
  });
  scheduleFlush();
}

// ── Navigation Timing API ──────────────────────────────────────────────────────
function captureNavigationTiming() {
  if (typeof window === "undefined" || !performance?.getEntriesByType) return;

  const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (!entries.length) return;

  const nav = entries[0];
  const origin = nav.startTime;

  navTimingPayload = {
    session_id: getSessionId(),
    url: window.location.href,
    dns_time: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
    tcp_time: Math.round(nav.connectEnd - nav.connectStart),
    ssl_time: nav.secureConnectionStart > 0
      ? Math.round(nav.connectEnd - nav.secureConnectionStart)
      : 0,
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    response_time: Math.round(nav.responseEnd - nav.responseStart),
    dom_interactive: Math.round(nav.domInteractive - origin),
    dom_complete: Math.round(nav.domComplete - origin),
    load_event: Math.round(nav.loadEventEnd - origin),
    redirect_count: nav.redirectCount,
    transfer_size: nav.transferSize,
    encoded_body_size: nav.encodedBodySize,
  };
}

// ── Resource Timing ────────────────────────────────────────────────────────────
function captureResourceTiming() {
  if (typeof window === "undefined" || !performance?.getEntriesByType) return;

  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const totalTransferSize = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
  const slowResources = resources.filter(r => r.duration > 500);

  if (totalTransferSize > 0) {
    queueMetric("RESOURCE_SIZE_KB", Math.round(totalTransferSize / 1024));
  }
  if (slowResources.length > 0) {
    queueMetric("SLOW_RESOURCES_COUNT", slowResources.length);
  }
}

// ── Error Capture ──────────────────────────────────────────────────────────────
function queueError(message: string, source?: string, lineno?: number, colno?: number, stack?: string) {
  if (typeof window === "undefined") return;
  errorQueue.push({
    session_id: getSessionId(),
    url: window.location.href,
    message,
    source,
    lineno,
    colno,
    stack,
    user_agent: navigator.userAgent,
  });
  scheduleFlush();
}

// ── WebSocket Live Feed ────────────────────────────────────────────────────────
let ws: WebSocket | null = null;

function connectWebSocket(onEvent: (event: any) => void) {
  const wsUrl = API_BASE.replace("http://", "ws://").replace("https://", "wss://");
  ws = new WebSocket(`${wsUrl}/ws/live`);

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type !== "ping") onEvent(data);
    } catch {}
  };

  ws.onclose = () => {
    // Reconnect after 3 seconds
    setTimeout(() => connectWebSocket(onEvent), 3000);
  };

  return ws;
}

function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

// ── Main Initializer ──────────────────────────────────────────────────────────
export function initRUM() {
  if (typeof window === "undefined") return;

  // Core Web Vitals
  onLCP((m: Metric) => queueMetric("LCP", m.value));
  onCLS((m: Metric) => queueMetric("CLS", m.value));
  onINP((m: Metric) => queueMetric("INP", m.value));
  onTTFB((m: Metric) => queueMetric("TTFB", m.value));
  onFCP((m: Metric) => queueMetric("FCP", m.value));

  // Navigation Timing + Resource Timing (after load)
  window.addEventListener("load", () => {
    queueMetric("LOAD_TIME", Math.round(performance.now()));
    // Give browser time to finalize navigation entries
    setTimeout(() => {
      captureNavigationTiming();
      captureResourceTiming();
      scheduleFlush();
    }, 100);
  });

  // JS error capture
  const originalOnError = window.onerror;
  window.onerror = function (msg, src, line, col, err) {
    queueError(String(msg), src, line, col, err?.stack);
    if (originalOnError) return originalOnError.apply(this, arguments as any);
    return false;
  };

  window.addEventListener("unhandledrejection", (e) => {
    const err = e.reason;
    queueError(
      err?.message || String(err),
      undefined, undefined, undefined,
      err?.stack,
    );
  });

  // Flush on page hide
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("beforeunload", flush);

  console.debug("[RUM v2] Initialized – session:", getSessionId());
}

export { connectWebSocket, disconnectWebSocket, getSessionId };
