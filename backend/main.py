import os
import json
import asyncio
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from database import (
    init_db, insert_metric, insert_error, insert_navigation_timing,
    get_recent_metrics, get_aggregated_metrics, get_recent_errors,
    get_metric_trend, save_analysis, get_latest_analysis,
    get_navigation_timing, get_budgets, upsert_budget,
    get_alerts, acknowledge_alert, get_hourly_stats,
    get_page_breakdown, get_device_breakdown, get_session_comparison,
)
from ai_engine import analyze_performance, generate_code_fix, rate_metric as ai_rate, analyze_code_with_metrics

load_dotenv()


# â”€â”€ WebSocket Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="VitaLens API v2", version="2.0.0", lifespan=lifespan)

origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validate origin middleware removed for demo purposes (allow all)


# â”€â”€ Models â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class MetricPayload(BaseModel):
    session_id: str
    url: str
    metric_name: str
    value: float
    user_agent: Optional[str] = None
    device_type: Optional[str] = None
    connection_type: Optional[str] = None
    page_context: Optional[str] = None
    extra_data: Optional[dict] = None


class ErrorPayload(BaseModel):
    session_id: str
    url: str
    message: str
    source: Optional[str] = None
    lineno: Optional[int] = None
    colno: Optional[int] = None
    stack: Optional[str] = None
    user_agent: Optional[str] = None


class NavigationTimingPayload(BaseModel):
    session_id: str
    url: str
    dns_time: Optional[float] = None
    tcp_time: Optional[float] = None
    ssl_time: Optional[float] = None
    ttfb: Optional[float] = None
    response_time: Optional[float] = None
    dom_interactive: Optional[float] = None
    dom_complete: Optional[float] = None
    load_event: Optional[float] = None
    redirect_count: Optional[int] = None
    transfer_size: Optional[int] = None
    encoded_body_size: Optional[int] = None


class BulkPayload(BaseModel):
    metrics: list[MetricPayload] = []
    errors: list[ErrorPayload] = []
    navigation_timing: Optional[NavigationTimingPayload] = None


class AnalyzeRequest(BaseModel):
    url_filter: Optional[str] = None


class BudgetUpdate(BaseModel):
    metric_name: str
    budget_value: float


class CodeFixRequest(BaseModel):
    metric_name: str
    avg_value: float
    context: Optional[str] = "Next.js 14 App Router application"


class CodeAnalysisRequest(BaseModel):
    code_snippet: str
    url_filter: Optional[str] = None


# â”€â”€ WebSocket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """Real-time metric streaming endpoint."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.get("/")
async def root():
    return {"status": "ok", "service": "VitaLens API", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/performance")
async def receive_metric(payload: MetricPayload):
    rating = ai_rate(payload.metric_name, payload.value)
    extra = json.dumps(payload.extra_data) if payload.extra_data else None

    await insert_metric(
        session_id=payload.session_id, url=payload.url,
        metric_name=payload.metric_name, value=payload.value,
        rating=rating, user_agent=payload.user_agent,
        device_type=payload.device_type, connection_type=payload.connection_type,
        page_context=payload.page_context, extra_data=extra,
    )

    event = {
        "type": "metric",
        "metric_name": payload.metric_name,
        "value": payload.value,
        "rating": rating,
        "url": payload.url,
        "session_id": payload.session_id,
    }
    await manager.broadcast(event)
    return {"status": "ok", "rating": rating}


@app.post("/api/performance/bulk")
async def receive_bulk(payload: BulkPayload):
    metrics_stored = 0
    errors_stored = 0
    live_events = []

    for m in payload.metrics:
        rating = ai_rate(m.metric_name, m.value)
        extra = json.dumps(m.extra_data) if m.extra_data else None
        await insert_metric(
            session_id=m.session_id, url=m.url,
            metric_name=m.metric_name, value=m.value,
            rating=rating, user_agent=m.user_agent,
            device_type=m.device_type, connection_type=m.connection_type,
            page_context=m.page_context, extra_data=extra,
        )
        metrics_stored += 1
        live_events.append({"type": "metric", "metric_name": m.metric_name,
                            "value": m.value, "rating": rating, "url": m.url})

    for e in payload.errors:
        await insert_error(
            session_id=e.session_id, url=e.url, message=e.message,
            source=e.source, lineno=e.lineno, colno=e.colno,
            stack=e.stack, user_agent=e.user_agent,
        )
        errors_stored += 1
        live_events.append({"type": "error", "message": e.message[:80], "url": e.url})

    if payload.navigation_timing:
        nt = payload.navigation_timing
        await insert_navigation_timing(nt.session_id, nt.url, nt.model_dump())

    # Broadcast all events at once
    if live_events:
        await manager.broadcast({"type": "bulk", "events": live_events})

    return {"status": "ok", "metrics_stored": metrics_stored, "errors_stored": errors_stored}


@app.post("/api/error")
async def receive_error(payload: ErrorPayload):
    await insert_error(**payload.model_dump())
    await manager.broadcast({"type": "error", "message": payload.message[:80], "url": payload.url})
    return {"status": "ok"}


@app.post("/api/navigation-timing")
async def receive_navigation_timing(payload: NavigationTimingPayload):
    await insert_navigation_timing(payload.session_id, payload.url, payload.model_dump())
    return {"status": "ok"}


@app.get("/api/metrics")
async def get_metrics(url: Optional[str] = None, limit: int = 200):
    return await get_recent_metrics(url_filter=url, limit=limit)


@app.get("/api/summary")
async def get_summary(url: Optional[str] = None):
    aggregated = await get_aggregated_metrics(url_filter=url)
    errors = await get_recent_errors(url_filter=url, limit=20)
    navigation = await get_navigation_timing(url_filter=url, limit=5)
    budgets = await get_budgets()
    alerts = await get_alerts(unacknowledged_only=True)
    device_breakdown = await get_device_breakdown()
    hourly_stats = await get_hourly_stats()
    page_breakdown = await get_page_breakdown()

    trends = {}
    for metric_name in ["LCP", "CLS", "INP", "TTFB", "FCP"]:
        trends[metric_name] = await get_metric_trend(metric_name, limit=30)

    return {
        "aggregated": aggregated,
        "errors": errors,
        "trends": trends,
        "navigation": navigation,
        "budgets": budgets,
        "alerts": alerts,
        "device_breakdown": device_breakdown,
        "hourly_stats": hourly_stats,
        "page_breakdown": page_breakdown,
    }


@app.post("/api/analyze")
async def run_analysis(request: AnalyzeRequest):
    aggregated = await get_aggregated_metrics(url_filter=request.url_filter)
    recent = await get_recent_metrics(url_filter=request.url_filter, limit=50)
    errors = await get_recent_errors(url_filter=request.url_filter, limit=20)
    navigation = await get_navigation_timing(url_filter=request.url_filter, limit=5)
    budgets = await get_budgets()
    device_breakdown = await get_device_breakdown()

    if not aggregated and not errors:
        raise HTTPException(
            status_code=400,
            detail="No performance data available. Visit the demo pages first.",
        )

    try:
        result = await analyze_performance(
            aggregated=aggregated, recent=recent, errors=errors,
            navigation=navigation, budgets=budgets,
            device_breakdown=device_breakdown, url_filter=request.url_filter,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    await save_analysis(
        url_filter=request.url_filter,
        analysis=json.dumps(result),
        metrics_snapshot=json.dumps(aggregated),
    )
    await manager.broadcast({"type": "analysis_complete", "score": result.get("overall_score")})
    return result


@app.get("/api/analysis/latest")
async def latest_analysis():
    result = await get_latest_analysis()
    if not result:
        return None
    result["analysis"] = json.loads(result["analysis"])
    return result


@app.post("/api/code-fix")
async def get_code_fix(request: CodeFixRequest):
    """Generate a targeted AI code fix for a specific metric."""
    try:
        fix = await generate_code_fix(request.metric_name, request.avg_value, request.context or "")
        return {"fix": fix}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-code")
async def run_code_analysis(request: CodeAnalysisRequest):
    """Deep AI analysis of a specific code snippet and its metrics."""
    try:
        aggregated = await get_aggregated_metrics(url_filter=request.url_filter)
        # Pass limited metrics to avoid token limit if needed
        result = await analyze_code_with_metrics(
            code_snippet=request.code_snippet,
            metrics=aggregated,
            url_filter=request.url_filter
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")


# â”€â”€ Performance Budgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.get("/api/budgets")
async def list_budgets():
    return await get_budgets()


@app.put("/api/budgets")
async def update_budget(payload: BudgetUpdate):
    await upsert_budget(payload.metric_name, payload.budget_value)
    return {"status": "ok"}


# â”€â”€ Alerts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.get("/api/alerts")
async def list_alerts(unacknowledged_only: bool = False):
    return await get_alerts(unacknowledged_only=unacknowledged_only)


@app.post("/api/alerts/{alert_id}/acknowledge")
async def ack_alert(alert_id: int):
    await acknowledge_alert(alert_id)
    return {"status": "ok"}


# â”€â”€ Session Comparison â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.get("/api/sessions/compare")
async def compare_sessions(session_ids: str):
    ids = [s.strip() for s in session_ids.split(",") if s.strip()]
    if len(ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 session IDs")
    return await get_session_comparison(ids)


# â”€â”€ Device & Page Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.get("/api/device-breakdown")
async def device_breakdown():
    return await get_device_breakdown()


@app.get("/api/page-breakdown")
async def page_breakdown():
    return await get_page_breakdown()


@app.get("/api/hourly-stats")
async def hourly_stats():
    return await get_hourly_stats()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
