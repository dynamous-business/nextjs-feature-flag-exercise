---
description: "Prime agent with backend codebase understanding"
agent: "plan"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - listDirectory
  - usages
---

# Prime Server: Load Backend Context

## Objective

Build comprehensive understanding of the FastAPI backend by analyzing structure and key files.

## Process

1. Study the entry point (`app/main.py`)
2. Study core infrastructure (`app/core/` — config, database, logging, middleware, health, exceptions)
3. Study shared utilities (`app/shared/` — pagination, timestamps, error schemas)
4. Study any feature directories under `app/` (e.g., `app/products/`, `app/orders/`)
5. Check `pyproject.toml` for dependencies and tooling config
6. Check `alembic/` for migration setup

## Output

Produce a scannable summary of what you learned:

- **Purpose**: What the backend does
- **Tech Stack**: FastAPI, SQLAlchemy async, PostgreSQL, structlog
- **API Routes**: Available endpoints (health, features)
- **Data Model**: Core entities and their relationships
- **Patterns**: Vertical slice architecture, async database patterns, structured logging, error handling

Use bullet points. Keep it concise.
