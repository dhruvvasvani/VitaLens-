import os
import json
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

BENCHMARKS = {
    "LCP":  {"good": 2500,  "poor": 4000,  "unit": "ms", "description": "Largest Contentful Paint"},
    "CLS":  {"good": 0.1,   "poor": 0.25,  "unit": "",   "description": "Cumulative Layout Shift"},
    "INP":  {"good": 200,   "poor": 500,   "unit": "ms", "description": "Interaction to Next Paint"},
    "TTFB": {"good": 800,   "poor": 1800,  "unit": "ms", "description": "Time to First Byte"},
    "FCP":  {"good": 1800,  "poor": 3000,  "unit": "ms", "description": "First Contentful Paint"},
}


def rate_metric(metric_name: str, value: float) -> str:
    bench = BENCHMARKS.get(metric_name)
    if not bench:
        return "unknown"
    if value <= bench["good"]:
        return "good"
    elif value <= bench["poor"]:
        return "needs-improvement"
    return "poor"


SYSTEM_PROMPT = """You are a dedicated, autonomous Frontend Performance AI Agent. Your prime directive is to analyze frontend performance parameters perfectly and provide expert-level, root-cause insights for Core Web Vitals optimizations.

As an AI Agent, you deeply analyze production performance data, detect hidden correlations (e.g., High TTFB causing High LCP), and deliver prioritized, concrete, and copy-pasteable Next.js 14+ (App Router) code fixes. You MUST ALWAYS provide actual code to solve the issues found.

Respond ONLY with a JSON object matching this exact schema:
{
  "overall_score": <0-100>,
  "overall_rating": "<excellent|good|needs-improvement|poor>",
  "summary": "<2-3 sentence executive summary highlighting the most critical findings>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "metric": "<LCP|CLS|INP|TTFB|FCP|JS_Errors|Navigation>",
      "title": "<concise title>",
      "description": "<detailed explanation of root cause and user impact>",
      "impact": "<estimated improvement if fixed, e.g. 'Could reduce LCP by ~800ms'>",
      "code_example": "<MANDATORY: Provide a concrete, copy-pasteable code fix snippet demonstrating the exact solution. Do NOT return null.>",
      "recommendations": ["<specific fix 1>", "<specific fix 2>", "<specific fix 3>"]
    }
  ],
  "quick_wins": ["<30-min fix 1>", "<30-min fix 2>", "<30-min fix 3>"],
  "regression_detected": <true|false>,
  "regression_details": "<string or null>",
  "performance_score_breakdown": {
    "lcp_score": <0-25>,
    "cls_score": <0-25>,
    "inp_score": <0-25>,
    "ttfb_score": <0-25>
  },
  "next_steps": ["<ordered action item 1>", "<ordered action item 2>", "<ordered action item 3>"]
}

Google Core Web Vitals thresholds:
- LCP: Good ≤2500ms, Needs Improvement ≤4000ms, Poor >4000ms
- CLS: Good ≤0.1, Needs Improvement ≤0.25, Poor >0.25
- INP: Good ≤200ms, Needs Improvement ≤500ms, Poor >500ms
- TTFB: Good ≤800ms, Needs Improvement ≤1800ms, Poor >1800ms
- FCP: Good ≤1800ms, Needs Improvement ≤3000ms, Poor >3000ms

Scoring: Each of LCP, CLS, INP, TTFB contributes up to 25 points.
- Full 25 pts = "good" threshold met
- 15 pts = "needs-improvement"  
- 5 pts = "poor"
- 0 pts = no data

Be specific. Reference exact values. ALWAYS provide real, actionable code snippets in the code_example field. Prioritize by user impact."""


def build_user_prompt(aggregated, recent, errors, navigation, budgets, device_breakdown, url_filter):
    lines = [f"## Target: {'All pages' if not url_filter else url_filter}\n"]
    
    lines.append("## Tech Context")
    lines.append("- The target site could be built with ANY framework (React, Next.js, Vue, WordPress, Plain HTML, etc.).")
    lines.append("- Provide general, universally applicable web performance solutions (e.g., lazy loading, image optimization, script deferring).")
    lines.append("- If the URL or errors strongly suggest a specific framework, tailor the advice; otherwise, stick to standard HTML/JS/CSS improvements.\n")

    lines.append("## Core Web Vitals (Aggregated)")
    for m in aggregated:
        b = BENCHMARKS.get(m["metric_name"], {})
        lines.append(f"\n### {b.get('description', m['metric_name'])} ({m['metric_name']})")
        lines.append(f"- avg={m['avg_value']}{b.get('unit','')}, min={m['min_value']}, max={m['max_value']}, p75={m.get('p75_value','N/A')}")
        lines.append(f"- samples={m['sample_count']} | good={m['good_count']} / needs={m['needs_improvement_count']} / poor={m['poor_count']}")
        lines.append(f"- Budget: Good≤{b.get('good','?')}{b.get('unit','')}, Poor>{b.get('poor','?')}{b.get('unit','')}")

    if budgets:
        lines.append("\n## Performance Budgets")
        for budget in budgets:
            match = next((m for m in aggregated if m["metric_name"] == budget["metric_name"]), None)
            if match:
                status = "OVER BUDGET" if match["avg_value"] > budget["budget_value"] else "within budget"
                lines.append(f"- {budget['metric_name']}: budget={budget['budget_value']}, actual={match['avg_value']} → {status}")

    if navigation:
        lines.append("\n## Navigation Timing (latest)")
        n = navigation[0]
        lines.append(f"- DNS: {n.get('dns_time')}ms, TCP: {n.get('tcp_time')}ms, SSL: {n.get('ssl_time')}ms")
        lines.append(f"- TTFB: {n.get('ttfb')}ms, Response: {n.get('response_time')}ms")
        lines.append(f"- DOM Interactive: {n.get('dom_interactive')}ms, DOM Complete: {n.get('dom_complete')}ms")
        lines.append(f"- Load Event: {n.get('load_event')}ms, Transfer Size: {n.get('transfer_size')} bytes")

    if device_breakdown:
        lines.append("\n## Device Breakdown")
        for d in device_breakdown:
            lines.append(f"- {d['device_type']} | {d['metric_name']}: avg={d['avg_value']} ({d['count']} samples)")

    lines.append(f"\n## JavaScript Errors ({len(errors)} total)")
    for e in errors[:10]:
        lines.append(f"- [{e['timestamp']}] {e['message'][:100]} @ {e.get('source','?')}:{e.get('lineno','?')}")

    lines.append("\n## Recent Samples (last 8)")
    for r in recent[:8]:
        lines.append(f"- {r['metric_name']}={r['value']} ({r['rating']}) | {r['url']}")

    lines.append("\nAnalyze this data thoroughly and respond with the exact JSON schema defined.")
    return "\n".join(lines)


async def analyze_performance(aggregated, recent, errors, navigation, budgets, device_breakdown, url_filter=None):
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
        system_instruction=SYSTEM_PROMPT,
    )

    prompt = build_user_prompt(aggregated, recent, errors, navigation, budgets, device_breakdown, url_filter)
    response = await model.generate_content_async(prompt)
    raw = response.text.strip()

    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())


async def generate_code_fix(metric_name: str, avg_value: float, context: str) -> str:
    """Generate a targeted code fix suggestion for a specific metric."""
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=genai.GenerationConfig(temperature=0.3),
    )

    prompt = f"""A web page has a poor {metric_name} score of {avg_value}.
Context: {context}

Provide a concise, specific, copy-pasteable code fix (HTML/CSS/JavaScript/Next.js) that would most improve {metric_name}.
Include a before/after example. Keep it under 30 lines total. Format as markdown with code blocks."""

    response = await model.generate_content_async(prompt)
    return response.text


SYSTEM_PROMPT_CODE_ANALYSIS = """You are an expert senior frontend performance engineer with 12+ years of experience specializing in Core Web Vitals optimization, React/Vue performance, and JavaScript bundle optimization.

Your task is to deeply analyze the provided frontend code and performance metrics, then give precise, actionable recommendations.

### Analysis Rules:
1. Identify specific performance anti-patterns in the code.
2. Point to exact lines or sections causing issues.
3. Prioritize issues based on impact on LCP, CLS, INP, and Load Time.
4. Provide concrete, production-ready code fixes.

Respond ONLY with a JSON object matching this exact schema:
{
  "performance_score": {
    "grade": "<Excellent|Good|Fair|Poor>",
    "problem_areas": ["<LCP|CLS|INP|JS Execution|etc>"]
  },
  "critical_issues": [
    {
      "title": "<Short title>",
      "location": "<File name or specific lines/functions>",
      "impact": "<How it affects Core Web Vitals>",
      "explanation": "<Clear technical reason>",
      "fix_suggestion": "<Exact code change recommendation>",
      "fix_confidence_score": "<High|Medium|Low>"
    }
  ],
  "optimized_code": "<Provide the improved version of the problematic code section with comments explaining changes. Return as plain text, no markdown backticks around it unless they are part of the code itself.>",
  "additional_recommendations": {
    "quick_wins": ["<low effort, high impact win>"],
    "long_term": ["<long-term improvement>"],
    "estimated_gain_percent": "<Estimated Performance Gain (in %)>"
  }
}

Be extremely specific, professional, and constructive. Never give generic advice. Always reference actual code provided."""


async def analyze_code_with_metrics(code_snippet: str, metrics: list, url_filter: Optional[str] = None) -> dict:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
        system_instruction=SYSTEM_PROMPT_CODE_ANALYSIS,
    )

    lines = [f"## Target URL Context: {'All pages' if not url_filter else url_filter}\n"]
    
    if metrics:
        lines.append("## Available Performance Metrics Context")
        for m in metrics:
            lines.append(f"- {m['metric_name']}: avg={m['avg_value']} (samples: {m['sample_count']})")
    else:
        lines.append("## Available Performance Metrics Context")
        lines.append("- No metrics available. Analyze code in isolation.")
        
    lines.append("\n## Code to Analyze:\n")
    lines.append(code_snippet)
    
    prompt = "\n".join(lines)
    
    response = await model.generate_content_async(prompt)
    raw = response.text.strip()

    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())
