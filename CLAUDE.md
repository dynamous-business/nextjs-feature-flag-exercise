# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workshop Context

This is an exercise for the Agentic Engineering Workshop. The task is to implement feature flag filtering (see `task.md`).

### Branch Rules

- **Base branch**: `exercise-1` or `exercise-2`
- You may create new branches from these
- **Never** commit or push to `main`

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

## Architecture

### Project Structure

```
shared/types.ts       # Shared TypeScript types (FeatureFlag, CreateFlagInput, etc.)
server/               # Express backend (port 3001)
client/               # React frontend (port 3000)
```

### Data Flow

1. **Types** (`shared/types.ts`) - Single source of truth for data contracts
2. **Validation** (`server/src/middleware/validation.ts`) - Zod schemas validate requests
3. **Services** (`server/src/services/flags.ts`) - Business logic and database operations
4. **Routes** (`server/src/routes/flags.ts`) - Express route handlers call services
5. **Client API** (`client/src/api/flags.ts`) - Fetch wrappers with typed responses
6. **UI** (`client/src/App.tsx`) - React Query for state management

### Key Patterns

- **Database**: sql.js (SQLite in-memory), statements use try-finally for cleanup
- **Validation**: Zod schemas in `validation.ts`, parsed in route handlers
- **Error handling**: Custom error classes (`NotFoundError`, `ConflictError`), global error middleware
- **Frontend state**: React Query (`useQuery`, `useMutation`) with automatic cache invalidation
- **Components**: shadcn/ui primitives in `components/ui/`, feature components compose them

### API Endpoints

- `GET /api/flags` - List all flags
- `GET /api/flags/:id` - Get single flag
- `POST /api/flags` - Create flag
- `PUT /api/flags/:id` - Update flag
- `DELETE /api/flags/:id` - Delete flag

## Custom Commands

Available slash commands in `.claude/commands/`:

- `/prime` - Load project context before working
- `/prime-client` - Focus on frontend codebase
- `/prime-server` - Focus on backend codebase
- `/prime-components` - Learn component patterns
- `/prime-endpoint` - Learn endpoint patterns (types → validation → service → route → client)
- `/prd` - Generate a product requirements document
- `/plan` - Create implementation plan from feature description
- `/implement` - Execute a plan with validation loops
- `/review` - Code review (PR, file, folder, or unstaged changes)
- `/validate` - Run all linters, type checks, and tests
- `/install` - Install dependencies and start both servers

## Output Directories

Commands that generate artifacts use `.agents/`:
- `.agents/PRDs/` - Product requirement documents
- `.agents/plans/` - Implementation plans
- `.agents/reviews/` - Code review reports
- `.agents/reports/` - Implementation reports
