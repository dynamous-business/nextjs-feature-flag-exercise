---
description: "Create global rules (copilot-instructions.md) from codebase analysis"
agent: "agent"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - listDirectory
  - editFiles
  - createFile
  - createDirectory
---

# Create Global Rules

Generate a `.github/copilot-instructions.md` file by analyzing the codebase and extracting patterns.

---

## Objective

Create project-specific custom instructions that give Copilot context about:
- What this project is
- Technologies used
- How the code is organized
- Patterns and conventions to follow
- How to test and validate

---

## Phase 1: DISCOVER

### Identify Project Type

First, determine what kind of project this is:

| Type | Indicators |
|------|------------|
| API/Backend | FastAPI/Django/Flask, database models, route handlers |
| CLI Tool | `entry_points` in pyproject.toml, argparse/click |
| Library/Package | Publishable, `build-system` in pyproject.toml |
| Full-stack | Backend + frontend directories |
| Data/ML | Jupyter notebooks, pandas, scikit-learn, torch |
| Script/Automation | Standalone scripts, task-focused |
| Monorepo | Multiple packages, workspace config |

### Analyze Configuration

Look at root configuration files:

```
pyproject.toml     → dependencies, scripts, tool config
alembic.ini        → database migration settings
CLAUDE.md          → AI coding conventions
.env.example       → environment variables
Dockerfile         → container setup
docker-compose.yml → service orchestration
```

### Map Directory Structure

Explore the codebase to understand organization:
- Where does source code live?
- Where are tests?
- Any shared code?
- Configuration locations?

---

## Phase 2: ANALYZE

### Extract Tech Stack

From pyproject.toml and config files, identify:
- Runtime/Language (Python version, async support)
- Framework(s) (FastAPI, SQLAlchemy, etc.)
- Database (PostgreSQL, SQLite, etc.)
- Testing tools (pytest, pytest-asyncio, etc.)
- Type checking (mypy, pyright)
- Linting/formatting (ruff, black, etc.)
- Package manager (uv, pip, poetry)

### Identify Patterns

Study existing code for:
- **Naming**: How are files, functions, classes named?
- **Structure**: How is code organized within files? (vertical slice, layered, etc.)
- **Errors**: How are exceptions created and handled?
- **Types**: How are Pydantic models and SQLAlchemy models defined?
- **Tests**: How are tests structured?
- **Logging**: What logging pattern is used?

### Find Key Files

Identify files that are important to understand:
- Entry points
- Configuration
- Core business logic
- Shared utilities
- Type definitions

---

## Phase 3: GENERATE

### Create copilot-instructions.md

Use the template at `.github/copilot-instructions-template.md` as a starting point.

**Output path**: `.github/copilot-instructions.md`

**Adapt to the project:**
- Remove sections that don't apply
- Add sections specific to this project type
- Keep it concise - focus on what's useful

**Key sections to include:**

1. **Project Overview** - What is this and what does it do?
2. **Tech Stack** - What technologies are used?
3. **Commands** - How to dev, test, lint, type-check?
4. **Structure** - How is the code organized?
5. **Patterns** - What conventions should be followed?
6. **Key Files** - What files are important to know?

**Optional sections (add if relevant):**
- Architecture (for complex apps)
- API endpoints (for backends)
- Database patterns (if using a DB)
- Logging conventions
- On-demand context references

---

## Phase 4: OUTPUT

```markdown
## Global Rules Created

**File**: `.github/copilot-instructions.md`

### Project Type

{Detected project type}

### Tech Stack Summary

{Key technologies detected}

### Structure

{Brief structure overview}

### Next Steps

1. Review the generated `copilot-instructions.md`
2. Add any project-specific notes
3. Remove any sections that don't apply
4. Optionally create reference docs for deeper context
```

---

## Tips

- Keep copilot-instructions.md focused and scannable
- Don't duplicate information that's in other docs (link instead)
- Focus on patterns and conventions, not exhaustive documentation
- Update it as the project evolves
