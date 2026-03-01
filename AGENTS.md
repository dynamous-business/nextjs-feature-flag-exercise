# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workshop Context

This is an exercise for the Agentic Engineering Workshop. The task is to implement feature flag filtering (see `TASK.md`).

### Branch Rules

- **Base branch**: `exercise-3`
- You may create new branches from these
- **Never** commit or push to `main`

---

## Tech Stack

### Backend (`server/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ES Modules | Runtime with native ESM |
| Express.js | v5 | HTTP framework |
| SQL.js | - | SQLite compiled to WASM (in-memory with file persistence) |
| Zod | - | Schema validation |
| Vitest | - | Testing framework |
| TypeScript | Strict mode | Type safety |

### Frontend (`client/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | - | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first styling |
| Radix UI | - | Headless accessible components |
| TanStack Query | v5 | Server state management |
| Lucide React | - | Icons |
| TypeScript | Strict mode | Type safety |

### Shared

- **`shared/types.ts`** - Single source of truth for data contracts
- Path aliases: `@shared/*` maps to `shared/*`

---

## Commands

### Server (from `server/` directory)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3001)
pnpm run build        # Type check (tsc)
pnpm run lint         # Run ESLint
pnpm test             # Run tests (vitest)
pnpm test -- --watch  # Run tests in watch mode
```

### Client (from `client/` directory)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3000)
pnpm run build        # Type check and build (tsc + vite)
pnpm run lint         # Run ESLint
```

---

## Architecture

### Project Structure

```
shared/types.ts         # Shared TypeScript types (FeatureFlag, CreateFlagInput, etc.)
server/                 # Express backend (port 3001)
  src/
    db/                 # Database client, schema, seeding
    middleware/         # Validation (Zod), error handling
    services/           # Business logic layer
    routes/             # Express route handlers
    __tests__/          # Vitest tests
client/                 # React frontend (port 3000)
  src/
    api/                # API client functions
    components/         # Feature components
    components/ui/      # Radix UI primitives (shadcn)
    lib/                # Utilities (cn function)
.agents/                # AI context
  PRDs/                 # Product Requirements Documents
  reference/            # On-demand context docs
.claude/
  commands/             # Slash commands (/prime, /plan, /implement, etc.)
  skills/               # Agent skills
```

### Data Flow

1. **Types** (`shared/types.ts`) - Define data contracts first
2. **Validation** (`server/src/middleware/validation.ts`) - Zod schemas validate requests
3. **Services** (`server/src/services/flags.ts`) - Business logic and database operations
4. **Routes** (`server/src/routes/flags.ts`) - Express handlers call services, use `next(error)` for errors
5. **Client API** (`client/src/api/flags.ts`) - Fetch wrappers with typed responses
6. **UI** (`client/src/App.tsx`) - React Query for state management

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/flags` | List all flags |
| GET | `/api/flags/:id` | Get single flag |
| POST | `/api/flags` | Create flag |
| PUT | `/api/flags/:id` | Update flag |
| DELETE | `/api/flags/:id` | Delete flag |

---

## Code Style & Patterns

### TypeScript

- **Strict mode enabled** - No `any`, no implicit `null`
- **Use `type` imports** - `import type { FeatureFlag } from '@shared/types'`
- **Props interfaces** - Define `ComponentNameProps` for all components
- **Union types for enums** - `'development' | 'staging' | 'production'`

### Backend Patterns

- **Layered architecture**: Routes → Services → Database
- **Error propagation**: Always use `next(error)` in route handlers
- **Custom errors**: Use `NotFoundError`, `ConflictError`, `ValidationError`
- **SQL.js statements**: Always use `try-finally` with `stmt.free()`
- **Validation first**: Parse with Zod before business logic

### Frontend Patterns

- **React Query for async state** - `useQuery` for fetches, `useMutation` for side effects
- **Controlled components** - State via `useState`, update via `onChange`
- **Tailwind with cn()** - Always use `cn()` for class composition
- **Radix UI primitives** - Compose from `components/ui/`
- **File naming**: kebab-case for files, PascalCase for components

---

## Testing Strategy

### Backend Tests (Vitest)

- **Location**: `server/src/__tests__/`
- **Isolation**: Fresh in-memory database per test via `_resetDbForTesting()`
- **Pattern**: `describe` blocks by feature, `it` blocks for specific cases
- **Assertions**: `expect().toBe()`, `expect().toThrow()`, `expect().toEqual()`

### Validation Checks

Run these before committing:

```bash
# Server
cd server && pnpm run build && pnpm run lint && pnpm test

# Client
cd client && pnpm run build && pnpm run lint
```

**All checks must pass with zero errors.**

---

## On-Demand Context

For deeper context on specific areas, read these files:

| Topic | File |
|-------|------|
| Project requirements | `.agents/PRDs/feature-flag-manager.prd.md` |
| Frontend patterns | `.agents/reference/frontend.md` |
| Backend patterns | `.agents/reference/backend.md` |

---

## Error Handling

### Backend Error Classes

```typescript
// 404 - Resource not found
throw new NotFoundError(`Flag with id '${id}' not found`)

// 409 - Duplicate/conflict
throw new ConflictError(`Flag with name '${name}' already exists`)

// 400 - Validation error
throw new ValidationError('Invalid input')
```

### Error Response Format

```json
{
  "error": "NOT_FOUND",
  "message": "Flag with id 'abc' not found",
  "statusCode": 404
}
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Types | `shared/types.ts` |
| Zod schemas | `server/src/middleware/validation.ts` |
| Error classes | `server/src/middleware/error.ts` |
| Flag service | `server/src/services/flags.ts` |
| Flag routes | `server/src/routes/flags.ts` |
| API client | `client/src/api/flags.ts` |
| Main UI | `client/src/App.tsx` |
| Table component | `client/src/components/flags-table.tsx` |
| Form modal | `client/src/components/flag-form-modal.tsx` |
