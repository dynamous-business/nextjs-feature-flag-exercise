import { v4 as uuidv4 } from 'uuid'
import { getDb, saveDb } from '../db/client.js'
import { NotFoundError, ConflictError } from '../middleware/error.js'
import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, Environment, FlagType } from '../../../shared/types.js'

const VALID_ENVIRONMENTS: Environment[] = ['development', 'staging', 'production']
const VALID_FLAG_TYPES: FlagType[] = ['release', 'experiment', 'operational', 'permission']

function isEnvironment(value: unknown): value is Environment {
  return typeof value === 'string' && VALID_ENVIRONMENTS.includes(value as Environment)
}

function isFlagType(value: unknown): value is FlagType {
  return typeof value === 'string' && VALID_FLAG_TYPES.includes(value as FlagType)
}

interface DbRow {
  id: string
  name: string
  description: string
  enabled: number
  environment: string
  type: string
  rollout_percentage: number
  owner: string
  tags: string
  created_at: string
  updated_at: string
  expires_at: string | null
  last_evaluated_at: string | null
}

function rowToFlag(row: DbRow): FeatureFlag {
  // Validate environment enum
  if (!isEnvironment(row.environment)) {
    throw new Error(`Invalid environment value in database: ${row.environment}`)
  }

  // Validate flag type enum
  if (!isFlagType(row.type)) {
    throw new Error(`Invalid flag type value in database: ${row.type}`)
  }

  // Parse tags with error handling
  let tags: string[]
  try {
    const parsed = JSON.parse(row.tags)
    if (!Array.isArray(parsed)) {
      throw new Error('Tags must be an array')
    }
    tags = parsed
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Invalid tags JSON in database for flag '${row.name}': ${message}`)
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    enabled: row.enabled === 1,
    environment: row.environment,
    type: row.type,
    rolloutPercentage: row.rollout_percentage,
    owner: row.owner,
    tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    lastEvaluatedAt: row.last_evaluated_at,
  }
}

function resultToRows(result: { columns: string[], values: unknown[][] }[]): DbRow[] {
  if (result.length === 0) return []
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as unknown as DbRow
  })
}

export async function getAllFlags(): Promise<FeatureFlag[]> {
  const db = await getDb()
  const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
  return resultToRows(result).map(rowToFlag)
}

export async function getFlagById(id: string): Promise<FeatureFlag | null> {
  const db = await getDb()
  const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')

  try {
    stmt.bind([id])

    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DbRow
      return rowToFlag(row)
    }

    return null
  } finally {
    stmt.free()
  }
}

export async function getFlagByName(name: string): Promise<FeatureFlag | null> {
  const db = await getDb()
  const stmt = db.prepare('SELECT * FROM flags WHERE name = ?')

  try {
    stmt.bind([name])

    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DbRow
      return rowToFlag(row)
    }

    return null
  } finally {
    stmt.free()
  }
}

export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  const existing = await getFlagByName(input.name)
  if (existing) {
    throw new ConflictError(`Flag with name '${input.name}' already exists`)
  }

  const db = await getDb()
  const id = uuidv4()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO flags (id, name, description, enabled, environment, type, rollout_percentage, owner, tags, created_at, updated_at, expires_at, last_evaluated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  try {
    stmt.run([
      id,
      input.name,
      input.description,
      input.enabled ? 1 : 0,
      input.environment,
      input.type,
      input.rolloutPercentage,
      input.owner,
      JSON.stringify(input.tags),
      now,
      now,
      input.expiresAt ?? null,
      null,
    ])
  } finally {
    stmt.free()
  }

  saveDb()

  const flag = await getFlagById(id)
  if (!flag) {
    throw new Error('Failed to create flag')
  }

  return flag
}

export async function updateFlag(id: string, input: UpdateFlagInput): Promise<FeatureFlag> {
  const existing = await getFlagById(id)
  if (!existing) {
    throw new NotFoundError(`Flag with id '${id}' not found`)
  }

  // Check for name conflict if name is being changed
  if (input.name && input.name !== existing.name) {
    const nameConflict = await getFlagByName(input.name)
    if (nameConflict) {
      throw new ConflictError(`Flag with name '${input.name}' already exists`)
    }
  }

  const db = await getDb()
  const now = new Date().toISOString()

  const updates: string[] = []
  const values: (string | number | null)[] = []

  if (input.name !== undefined) {
    updates.push('name = ?')
    values.push(input.name)
  }
  if (input.description !== undefined) {
    updates.push('description = ?')
    values.push(input.description)
  }
  if (input.enabled !== undefined) {
    updates.push('enabled = ?')
    values.push(input.enabled ? 1 : 0)
  }
  if (input.environment !== undefined) {
    updates.push('environment = ?')
    values.push(input.environment)
  }
  if (input.type !== undefined) {
    updates.push('type = ?')
    values.push(input.type)
  }
  if (input.rolloutPercentage !== undefined) {
    updates.push('rollout_percentage = ?')
    values.push(input.rolloutPercentage)
  }
  if (input.owner !== undefined) {
    updates.push('owner = ?')
    values.push(input.owner)
  }
  if (input.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(input.tags))
  }
  if (input.expiresAt !== undefined) {
    updates.push('expires_at = ?')
    values.push(input.expiresAt)
  }

  updates.push('updated_at = ?')
  values.push(now)
  values.push(id)

  const stmt = db.prepare(`UPDATE flags SET ${updates.join(', ')} WHERE id = ?`)

  try {
    stmt.run(values)
  } finally {
    stmt.free()
  }

  saveDb()

  const flag = await getFlagById(id)
  if (!flag) {
    throw new Error('Failed to update flag')
  }

  return flag
}

export async function deleteFlag(id: string): Promise<void> {
  const existing = await getFlagById(id)
  if (!existing) {
    throw new NotFoundError(`Flag with id '${id}' not found`)
  }

  const db = await getDb()
  const stmt = db.prepare('DELETE FROM flags WHERE id = ?')

  try {
    stmt.run([id])
  } finally {
    stmt.free()
  }

  saveDb()
}
