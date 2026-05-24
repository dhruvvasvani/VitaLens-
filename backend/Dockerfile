# Use slim Python base
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create data directory for SQLite
RUN mkdir -p /data
VOLUME /data
ENV DATABASE_PATH=/data/performance.db

# Start server (Listen on $PORT for Render compatibility, default to 8000)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
