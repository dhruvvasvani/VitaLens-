import asyncio
import aiosqlite
import random
import uuid
from datetime import datetime, timedelta
import os

DATABASE_PATH = os.getenv("DATABASE_PATH", "./performance.db")

URLS = [
    "http://localhost:3000/",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/docs",
    "http://localhost:3000/demo/fast",
    "http://localhost:3000/snippet"
]

DEVICES = ["desktop", "mobile", "tablet"]
AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
]

# Baseline metric values for realistic simulation
METRIC_BASELINES = {
    "LCP": (800, 3500), # ms
    "CLS": (0.01, 0.3), # score
    "INP": (50, 600),   # ms
    "TTFB": (100, 1500),# ms
    "FCP": (400, 2500)  # ms
}

def get_rating(metric_name, value):
    if metric_name == "LCP":
        return "good" if value <= 2500 else "needs-improvement" if value <= 4000 else "poor"
    elif metric_name == "CLS":
        return "good" if value <= 0.1 else "needs-improvement" if value <= 0.25 else "poor"
    elif metric_name == "INP":
        return "good" if value <= 200 else "needs-improvement" if value <= 500 else "poor"
    elif metric_name == "TTFB":
        return "good" if value <= 800 else "needs-improvement" if value <= 1800 else "poor"
    elif metric_name == "FCP":
        return "good" if value <= 1800 else "needs-improvement" if value <= 3000 else "poor"
    return "good"

async def generate_demo_data(num_sessions=100):
    print(f"Generating {num_sessions} demo sessions...")
    
    now = datetime.utcnow()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        for _ in range(num_sessions):
            session_id = str(uuid.uuid4())
            url = random.choice(URLS)
            device_type = random.choice(DEVICES)
            user_agent = random.choice(AGENTS)
            
            # Generate a timestamp sometime in the last 24 hours
            hours_ago = random.uniform(0, 24)
            timestamp = (now - timedelta(hours=hours_ago)).strftime('%Y-%m-%d %H:%M:%S')
            
            # 1. Insert metrics
            for metric_name, (min_val, max_val) in METRIC_BASELINES.items():
                # Add some variance and url-specific bias
                value = random.uniform(min_val, max_val)
                if "fast" in url:
                    value = value * 0.4 # Make fast demo actually fast
                elif "dashboard" in url:
                    value = value * 1.2 # Dashboard is a bit heavier
                
                rating = get_rating(metric_name, value)
                
                await db.execute(
                    """INSERT INTO metrics (session_id, timestamp, url, metric_name, value, rating, user_agent, device_type)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (session_id, timestamp, url, metric_name, value, rating, user_agent, device_type)
                )
            
            # 2. Insert navigation timing
            ttfb = random.uniform(50, 800)
            if "fast" in url: ttfb *= 0.5
            
            await db.execute(
                """INSERT INTO navigation_timing 
                   (session_id, timestamp, url, dns_time, tcp_time, ssl_time, ttfb, response_time, dom_interactive, dom_complete, load_event)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (session_id, timestamp, url, 
                 random.uniform(10, 50), random.uniform(10, 50), random.uniform(20, 80),
                 ttfb, ttfb + random.uniform(10, 50),
                 ttfb + random.uniform(200, 1000), ttfb + random.uniform(500, 2000), ttfb + random.uniform(600, 2500))
            )
            
            # 3. Randomly insert some errors
            if random.random() < 0.1: # 10% chance of error
                errors = [
                    "TypeError: Cannot read properties of undefined (reading 'map')",
                    "ReferenceError: window is not defined",
                    "NetworkError: Failed to fetch"
                ]
                await db.execute(
                    """INSERT INTO js_errors (session_id, timestamp, url, message, source, lineno, colno, user_agent)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (session_id, timestamp, url, random.choice(errors), "app.js", random.randint(10, 1000), random.randint(1, 50), user_agent)
                )

        await db.commit()
    print("Demo data generation complete!")

if __name__ == "__main__":
    asyncio.run(generate_demo_data())
