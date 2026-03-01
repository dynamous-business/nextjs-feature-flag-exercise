---
description: "Learn Pydantic schema and dependency injection patterns in this codebase"
agent: "plan"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - listDirectory
  - usages
---

# Prime Schemas: How to Build Schemas and Dependencies

## Objective

Understand the Pydantic schema patterns and FastAPI dependency injection used in this codebase so you can build new ones correctly.

## Process

1. Study shared schemas in `app/shared/schemas.py` (pagination, error responses)
2. Study shared models in `app/shared/models.py` (TimestampMixin, base patterns)
3. Study feature schemas as examples (any feature `schemas.py`)
4. Study `app/core/database.py` for the `get_db()` dependency
5. Study `app/core/config.py` for the settings dependency pattern

## Output

Produce a scannable summary of what you learned:

- **Pydantic Models**: How request/response schemas are defined
- **Validation**: How input validation is handled via Pydantic
- **Generics**: How `PaginatedResponse[T]` uses generic types
- **Dependencies**: How `get_db()` and `get_settings()` work with FastAPI DI
- **Type Safety**: How strict typing is enforced across schemas

Use bullet points. Keep it concise.
