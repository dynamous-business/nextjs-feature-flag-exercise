# Plan: Feature Flag Filtering

## Summary

Add end-to-end filtering for the feature flags list. Filters (environment, enabled status, type, owner, name search) are sent as query params from the client, validated and parsed in the route layer, applied as a dynamic SQL WHERE clause in the service, and exposed in a new filter bar UI component above the flags table. AND logic is used between all active filters.

## User Story

As a software engineer managing feature flags,
I want to filter flags by environment, status, type, owner, and name,
So that I can quickly find and manage the flags relevant to my current task.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | MEDIUM |
| Systems Affected | shared/types, server/services, server/routes, server/tests, client/api, client/App.tsx, client/components |

---

## Patterns to Follow

### Dynamic SQL WHERE clause (mirror from updateFlag)
```typescript
// SOURCE: server/src/services/flags.ts:188-230
const updates: string[] = []
const values: (string | number | null)[] = []

if (input.name !== undefined) {
  updates.push('name = ?')
  values.push(input.name)
}
// ... then:
db.prepare(`UPDATE flags SET ${updates.join(', ')} WHERE id = ?`)
```
For filters, same pattern but conditions array joined with ` AND `, prefixed with `WHERE` only if non-empty.

### SQL.js exec (simple full-table read, mirror from getAllFlags)
```typescript
// SOURCE: server/src/services/flags.ts:83-86
export async function getAllFlags(): Promise<FeatureFlag[]> {
  const db = await getDb()
  const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
  return resultToRows(result).map(rowToFlag)
}
```
For filtered queries, switch to `db.exec(sql, params)` — SQL.js `exec` accepts a second argument for bound params.

### Route query param parsing (Express)
```typescript
// SOURCE: server/src/routes/flags.ts:11-18
flagsRouter.get('/', async (_req, res, next) => {
  try {
    const flags = await getAllFlags()
    res.json(flags)
  } catch (error) {
    next(error)
  }
})
// req.query values are always string | string[] | ParsedQs — must coerce types
```

### Zod validation schema (mirror from validation.ts)
```typescript
// SOURCE: server/src/middleware/validation.ts:3-15
export const createFlagSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  enabled: z.boolean(),
})
// For query params, all values arrive as strings — use z.enum() for constrained fields,
// z.enum(['true','false']).transform(v => v === 'true') for booleans
```

### Client API function (mirror from getFlags/createFlag)
```typescript
// SOURCE: client/src/api/flags.ts:35-44
export async function getFlags(): Promise<FeatureFlag[]> {
  try {
    const response = await fetch(`${API_BASE}/flags`)
    return handleResponse<FeatureFlag[]>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}
```

### React Query with dynamic query key (mirror from App.tsx)
```typescript
// SOURCE: client/src/App.tsx:20-23
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags'],
  queryFn: getFlags,
})
// Change to: queryKey: ['flags', filters] so React Query refetches on filter change
```

### Component props interface (mirror from FlagsTable)
```typescript
// SOURCE: client/src/components/flags-table.tsx:14-18
interface FlagsTableProps {
  flags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flag: FeatureFlag) => void
}
```

### Select + Input UI pattern (mirror from flag-form-modal.tsx)
```typescript
// SOURCE: client/src/components/flag-form-modal.tsx:14-20, 29-31
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
const environments: Environment[] = ['development', 'staging', 'production']
const flagTypes: FlagType[] = ['release', 'experiment', 'operational', 'permission']
```

### Test structure (mirror from flags.test.ts)
```typescript
// SOURCE: server/src/__tests__/flags.test.ts:46-57
describe('getAllFlags', () => {
  it('returns empty array when no flags exist', async () => {
    const flags = await getAllFlags()
    expect(flags).toEqual([])
  })
  it('returns all flags', async () => {
    await createFlag(validFlagInput)
    const flags = await getAllFlags()
    expect(flags).toHaveLength(1)
  })
})
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `shared/types.ts` | UPDATE | Add `FlagFilters` interface |
| `server/src/services/flags.ts` | UPDATE | Add optional filters param to `getAllFlags()`, build dynamic WHERE clause |
| `server/src/middleware/validation.ts` | UPDATE | Add `flagFiltersSchema` for query param validation |
| `server/src/routes/flags.ts` | UPDATE | Parse + validate query params, pass filters to service |
| `server/src/__tests__/flags.test.ts` | UPDATE | Add `getAllFlags` filter test cases |
| `client/src/api/flags.ts` | UPDATE | Accept `FlagFilters` in `getFlags()`, serialize to query string |
| `client/src/App.tsx` | UPDATE | Add `filters` state, pass to query key and `getFlags`, render filter bar |
| `client/src/components/flag-filters.tsx` | CREATE | Filter bar UI: selects for environment/type/enabled, inputs for owner/name, clear button |

---

## Tasks

### Task 1: Add `FlagFilters` type to shared types

- **File**: `shared/types.ts`
- **Action**: UPDATE
- **Implement**: Add and export a `FlagFilters` interface with all fields optional:
  - `environment?: Environment`
  - `enabled?: boolean`
  - `type?: FlagType`
  - `owner?: string`
  - `name?: string` (partial match)
- **Mirror**: `shared/types.ts:1-46` — follow existing union type and interface style
- **Validate**: `cd server && pnpm run build` and `cd client && pnpm run build`

---

### Task 2: Update `getAllFlags()` service to accept filters

- **File**: `server/src/services/flags.ts`
- **Action**: UPDATE
- **Implement**:
  - Import `FlagFilters` from shared types
  - Change signature to `getAllFlags(filters: FlagFilters = {}): Promise<FeatureFlag[]>`
  - Build a `conditions: string[]` array and `params: (string | number)[]` array
  - For each filter present, push the appropriate SQL condition and value:
    - `environment`: `conditions.push('environment = ?')`, `params.push(filters.environment)`
    - `enabled`: `conditions.push('enabled = ?')`, `params.push(filters.enabled ? 1 : 0)`
    - `type`: `conditions.push('type = ?')`, `params.push(filters.type)`
    - `owner`: `conditions.push('owner = ?')`, `params.push(filters.owner)`
    - `name`: `conditions.push('name LIKE ?')`, `params.push('%' + filters.name + '%')`
  - Build final SQL: `SELECT * FROM flags` + (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ``) + ` ORDER BY created_at DESC`
  - Call `db.exec(sql, params)` (SQL.js accepts params as second arg to exec)
- **Mirror**: `server/src/services/flags.ts:188-230` — same dynamic array-building pattern as `updateFlag`
- **Validate**: `cd server && pnpm run build`

---

### Task 3: Add `flagFiltersSchema` to validation middleware

- **File**: `server/src/middleware/validation.ts`
- **Action**: UPDATE
- **Implement**: Export a new `flagFiltersSchema`:
  - `environment`: `z.enum(['development','staging','production']).optional()`
  - `type`: `z.enum(['release','experiment','operational','permission']).optional()`
  - `enabled`: `z.enum(['true','false']).transform(v => v === 'true').optional()`
  - `owner`: `z.string().optional()`
  - `name`: `z.string().optional()`
- **Mirror**: `server/src/middleware/validation.ts:3-15` — follow existing Zod schema style
- **Validate**: `cd server && pnpm run build`

---

### Task 4: Update `GET /api/flags` route to parse and forward filters

- **File**: `server/src/routes/flags.ts`
- **Action**: UPDATE
- **Implement**:
  - Import `flagFiltersSchema` from validation middleware
  - Replace `_req` with `req` in the GET `/` handler
  - Parse `req.query` with `flagFiltersSchema.parse(req.query)` and pass result to `getAllFlags(filters)`
- **Mirror**: `server/src/routes/flags.ts:34-42` — same Zod parse + `next(error)` pattern as POST handler
- **Validate**: `cd server && pnpm run build`

---

### Task 5: Add filter test cases to the test suite

- **File**: `server/src/__tests__/flags.test.ts`
- **Action**: UPDATE
- **Implement**: Add a new `describe('getAllFlags with filters', ...)` block with these cases:
  - Filters by `environment`: create flags in dev + prod, filter for prod, expect only prod flag
  - Filters by `enabled`: create enabled + disabled flags, filter `{ enabled: true }`, expect only enabled
  - Filters by `type`: create release + experiment flags, filter `{ type: 'release' }`, expect only release
  - Filters by `owner`: create flags with different owners, filter by owner, expect correct subset
  - Filters by `name` partial match: create `my-feature-flag` and `other-flag`, filter `{ name: 'feature' }`, expect only first
  - Multiple filters combined: create 3 flags, apply 2 filters, expect only the one matching flag
  - No match returns empty array: filter with values that match nothing, expect `[]`
- **Mirror**: `server/src/__tests__/flags.test.ts:46-57` — `describe` + `it` structure, `createFlag` seeding, `expect().toHaveLength()` assertions
- **Validate**: `cd server && pnpm test`

---

### Task 6: Update client `getFlags()` to accept and serialize filters

- **File**: `client/src/api/flags.ts`
- **Action**: UPDATE
- **Implement**:
  - Import `FlagFilters` from `@shared/types`
  - Change signature to `getFlags(filters: FlagFilters = {}): Promise<FeatureFlag[]>`
  - Build a `URLSearchParams` from the filters object, skipping `undefined` values; convert `enabled` boolean to `'true'`/`'false'` string
  - Append `?${params.toString()}` to the fetch URL only when params is non-empty
- **Mirror**: `client/src/api/flags.ts:35-44` — same try/catch + TypeError handling pattern
- **Validate**: `cd client && pnpm run build`

---

### Task 7: Add filter state to `App.tsx` and wire up React Query

- **File**: `client/src/App.tsx`
- **Action**: UPDATE
- **Implement**:
  - Import `FlagFilters` from `@shared/types`
  - Import the new `FlagFiltersBar` component
  - Add `const [filters, setFilters] = useState<FlagFilters>({})`
  - Update `useQuery` to `queryKey: ['flags', filters]` and `queryFn: () => getFlags(filters)`
  - Render `<FlagFiltersBar filters={filters} onChange={setFilters} />` between the header row and the loading/table section
- **Mirror**: `client/src/App.tsx:14-23` — existing `useState` + `useQuery` pattern
- **Validate**: `cd client && pnpm run build`

---

### Task 8: Create `FlagFiltersBar` component

- **File**: `client/src/components/flag-filters.tsx`
- **Action**: CREATE
- **Implement**:
  - Export `FlagFiltersBar` with props `{ filters: FlagFilters, onChange: (f: FlagFilters) => void }`
  - Controls:
    - **Name** — `<Input>` text field, updates `filters.name` (debounce 300ms via `useEffect` + `setTimeout`)
    - **Environment** — `<Select>` with options: All, development, staging, production
    - **Status** — `<Select>` with options: All, Enabled, Disabled
    - **Type** — `<Select>` with options: All, release, experiment, operational, permission
    - **Owner** — `<Input>` text field, updates `filters.owner` (debounce 300ms)
  - **Active filter indicator** — count of non-undefined filter values; show badge or text like "3 active"
  - **Clear All button** — `<Button variant="ghost">` that calls `onChange({})`, only rendered when at least one filter is set
- **Mirror**: `client/src/components/flag-form-modal.tsx:1-31` for imports/Select pattern; `client/src/components/flags-table.tsx:14-18` for props interface style
- **Validate**: `cd client && pnpm run build && pnpm run lint`

---

## Validation

```bash
# Server — type check, lint, tests
cd server && pnpm run build && pnpm run lint && pnpm test

# Client — type check and build
cd client && pnpm run build && pnpm run lint
```

---

## Acceptance Criteria

- [ ] `FlagFilters` type exported from `shared/types.ts`
- [ ] `getAllFlags(filters)` builds correct dynamic SQL WHERE clause
- [ ] All 7+ filter test cases pass
- [ ] `GET /api/flags?environment=production&enabled=true` returns only matching flags
- [ ] Multiple filters applied simultaneously with AND logic
- [ ] `getFlags(filters)` serializes params correctly to query string
- [ ] Filter state in `App.tsx` is included in React Query `queryKey`
- [ ] Filter bar renders all 5 controls and a clear button
- [ ] Clear button only visible when at least one filter is active
- [ ] Active filter count indicator shown when filters are applied
- [ ] Type check passes with zero errors on both client and server
- [ ] ESLint passes with zero errors on both client and server
