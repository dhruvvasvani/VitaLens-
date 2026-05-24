import aiosqlite
import os
import json
from datetime import datetime
from typing import Optional

DATABASE_PATH = os.getenv("DATABASE_PATH", "./performance.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    rating TEXT,
    user_agent TEXT,
    device_type TEXT,
    connection_type TEXT,
    page_context TEXT,
    extra_data TEXT
);

CREATE TABLE IF NOT EXISTS js_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT,
    lineno INTEGER,
    colno INTEGER,
    stack TEXT,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    url_filter TEXT,
    analysis TEXT NOT NULL,
    metrics_snapshot TEXT
);

CREATE TABLE IF NOT EXISTS navigation_timing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL,
    dns_time REAL,
    tcp_time REAL,
    ssl_time REAL,
    ttfb REAL,
    response_time REAL,
    dom_interactive REAL,
    dom_complete REAL,
    load_event REAL,
    redirect_count INTEGER,
    transfer_size INTEGER,
    encoded_body_size INTEGER
);

CREATE TABLE IF NOT EXISTS performance_budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL UNIQUE,
    budget_value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    budget_value REAL NOT NULL,
    url TEXT NOT NULL,
    severity TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON js_errors(timestamp);
"""

DEFAULT_BUDGETS = [
    ("LCP", 2500),
    ("CLS", 0.1),
    ("INP", 200),
    ("TTFB", 800),
    ("FCP", 1800),
]

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.executescript(SCHEMA)
        for metric, val in DEFAULT_BUDGETS:
            await db.execute(
                "INSERT OR IGNORE INTO performance_budgets (metric_name, budget_value) VALUES (?, ?)",
                (metric, val)
            )
        await db.commit()

async def insert_metric(session_id, url, metric_name, value, rating, user_agent,
                        device_type, connection_type, page_context, extra_data):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO metrics (session_id,url,metric_name,value,rating,user_agent,
               device_type,connection_type,page_context,extra_data)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (session_id, url, metric_name, value, rating, user_agent,
             device_type, connection_type, page_context, extra_data)
        )
        await db.commit()
    await check_budget_alert(metric_name, value, url)

async def check_budget_alert(metric_name: str, value: float, url: str):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute("SELECT budget_value FROM performance_budgets WHERE metric_name = ?", (metric_name,)) as cursor:
            row = await cursor.fetchone()
        if not row: return
        
        budget = row["budget_value"]
        if value > budget:
            overage_pct = ((value - budget) / budget) * 100
            severity = "critical" if overage_pct > 100 else "warning"
            await db.execute(
                "INSERT INTO alerts (metric_name, value, budget_value, url, severity) VALUES (?,?,?,?,?)",
                (metric_name, value, budget, url, severity)
            )
            await db.commit()

async def insert_error(session_id, url, message, source, lineno, colno, stack, user_agent):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO js_errors (session_id,url,message,source,lineno,colno,stack,user_agent)
               VALUES (?,?,?,?,?,?,?,?)""",
            (session_id, url, message, source, lineno, colno, stack, user_agent)
        )
        await db.commit()

async def insert_navigation_timing(session_id: str, url: str, timing: dict):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO navigation_timing
               (session_id,url,dns_time,tcp_time,ssl_time,ttfb,response_time,
                dom_interactive,dom_complete,load_event,redirect_count,
                transfer_size,encoded_body_size)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (session_id, url,
             timing.get("dns_time"), timing.get("tcp_time"), timing.get("ssl_time"),
             timing.get("ttfb"), timing.get("response_time"),
             timing.get("dom_interactive"), timing.get("dom_complete"),
             timing.get("load_event"), timing.get("redirect_count"),
             timing.get("transfer_size"), timing.get("encoded_body_size"))
        )
        await db.commit()

async def get_recent_metrics(url_filter=None, limit=200):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        if url_filter:
            async with db.execute("SELECT * FROM metrics WHERE url LIKE ? ORDER BY timestamp DESC LIMIT ?", (f"%{url_filter}%", limit)) as cursor:
                return await cursor.fetchall()
        else:
            async with db.execute("SELECT * FROM metrics ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                return await cursor.fetchall()

async def get_aggregated_metrics(url_filter=None):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        query = "SELECT metric_name, value, rating FROM metrics"
        params = []
        if url_filter:
            query += " WHERE url LIKE ?"
            params.append(f"%{url_filter}%")
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            
        groups = {}
        for row in rows:
            name = row["metric_name"]
            val = row["value"]
            rating = row["rating"]
            if name not in groups:
                groups[name] = {"values": [], "ratings": []}
            groups[name]["values"].append(val)
            groups[name]["ratings"].append(rating)
            
        results = []
        for name, data in groups.items():
            vals = sorted(data["values"])
            ratings = data["ratings"]
            n = len(vals)
            if n == 0: continue
            
            p75_idx = min(int(n * 0.75), n - 1)
            p75_value = vals[p75_idx]
            avg_value = sum(vals) / n
            min_value = vals[0]
            max_value = vals[-1]
            
            good_count = sum(1 for r in ratings if r == 'good')
            needs_improvement_count = sum(1 for r in ratings if r == 'needs-improvement')
            poor_count = sum(1 for r in ratings if r == 'poor')
            
            results.append({
                "metric_name": name,
                "avg_value": round(avg_value, 3),
                "min_value": round(min_value, 3),
                "max_value": round(max_value, 3),
                "p75_value": round(p75_value, 3),
                "sample_count": n,
                "good_count": good_count,
                "needs_improvement_count": needs_improvement_count,
                "poor_count": poor_count
            })
        return results

async def get_recent_errors(url_filter=None, limit=50):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        if url_filter:
            async with db.execute("SELECT * FROM js_errors WHERE url LIKE ? ORDER BY timestamp DESC LIMIT ?", (f"%{url_filter}%", limit)) as cursor:
                return await cursor.fetchall()
        else:
            async with db.execute("SELECT * FROM js_errors ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                return await cursor.fetchall()

async def get_metric_trend(metric_name: str, limit: int = 50):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute(
            """SELECT timestamp, value, rating, url
               FROM metrics WHERE metric_name = ?
               ORDER BY timestamp DESC LIMIT ?""", (metric_name, limit)) as cursor:
            rows = await cursor.fetchall()
            return list(reversed(rows))

async def get_session_comparison(session_ids: list[str]):
    if not session_ids: return []
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        placeholders = ",".join("?" * len(session_ids))
        async with db.execute(
            f"""SELECT session_id, metric_name, AVG(value) as avg_value, url
               FROM metrics WHERE session_id IN ({placeholders})
               GROUP BY session_id, metric_name, url""", session_ids) as cursor:
            return await cursor.fetchall()

async def get_device_breakdown():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute(
            """SELECT device_type, metric_name,
                      ROUND(AVG(value), 2) as avg_value,
                      COUNT(*) as count
               FROM metrics WHERE device_type IS NOT NULL
               GROUP BY device_type, metric_name""") as cursor:
            return await cursor.fetchall()

async def get_navigation_timing(url_filter=None, limit=10):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        if url_filter:
            async with db.execute("SELECT * FROM navigation_timing WHERE url LIKE ? ORDER BY timestamp DESC LIMIT ?", (f"%{url_filter}%", limit)) as cursor:
                return await cursor.fetchall()
        else:
            async with db.execute("SELECT * FROM navigation_timing ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                return await cursor.fetchall()

async def get_budgets():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute("SELECT * FROM performance_budgets") as cursor:
            return await cursor.fetchall()

async def upsert_budget(metric_name: str, budget_value: float):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO performance_budgets (metric_name, budget_value) 
               VALUES (?,?) 
               ON CONFLICT(metric_name) 
               DO UPDATE SET budget_value=excluded.budget_value""",
            (metric_name, budget_value)
        )
        await db.commit()

async def get_alerts(unacknowledged_only: bool = False, limit: int = 50):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        if unacknowledged_only:
            async with db.execute("SELECT * FROM alerts WHERE acknowledged=0 ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                return await cursor.fetchall()
        else:
            async with db.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                return await cursor.fetchall()

async def acknowledge_alert(alert_id: int):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("UPDATE alerts SET acknowledged=1 WHERE id=?", (alert_id,))
        await db.commit()

async def save_analysis(url_filter, analysis, metrics_snapshot):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT INTO ai_analyses (url_filter, analysis, metrics_snapshot) VALUES (?,?,?)",
            (url_filter, analysis, metrics_snapshot)
        )
        await db.commit()

async def get_latest_analysis():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute("SELECT * FROM ai_analyses ORDER BY timestamp DESC LIMIT 1") as cursor:
            return await cursor.fetchone()

async def get_hourly_stats():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute(
            """SELECT
                   strftime('%Y-%m-%dT%H:00:00', timestamp) as hour,
                   metric_name,
                   ROUND(AVG(value), 2) as avg_value,
                   COUNT(*) as count
               FROM metrics
               WHERE timestamp >= datetime('now', '-24 hours')
               GROUP BY hour, metric_name
               ORDER BY hour ASC""") as cursor:
            return await cursor.fetchall()

async def get_page_breakdown():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = dict_factory
        async with db.execute(
            """SELECT url, metric_name,
                      ROUND(AVG(value), 2) as avg_value,
                      COUNT(*) as count,
                      SUM(CASE WHEN rating='poor' THEN 1 ELSE 0 END) as poor_count
               FROM metrics
               GROUP BY url, metric_name
               ORDER BY url, metric_name""") as cursor:
            return await cursor.fetchall()
