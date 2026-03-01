---
description: "Execute an implementation plan with validation loops"
argument-hint: "<path/to/plan.md>"
agent: "agent"
tools:
  - codebase
  - editFiles
  - createFile
  - createDirectory
  - readFile
  - runInTerminal
  - problems
  - runTests
  - textSearch
---

# Implement Plan

**Plan**: ${input:planPath}

## Your Mission

Execute the plan end-to-end with rigorous self-validation.

**Core Philosophy**: Validation loops catch mistakes early. Run checks after every change. Fix issues immediately.

**Golden Rule**: If validation fails, fix it before moving on. Never accumulate broken state.

---

## Phase 1: LOAD

### Read the Plan

Load the plan file and extract:

- **Summary** - What we're building
- **Patterns to Mirror** - Code to copy from
- **Files to Change** - CREATE/UPDATE list
- **Tasks** - Implementation order
- **Validation Commands** - How to verify

**If plan not found:**
```
Error: Plan not found at the specified path.
Create a plan first: /plan "feature description"
```

---

## Phase 2: PREPARE

### Git State

```bash
git branch --show-current
git status
```

| State | Action |
|-------|--------|
| On main, clean | Create branch: `git checkout -b feature/{plan-name}` |
| On main, dirty | STOP: "Stash or commit changes first" |
| On feature branch | Use it |

---

## Phase 3: EXECUTE

**For each task in the plan:**

### 3.1 Read Context

- Read the **MIRROR** file reference
- Understand the pattern to follow

### 3.2 Implement

- Make the change as specified
- Follow the pattern from MIRROR reference

### 3.3 Validate Immediately

**After EVERY file change:**

```bash
uv run mypy app/
uv run pyright app/
```

**If it fails:**
1. Read the error
2. Fix the issue
3. Re-run validation
4. Only proceed when passing

### 3.4 Track Progress

```
Task 1: CREATE app/feature/models.py ✅
Task 2: CREATE app/feature/schemas.py ✅
```

**If you deviate from the plan**, document what changed and why.

---

## Phase 4: VALIDATE

### Run All Checks

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

**All must pass with zero errors.**

### Write Tests

You MUST write tests for new code:
- Every new function needs at least one test
- Edge cases need tests
- Update existing tests if behavior changed
- Use `@pytest.mark.integration` for tests requiring real database

**If tests fail:**
1. Determine: bug in implementation or test?
2. Fix the actual issue
3. Re-run until green

---

## Phase 5: REPORT

### Create Report

**Output path**: `.agents/reports/{plan-name}-report.md`

```bash
mkdir -p .agents/reports
```

```markdown
# Implementation Report

**Plan**: `{plan-path}`
**Branch**: `{branch-name}`
**Status**: COMPLETE

## Summary

{Brief description of what was implemented}

## Tasks Completed

| # | Task | File | Status |
|---|------|------|--------|
| 1 | {description} | `app/feature/models.py` | ✅ |
| 2 | {description} | `app/feature/schemas.py` | ✅ |

## Validation Results

| Check | Result |
|-------|--------|
| Ruff lint | ✅ |
| Ruff format | ✅ |
| MyPy | ✅ |
| Pyright | ✅ |
| Tests | ✅ ({N} passed) |

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `app/feature/models.py` | CREATE | +{N} |
| `app/feature/schemas.py` | CREATE | +{N} |

## Deviations from Plan

{List any deviations with rationale, or "None"}

## Tests Written

| Test File | Test Cases |
|-----------|------------|
| `app/feature/tests/test_service.py` | {list} |
```

### Archive Plan

```bash
mkdir -p .agents/plans/completed
mv {plan-path} .agents/plans/completed/
```

---

## Phase 6: OUTPUT

```markdown
## Implementation Complete

**Plan**: `{plan-path}`
**Branch**: `{branch-name}`
**Status**: ✅ Complete

### Validation

| Check | Result |
|-------|--------|
| Ruff lint | ✅ |
| Ruff format | ✅ |
| MyPy | ✅ |
| Pyright | ✅ |
| Tests | ✅ |

### Files Changed

- {N} files created
- {M} files updated
- {K} tests written

### Deviations

{Summary or "Implementation matched the plan."}

### Artifacts

- Report: `.agents/reports/{name}-report.md`
- Plan archived: `.agents/plans/completed/`

### Next Steps

1. Review the report
2. Create PR: `gh pr create`
3. Merge when approved
```

---

## Handling Failures

| Failure | Action |
|---------|--------|
| MyPy/Pyright fails | Read error, fix type issue, re-run |
| Tests fail | Fix implementation or test, re-run |
| Ruff lint fails | Run `uv run ruff check --fix .`, then manual fixes |
| Ruff format fails | Run `uv run ruff format .` |
