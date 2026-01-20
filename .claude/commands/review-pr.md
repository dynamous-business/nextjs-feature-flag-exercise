---
description: PR code review - checks diff, patterns, runs validation, comments on PR
argument-hint: <pr-number|pr-url>
---

# PR Code Review

**Input**: $ARGUMENTS

## Your Mission

Perform a thorough code review:
1. **Understand** what the PR is trying to accomplish
2. **Check** the code against project patterns
3. **Run** validation (type-check, lint, tests)
4. **Identify** issues by severity
5. **Report** findings as PR comment AND local file

**Golden Rule**: Be constructive and actionable. Every issue should have a clear recommendation.

---

## Phase 1: FETCH

### Get PR Context

```bash
# Get PR details
gh pr view {NUMBER} --json number,title,body,author,headRefName,baseRefName,files

# Get the diff
gh pr diff {NUMBER}

# Checkout PR branch
gh pr checkout {NUMBER}
```

**Extract**: PR number, title, description, author, files changed.

---

## Phase 2: REVIEW

### Read Project Rules

- Read `CLAUDE.md` for project conventions
- Read `README.md` for context

### Review Each Changed File

For each file, check:

| Category | Check |
|----------|-------|
| **Correctness** | Does the code do what the PR claims? |
| **Type Safety** | Are types explicit, no implicit `any`? |
| **Patterns** | Does it follow existing codebase patterns? |
| **Error Handling** | Are errors handled appropriately? |
| **Tests** | Are there tests for new code? |

### Categorize Issues

| Severity | Criteria |
|----------|----------|
| **Critical** | Security issues, data loss, crashes |
| **High** | Type violations, missing error handling, logic errors |
| **Medium** | Pattern inconsistencies, missing edge cases |
| **Low** | Style suggestions, minor improvements |

---

## Phase 3: VALIDATE

Run automated checks:

```bash
# Type check
pnpm run build

# Lint
pnpm run lint

# Tests
pnpm test
```

Capture pass/fail status for each.

---

## Phase 4: DECIDE

**APPROVE** if:
- No critical or high issues
- All validation passes
- Code follows patterns

**REQUEST CHANGES** if:
- High priority issues exist
- Validation fails
- Pattern violations need addressing

---

## Phase 5: REPORT

### Create Report

**Output path**: `.agents/reviews/pr-{NUMBER}-review.md`

```bash
mkdir -p .agents/reviews
```

```markdown
# PR Review: #{NUMBER} - {TITLE}

**Author**: @{author}
**Branch**: {head} -> {base}
**Recommendation**: {APPROVE/REQUEST CHANGES}

## Summary

{2-3 sentences: What this PR does and overall assessment}

## Issues Found

### Critical
{List or "None"}

### High Priority
{List or "None"}

### Medium Priority
{List or "None"}

### Suggestions
{List or "None"}

## Validation Results

| Check | Status |
|-------|--------|
| Type Check | {PASS/FAIL} |
| Lint | {PASS/FAIL} |
| Tests | {PASS/FAIL} |

## What's Good

{Acknowledge positive aspects}

## Recommendation

**{APPROVE/REQUEST CHANGES}**

{What needs to happen next}
```

### Post to GitHub

```bash
# Post review
gh pr review {NUMBER} --comment --body-file .agents/reviews/pr-{NUMBER}-review.md
```

---

## Phase 6: OUTPUT

```markdown
## PR Review Complete

**PR**: #{NUMBER} - {TITLE}
**Recommendation**: {APPROVE/REQUEST CHANGES}

### Issues Found

| Severity | Count |
|----------|-------|
| Critical | {N} |
| High | {N} |
| Medium | {N} |

### Validation

| Check | Result |
|-------|--------|
| Type Check | {PASS/FAIL} |
| Lint | {PASS/FAIL} |
| Tests | {PASS/FAIL} |

### Artifacts

- Report: `.agents/reviews/pr-{NUMBER}-review.md`
```
