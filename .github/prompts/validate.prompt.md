---
description: "Run linter, type checkers, and tests - report any failures"
agent: "agent"
tools:
  - runInTerminal
  - problems
  - runTests
  - readFile
---

# Validate

Run all validation checks and report results.

---

## Checks to Run

```bash
# Linting
uv run ruff check .

# Formatting check
uv run ruff format --check .

# Type check (MyPy strict)
uv run mypy app/

# Type check (Pyright strict)
uv run pyright app/

# Tests
uv run pytest -v
```

---

## Process

1. Run linting and formatting checks, capture output
2. Run both type checkers, capture output
3. Run tests, capture output
4. Collect all failures
5. Report results

---

## Output

Report in this format:

```
## Validation Results

| Check | Result | Details |
|-------|--------|---------|
| Ruff lint | pass/fail | {N errors or "passed"} |
| Ruff format | pass/fail | {N files need formatting or "passed"} |
| MyPy | pass/fail | {N errors or "passed"} |
| Pyright | pass/fail | {N errors or "passed"} |
| Tests | pass/fail | {N passed, M failed} |

### Summary
- **Status**: ALL PASSING / {N} FAILURES
- **Action needed**: {None / list of things to fix}
```

---

## If Failures Found

List each failure with:
1. File and line number
2. Error message
3. Suggested fix (if obvious)

Example:
```
### Failures

1. **app/core/health.py:42**
   - Error: `Incompatible return type "str"; expected "dict[str, Any]"`
   - Fix: Update return type annotation

2. **app/shared/schemas.py:15**
   - Error: `Variable "x" is not defined`
   - Fix: Remove unused variable or add import
```
