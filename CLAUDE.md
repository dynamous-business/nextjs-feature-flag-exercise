# CLAUDE.md — Feature Flag Manager

## What this is

A small feature flag dashboard: create, edit, toggle and delete flags across environments, with flag types,
owners, tags and rollout percentages. It is the hands-on project for the Agentic Engineering masterclass, and
the ticket everyone works on is in `TASK.md`. Stack: Express 5 + SQL.js (SQLite in WASM) + Zod on the backend,
React 19 + Vite + Tailwind v4 + Radix UI + TanStack Query on the frontend, TypeScript strict everywhere, pnpm.

## Architecture map

```
shared/types.ts                  # THE data contract (FeatureFlag, CreateFlagInput, ...). Change types here first.
server/                          # Express API, port 3001
  src/index.ts                   # app setup, mounts /api/flags, error handler last
  src/db/                        # client.ts (SQL.js singleton, file persistence), schema.ts, seed.ts (sample flags)
  src/middleware/validation.ts   # Zod schemas: every request body is parsed here before business logic
  src/middleware/error.ts        # NotFoundError / ConflictError / ValidationError + the JSON error handler
  src/services/flags.ts          # business logic + SQL. Routes never touch the database directly
  src/routes/flags.ts            # thin HTTP handlers: parse, call a service, respond, next(error)
  src/__tests__/flags.test.ts    # Vitest, fresh in-memory DB per test via _resetDbForTesting()
client/                          # React app, port 3000
  src/api/flags.ts               # typed fetch wrappers, the only place that knows URLs
  src/App.tsx                    # page state + React Query queries/mutations
  src/components/                # feature components (flags-table, flag-form-modal, delete-confirm-dialog)
  src/components/ui/             # shadcn/Radix primitives. Compose these, don't restyle them per feature
docs/                            # PRD + on-demand reference docs (see below)
```

Data flows one way through the layers: types → Zod schema → service → route → client API → UI.

## Ground rules (conventions)

- **Types:** `shared/types.ts` is the single source of truth, imported via `@shared/*`. Use `import type`.
  No `any`, no implicit null. Unions for enums (`'development' | 'staging' | 'production'`).
- **Backend layering:** routes → services → database. Validate with Zod *before* business logic. Every route
  handler is `try { ... } catch (error) { next(error) }`, and errors are the custom classes in `error.ts`,
  which the handler turns into `{ error, message, statusCode }`.
- **SQL.js:** always `stmt.free()` in a `finally`. Parameterized queries only, never string-built SQL values.
- **Frontend:** server state lives in React Query (`useQuery` / `useMutation` + invalidate), never copied into
  `useState`. Class names go through `cn()`. Files are kebab-case, components PascalCase, props interfaces are
  `ComponentNameProps`.
- **Git:** never commit to `main`. Work on a branch cut from the exercise branch you're on.
- **Testing:** backend behavior gets a Vitest test in `server/src/__tests__/`. "Done" means every check under
  Commands passes with zero errors.

## Working principles

- **Approach:** read the ticket's acceptance criteria first and plan before any non-trivial change. State
  assumptions and open questions before writing code.
- **When unsure:** ask. Never invent a requirement the ticket doesn't state.
- **Scope:** do exactly what the ticket asks. Note adjacent problems, don't fix them inline.
- **Verify:** run the real checks below, and for UI work exercise the running app in a browser the way a user
  would. Tests you just wrote are not the oracle on their own.

## Commands

Run from the package directory. Start both dev servers for any UI check (two terminals).

| | `server/` | `client/` |
|---|---|---|
| install | `pnpm install` | `pnpm install` |
| run | `pnpm dev` (3001) | `pnpm dev` (3000) |
| type-check | `pnpm run build` | `pnpm run build` (tsc + vite build) |
| lint | `pnpm run lint` | `pnpm run lint` |
| test | `pnpm test` | (no client tests) |

Full validation: `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`

## On-demand context

Read these only when the task needs them:

| Topic | File |
|---|---|
| Product requirements | `docs/feature-flag-manager.prd.md` |
| Backend patterns (layers, services, validation, errors, tests) | `docs/reference/backend.md` |
| Frontend patterns (components, React Query, forms, styling) | `docs/reference/frontend.md` |

## AI Layer

This branch ships the AI Layer in `.claude/`: skills (`.claude/skills/`), subagents (`.claude/agents/`),
reference guides (`.claude/references/`) and hook templates (`.claude/hooks/`, off until you create
`.claude/settings.json`). The loop is **prime → plan → implement → validate → review → commit → PR**:
`/prime-codebase`, `/piv-plan-implementation`, `/piv-implement`, `/piv-validate`, `/piv-review-changes`,
`/piv-commit`, `/piv-create-pr`.

- Plans go in `.claude/plans/`, execution reports in `.claude/reports/`. Commit the plan before implementing,
  so it's a rollback point.
- Implement in a **fresh session** that gets only the plan path. Review in another fresh session: the agent
  doesn't grade its own homework.
