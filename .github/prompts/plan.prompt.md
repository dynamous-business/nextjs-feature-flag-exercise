---
description: "Create implementation plan with codebase analysis"
argument-hint: "<feature description | path/to/prd.md>"
agent: "plan"
tools:
  - codebase
  - readFile
  - textSearch
  - fileSearch
  - usages
---

# Implementation Plan Generator

**Input**: ${input:feature}

## Objective

Transform the input into a battle-tested implementation plan through codebase exploration and pattern extraction.

**Core Principle**: PLAN ONLY - no code written. Create a context-rich document that enables one-pass implementation.

**Order**: CODEBASE FIRST. Solutions must fit existing patterns.

---

## Phase 1: PARSE

### Determine Input Type

| Input | Action |
|-------|--------|
| `.prd.md` file | Read PRD, extract next pending phase |
| Other `.md` file | Read and extract feature description |
| Free-form text | Use directly as feature input |
| Blank | Use conversation context |

### Extract Feature Understanding

- **Problem**: What are we solving?
- **User Story**: As a [user], I want to [action], so that [benefit]
- **Type**: NEW_CAPABILITY / ENHANCEMENT / REFACTOR / BUG_FIX
- **Complexity**: LOW / MEDIUM / HIGH

---

## Phase 2: EXPLORE

### Study the Codebase

Search through the codebase to find:

1. **Similar implementations** - analogous features with file:line references
2. **Naming conventions** - actual examples from the codebase
3. **Error handling patterns** - how exceptions are raised and handled
4. **Type definitions** - relevant Pydantic schemas and SQLAlchemy models
5. **Test patterns** - test file structure and assertion styles

### Document Patterns

| Category | File:Lines | Pattern |
|----------|------------|---------|
| NAMING | `app/feature/models.py:10-15` | {pattern description} |
| ERRORS | `app/core/exceptions.py:20-30` | {pattern description} |
| SCHEMAS | `app/feature/schemas.py:1-10` | {pattern description} |
| TESTS | `app/feature/tests/test_service.py:1-25` | {pattern description} |

---

## Phase 3: DESIGN

### Map the Changes

- What files need to be created? (Follow vertical slice: models, schemas, routes, service, tests)
- What files need to be modified? (e.g., `app/main.py` for router registration)
- What's the dependency order?

### Identify Risks

| Risk | Mitigation |
|------|------------|
| {potential issue} | {how to handle} |

---

## Phase 4: GENERATE

### Create Plan File

**Output path**: `.agents/plans/{kebab-case-name}.plan.md`

```bash
mkdir -p .agents/plans
```

```markdown
# Plan: {Feature Name}

## Summary

{One paragraph: What we're building and approach}

## User Story

As a {user type}
I want to {action}
So that {benefit}

## Metadata

| Field | Value |
|-------|-------|
| Type | {type} |
| Complexity | {LOW/MEDIUM/HIGH} |
| Systems Affected | {list} |

---

## Patterns to Follow

### Naming
```
# SOURCE: {file:lines}
{actual code snippet}
```

### Error Handling
```
# SOURCE: {file:lines}
{actual code snippet}
```

### Tests
```
# SOURCE: {file:lines}
{actual code snippet}
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `app/feature/models.py` | CREATE | {why} |
| `app/feature/schemas.py` | CREATE | {why} |
| `app/feature/routes.py` | CREATE | {why} |
| `app/feature/service.py` | CREATE | {why} |
| `app/feature/tests/test_service.py` | CREATE | {why} |
| `app/main.py` | UPDATE | Register router |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: {Description}

- **File**: `app/feature/models.py`
- **Action**: CREATE / UPDATE
- **Implement**: {what to do}
- **Mirror**: `app/existing/models.py:lines` - follow this pattern
- **Validate**: `uv run mypy app/ && uv run pyright app/`

### Task 2: {Description}

- **File**: `app/feature/schemas.py`
- **Action**: CREATE / UPDATE
- **Implement**: {what to do}
- **Mirror**: `app/existing/schemas.py:lines`
- **Validate**: `uv run mypy app/ && uv run pyright app/`

{Continue for each task...}

---

## Validation

```bash
# Lint
uv run ruff check .

# Format
uv run ruff format --check .

# Type check (MyPy strict)
uv run mypy app/

# Type check (Pyright strict)
uv run pyright app/

# Tests
uv run pytest -v
```

---

## Acceptance Criteria

- [ ] All tasks completed
- [ ] Ruff lint passes
- [ ] MyPy strict passes
- [ ] Pyright strict passes
- [ ] Tests pass
- [ ] Follows vertical slice architecture
```

---

## Phase 5: OUTPUT

```markdown
## Plan Created

**File**: `.agents/plans/{name}.plan.md`

**Summary**: {2-3 sentence overview}

**Scope**:
- {N} files to CREATE
- {M} files to UPDATE
- {K} total tasks

**Key Patterns**:
- {Pattern 1 with file:line}
- {Pattern 2 with file:line}

**Next Step**: Review the plan, then implement tasks in order.
```
