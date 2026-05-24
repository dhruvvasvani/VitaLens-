<<<<<<< HEAD
# PerfAgent

AI-powered Real User Monitoring with Google Gemini. Capture Core Web Vitals, detect regressions, and get actionable insights.

## Architecture

Frontend (Next.js) -> Backend (FastAPI) -> SQLite DB (Local)
The backend integrates with Google Gemini 1.5 Flash for AI analysis of the performance metrics.

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory and set up your Python environment:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the backend directory with the following variable:
- `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.

Start the FastAPI server:

```bash
python main.py
```

### 2. Frontend Setup

Navigate to the frontend directory and run the development server:

```bash
cd frontend
npm install
npm run dev
```

## Usage Guide

1. Open `http://localhost:3000` in your browser.
2. Visit the demo pages (e.g., `/demo/fast` or `/demo/errors`) to generate sample performance data and trigger the monitoring script.
3. Navigate to the Dashboard at `/dashboard` to view the collected metrics.
4. Click "Analyze with AI" to receive expert-level performance insights and actionable code fix recommendations.

## Deployment

- **Frontend (Vercel)**: Connect your repository to Vercel. Be sure to set `NEXT_PUBLIC_API_URL` in your environment variables to point to your live backend URL.
- **Backend (Render)**: Connect your repository to Render. The service will automatically configure itself using the provided `render.yaml` file. You will need to manually add `GEMINI_API_KEY` in the Render dashboard. Note: By default, Render will use a persistent disk for the local SQLite database.

## Tech Stack

- Frontend: Next.js 14 App Router, TypeScript, Vanilla CSS
- RUM: web-vitals
- Charts: Recharts
- Backend: FastAPI, Python 3.11+
- Database: SQLite (Local, aiosqlite)
- AI: Google Gemini 1.5 Flash
=======
# VitaLens-
>>>>>>> 22b3450919bcfdec85f590c45bd27183121dbbee
