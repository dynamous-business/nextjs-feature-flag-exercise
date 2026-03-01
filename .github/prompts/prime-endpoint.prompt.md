---
description: "Learn how to build new API endpoints end-to-end"
agent: "plan"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - listDirectory
  - usages
---

# Prime Endpoint: How to Build New Endpoints

## Objective

Understand the full vertical slice pattern so you can build new feature endpoints correctly.

## Process

Study these files in order (this is the vertical slice data flow):

1. **Models**: Feature `models.py` — SQLAlchemy models inheriting `Base` and `TimestampMixin`
2. **Schemas**: Feature `schemas.py` — Pydantic models for request/response validation
3. **Service**: Feature `service.py` — async business logic and database operations
4. **Routes**: Feature `routes.py` — FastAPI route handlers with dependency injection
5. **Tests**: Feature `tests/` — pytest tests with async support
6. **Registration**: `app/main.py` — how routers are included via `app.include_router()`
7. **Shared**: `app/shared/` — pagination, timestamps, error schemas
8. **Core**: `app/core/exceptions.py` — custom exception classes and handlers

## Output

Produce a scannable summary of what you learned:

- **Vertical Slice**: How features are self-contained (models, schemas, routes, service, tests)
- **Model Pattern**: Base class, TimestampMixin, async SQLAlchemy 2.0 style
- **Schema Pattern**: Pydantic models for validation and serialization
- **Service Pattern**: How business logic and database queries are structured
- **Route Pattern**: How routes use dependency injection (`get_db()`, path params)
- **Error Handling**: Custom exceptions and global handlers
- **Logging**: Structured logging with `domain.action_state` pattern

Use bullet points. Keep it concise.
