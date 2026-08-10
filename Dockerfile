FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ ./
ARG VITE_API_BASE=
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM python:3.13-slim

WORKDIR /app/backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apt-get update && apt-get install --no-install-recommends -y tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend-build /app/frontend-react/dist ./frontend-dist

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT}"
