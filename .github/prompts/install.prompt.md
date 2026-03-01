---
description: "Install dependencies and start the development server"
agent: "agent"
tools:
  - runInTerminal
  - readFile
---

# Install

## Run

Think through each step carefully to ensure nothing is missed.

### Database

1. Start PostgreSQL: `docker-compose up -d`
2. Wait for database to start: `sleep 3`
3. Verify database is running: `docker-compose ps`

### Application

1. Install dependencies: `uv sync`
2. Copy environment config: `cp .env.example .env` (if `.env` doesn't exist)
3. Run database migrations: `uv run alembic upgrade head`
4. Start dev server (in background): `uv run uvicorn app.main:app --reload --port 8123 &`
5. Wait for server to start: `sleep 3`
6. Verify API is running: `curl http://localhost:8123/health`

## Report

Output what you've done in a concise bullet point list:
- Database: PostgreSQL via Docker
- API: http://localhost:8123, health check response
- Any issues encountered
