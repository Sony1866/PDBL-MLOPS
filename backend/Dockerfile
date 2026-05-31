# ═══════════════════════════════════════════════════════════
# Dockerfile — FastAPI Backend (Root Context Build)
# ═══════════════════════════════════════════════════════════

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (using root context path)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy model files from root directory into /app
COPY *.pkl ./

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend folder for run command
WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
