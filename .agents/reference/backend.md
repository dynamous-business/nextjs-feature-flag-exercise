# Backend Best Practices

On-demand context for building backend features in this codebase.

---

## Architecture

### Layered Structure

```
Routes (HTTP) → Services (Business Logic) → Database (Persistence)
     ↓                    ↓                        ↓
 validation.ts       flags.ts                 client.ts
```

### File Structure

```
server/src/
├── db/
│   ├── client.ts       # Database connection (singleton)
│   ├── schema.ts       # Table creation SQL
│   └── seed.ts         # Sample data
├── middleware/
│   ├── validation.ts   # Zod schemas
│   └── error.ts        # Error classes + handler
├── services/
│   └── flags.ts        # Business logic
├── routes/
│   └── flags.ts        # Express route handlers
├── __tests__/
│   └── flags.test.ts   # Vitest tests
└── index.ts            # Express app setup
```

---

## Express Routes

### Route Handler Pattern

```typescript
// See: server/src/routes/flags.ts

router.get('/', async (req, res, next) => {
  try {
    const flags = await getAllFlags()
    res.json(flags)
  } catch (error) {
    next(error)  // Always delegate to error middleware
  }
})
```

### RESTful Endpoints

| Method | Route | Service Function | Status |
|--------|-------|------------------|--------|
| GET | `/api/flags` | `getAllFlags()` | 200 |
| GET | `/api/flags/:id` | `getFlagById(id)` | 200 |
| POST | `/api/flags` | `createFlag(input)` | 201 |
| PUT | `/api/flags/:id` | `updateFlag(id, input)` | 200 |
| DELETE | `/api/flags/:id` | `deleteFlag(id)` | 200 |

### Request Validation

```typescript
import { createFlagSchema } from '../middleware/validation.js'

router.post('/', async (req, res, next) => {
  try {
    // Validate first
    const input = createFlagSchema.parse(req.body)

    // Then process
    const flag = await createFlag(input)
    res.status(201).json(flag)
  } catch (error) {
    next(error)
  }
})
```

---

## Zod Validation

### Location

`server/src/middleware/validation.ts`

### Schema Definition

```typescript
import { z } from 'zod'

export const createFlagSchema = z.object({
  name: z.string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})

// Partial schema for updates (all fields optional)
export const updateFlagSchema = createFlagSchema.partial()
```

### Common Zod Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `.string()` | String type | `z.string()` |
| `.number()` | Number type | `z.number()` |
| `.boolean()` | Boolean type | `z.boolean()` |
| `.array()` | Array type | `z.array(z.string())` |
| `.enum()` | Union of literals | `z.enum(['a', 'b'])` |
| `.min()` | Minimum value/length | `z.string().min(1)` |
| `.max()` | Maximum value/length | `z.number().max(100)` |
| `.regex()` | Pattern match | `z.string().regex(/^[a-z]+$/)` |
| `.optional()` | Allow undefined | `z.string().optional()` |
| `.nullable()` | Allow null | `z.string().nullable()` |
| `.partial()` | All fields optional | `schema.partial()` |

---

## Error Handling

### Custom Error Classes

```typescript
// See: server/src/middleware/error.ts

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,  // Machine-readable code
    message: string                  // Human-readable message
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message)
  }
}
```

### Usage in Services

```typescript
// 404 - Resource not found
const flag = await getFlagById(id)
if (!flag) {
  throw new NotFoundError(`Flag with id '${id}' not found`)
}

// 409 - Duplicate
const existing = await getFlagByName(input.name)
if (existing) {
  throw new ConflictError(`Flag with name '${input.name}' already exists`)
}
```

### Global Error Handler

```typescript
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err)

  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: messages.join(', '),
      statusCode: 400,
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
    })
  }

  // Generic error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  })
}
```

---

## Service Layer

### Location

`server/src/services/flags.ts`

### CRUD Pattern

```typescript
// Get all
export async function getAllFlags(): Promise<FeatureFlag[]> {
  const db = await getDb()
  const result = db.exec('SELECT * FROM flags')
  return resultToRows(result).map(rowToFlag)
}

// Get by ID
export async function getFlagById(id: string): Promise<FeatureFlag | null> {
  const db = await getDb()
  const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
  try {
    stmt.bind([id])
    if (stmt.step()) {
      return rowToFlag(stmt.getAsObject() as unknown as DbRow)
    }
    return null
  } finally {
    stmt.free()  // Always free statements
  }
}

// Create
export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  // Check for duplicate name
  const existing = await getFlagByName(input.name)
  if (existing) {
    throw new ConflictError(`Flag with name '${input.name}' already exists`)
  }

  const db = await getDb()
  const id = uuid.v4()
  const now = new Date().toISOString()

  db.run(`INSERT INTO flags (...) VALUES (?, ?, ...)`, [
    id,
    input.name,
    // ...
  ])

  saveDb()  // Persist to disk
  return (await getFlagById(id))!
}
```

### SQL.js Statement Pattern

```typescript
// Always use try-finally with stmt.free()
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
try {
  stmt.bind([id])
  if (stmt.step()) {
    return stmt.getAsObject()
  }
  return null
} finally {
  stmt.free()  // Prevent memory leaks
}
```

### Data Transformation

```typescript
// Database row (snake_case)
interface DbRow {
  id: string
  name: string
  rollout_percentage: number
  created_at: string
  // ...
}

// Domain model (camelCase)
interface FeatureFlag {
  id: string
  name: string
  rolloutPercentage: number
  createdAt: string
  // ...
}

// Transform function
function rowToFlag(row: DbRow): FeatureFlag {
  return {
    id: row.id,
    name: row.name,
    rolloutPercentage: row.rollout_percentage,
    createdAt: row.created_at,
    tags: JSON.parse(row.tags),
    // ...
  }
}
```

---

## Database (SQL.js)

### Location

`server/src/db/client.ts`

### Singleton Pattern

```typescript
let db: Database | null = null
let initPromise: Promise<Database> | null = null

export async function getDb(): Promise<Database> {
  if (db) return db

  if (!initPromise) {
    initPromise = initDatabase()
  }

  return initPromise
}

async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs()

  // Try to load existing database
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
    createTables(db)
    seedFlags(db)
    saveDb()
  }

  return db
}
```

### Persistence

```typescript
export function saveDb(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

export function closeDb(): void {
  if (db) {
    saveDb()
    db.close()
    db = null
  }
}
```

### Test Isolation

```typescript
// For tests: inject in-memory database
export function _resetDbForTesting(testDb?: Database | null): void {
  db = testDb ?? null
  initPromise = null
}
```

---

## Testing (Vitest)

### Location

`server/src/__tests__/flags.test.ts`

### Test Setup

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import initSqlJs, { Database } from 'sql.js'
import { _resetDbForTesting } from '../db/client.js'
import { createTables } from '../db/schema.js'

let db: Database

beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()  // Fresh in-memory database
  createTables(db)
  _resetDbForTesting(db)
})

afterEach(() => {
  _resetDbForTesting(null)
  db.close()
})
```

### Test Organization

```typescript
describe('Flag Service', () => {
  describe('getAllFlags', () => {
    it('returns empty array when no flags exist', async () => {
      const flags = await getAllFlags()
      expect(flags).toEqual([])
    })

    it('returns all flags', async () => {
      await createFlag(validInput)
      const flags = await getAllFlags()
      expect(flags).toHaveLength(1)
    })
  })

  describe('createFlag', () => {
    it('creates flag with correct data', async () => {
      const flag = await createFlag(validInput)
      expect(flag.name).toBe('test-flag')
    })

    it('rejects duplicate name', async () => {
      await createFlag(validInput)
      await expect(createFlag(validInput))
        .rejects
        .toThrow('already exists')
    })
  })
})
```

### Common Assertions

```typescript
// Equality
expect(value).toBe(expected)
expect(array).toEqual([1, 2, 3])
expect(array).toHaveLength(3)

// Null checks
expect(result).toBeNull()
expect(result).not.toBeNull()

// Async errors
await expect(asyncFn()).rejects.toThrow('error message')

// Pattern matching
expect(id).toMatch(/^[0-9a-f-]{36}$/)  // UUID format
```

### Test Data Fixture

```typescript
const validFlagInput: CreateFlagInput = {
  name: 'test-flag',
  description: 'Test flag description',
  enabled: true,
  environment: 'development',
  type: 'release',
  rolloutPercentage: 100,
  owner: 'team-test',
  tags: ['test'],
}
```

---

## TypeScript Patterns

### Type Guards

```typescript
function isEnvironment(value: unknown): value is Environment {
  return typeof value === 'string' &&
         ['development', 'staging', 'production'].includes(value)
}

// Usage
const env = row.environment
if (!isEnvironment(env)) {
  throw new Error(`Invalid environment: ${env}`)
}
```

### Strict Casting

```typescript
// Two-step cast for unknown types
const row = stmt.getAsObject() as unknown as DbRow
```

### ESM Imports

```typescript
// Always include .js extension for local imports
import { getDb } from '../db/client.js'
import type { FeatureFlag } from '../../../shared/types.js'
```

---

## Common Patterns

### Partial Update Query

```typescript
export async function updateFlag(
  id: string,
  input: UpdateFlagInput
): Promise<FeatureFlag> {
  const existing = await getFlagById(id)
  if (!existing) {
    throw new NotFoundError(`Flag with id '${id}' not found`)
  }

  // Build dynamic SET clause
  const updates: [string, unknown][] = []
  if (input.name !== undefined) updates.push(['name = ?', input.name])
  if (input.enabled !== undefined) updates.push(['enabled = ?', input.enabled ? 1 : 0])
  // ...

  if (updates.length === 0) return existing

  const setClauses = updates.map(([clause]) => clause).join(', ')
  const values = updates.map(([, value]) => value)

  const db = await getDb()
  db.run(
    `UPDATE flags SET ${setClauses}, updated_at = ? WHERE id = ?`,
    [...values, new Date().toISOString(), id]
  )

  saveDb()
  return (await getFlagById(id))!
}
```

### Timestamp Management

```typescript
// On create
const now = new Date().toISOString()
// createdAt: now
// updatedAt: now

// On update
// updatedAt: new Date().toISOString()
// (createdAt unchanged)
```

### ID Generation

```typescript
import * as uuid from 'uuid'

const id = uuid.v4()  // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### JSON Serialization for Arrays

```typescript
// Storing
const tagsJson = JSON.stringify(input.tags)
db.run('INSERT INTO flags (tags) VALUES (?)', [tagsJson])

// Retrieving
const tags = JSON.parse(row.tags) as string[]
```
