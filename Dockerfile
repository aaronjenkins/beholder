FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY web.py .
COPY --from=frontend-builder /app/static ./static/
CMD ["sh", "-c", "uvicorn web:app --host 0.0.0.0 --port ${PORT:-8001}"]
