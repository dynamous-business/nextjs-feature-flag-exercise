---
description: "Prime agent with codebase understanding"
agent: "plan"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - listDirectory
  - usages
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of this codebase by analyzing structure and key files.

## Process

1. Study the application entry point (`app/main.py`)
2. Study the core infrastructure (`app/core/`)
3. Study shared utilities (`app/shared/`)
4. Study any feature directories under `app/`
5. Review `CLAUDE.md` for project conventions
6. Check `pyproject.toml` for dependencies and configuration
7. Check recent commits with `git log --oneline -5`

## Output

Produce a scannable summary of what you learned:

- **Project Purpose**: One sentence
- **Tech Stack**: FastAPI, SQLAlchemy async, PostgreSQL, structlog, Pydantic
- **Architecture**: Vertical slice — features own models, schemas, routes, services
- **Data Model**: Core entities
- **Key Patterns**: Async database, structured logging, type safety (mypy + pyright)
- **Current State**: Recent commits, current branch

Use bullet points. Keep it concise.
