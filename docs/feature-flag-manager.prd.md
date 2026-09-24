# Feature Flag Manager

## Problem Statement

Engineering teams need a centralized way to manage feature flags across their applications. Currently, flags are scattered across config files, environment variables, and third-party services, making it difficult to quickly toggle features during deployments or incidents. Teams need a self-hosted solution that provides visibility into all flags, supports multiple environments, and enables rapid changes without code deployments.

## Key Hypothesis

We believe a dedicated feature flag management dashboard will solve the flag discovery and control problem for engineering teams.
We'll know we're right when teams can create, find, and toggle any flag within 10 seconds.

## Users

**Primary User**: Software engineers who manage feature flags daily, particularly during deployments, A/B testing, and incident response.

**Job to Be Done**: When I need to control a feature's rollout or quickly disable something during an incident, I want a single dashboard where I can manage all flags, so I can make changes confidently without touching code or restarting services.

**Non-Users**: End users of the applications using these flags. This is purely an internal developer tool.

## Solution

A full-stack feature flag management application with:
- **Backend**: Express.js REST API with SQL.js for persistence
- **Frontend**: React dashboard with Radix UI components
- **Features**: Full CRUD operations, environment support, rollout percentages, flag types, and filtering

### MVP Scope

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Create feature flags with metadata | Core functionality - need to define flags |
| Must | List all flags in a table view | Need visibility into existing flags |
| Must | Edit flag properties | Flags evolve over time |
| Must | Toggle flag enabled/disabled | Primary use case for quick changes |
| Must | Delete flags | Clean up deprecated flags |
| Must | Support multiple environments | Dev/staging/prod have different configs |
| Must | Support flag types | Distinguish release, experiment, operational, permission |
| Must | Rollout percentages | Gradual rollouts reduce risk |
| Should | Filter flags by criteria | Quickly find relevant flags (environment, status, type, owner) |
| Should | Search by flag name | Fastest way to locate known flags |
| Should | Clear all filters | UX convenience |
| Won't | Flag evaluation SDK | Out of scope - this is the management UI only |
| Won't | Audit logging | Deferred to future version |
| Won't | User authentication | Simplified for workshop purposes |

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Time to create flag | <30 seconds | User testing |
| Time to find and toggle flag | <10 seconds | User testing with filtering |
| API response time | <100ms | Performance monitoring |

## Technical Architecture

### Tech Stack

**Backend (server/)**
- Runtime: Node.js with ES Modules
- Framework: Express.js v5
- Database: SQL.js (SQLite compiled to WASM)
- Validation: Zod
- Testing: Vitest

**Frontend (client/)**
- Framework: React 19 with Vite
- Styling: Tailwind CSS v4
- UI Components: Radix UI primitives
- State: TanStack Query (React Query)
- Icons: Lucide React

**Shared**
- TypeScript throughout
- Shared type definitions in `shared/types.ts`

### Data Model

```typescript
interface FeatureFlag {
  id: string              // UUID
  name: string            // Unique, kebab-case
  description: string
  enabled: boolean
  environment: 'development' | 'staging' | 'production'
  type: 'release' | 'experiment' | 'operational' | 'permission'
  rolloutPercentage: number  // 0-100
  owner: string           // Team name
  tags: string[]
  createdAt: string       // ISO timestamp
  updatedAt: string
  expiresAt: string | null
  lastEvaluatedAt: string | null
}
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /health | Server health check |
| GET | /api/flags | List all flags (with optional query filters) |
| GET | /api/flags/:id | Get single flag |
| POST | /api/flags | Create new flag |
| PUT | /api/flags/:id | Update flag |
| DELETE | /api/flags/:id | Delete flag |

## Open Questions

- [x] What database to use? → SQL.js for simplicity and portability
- [x] Authentication needed? → No, simplified for workshop
- [ ] Should filter state persist in URL for shareable links?
- [ ] Performance threshold for filtering with large flag counts?

## Implementation Phases

| # | Phase | Description | Status | Depends |
|---|-------|-------------|--------|---------|
| 1 | Core Infrastructure | Express server setup, SQL.js database, health endpoint, error handling | complete | - |
| 2 | Data Model & API | Flag schema, CRUD endpoints, Zod validation, unit tests | complete | 1 |
| 3 | Frontend Foundation | React/Vite setup, Tailwind config, Radix UI components, API client | complete | - |
| 4 | Flag Management UI | Table view, create/edit modal, delete confirmation, toggle switch | complete | 2, 3 |
| 5 | Filtering & Search | Query param support, filter UI, search input, clear filters, filter persistence | pending | 4 |

---

*Generated: 2026-01-21*
*Status: IN PROGRESS - Phases 1-4 complete, Phase 5 pending*
