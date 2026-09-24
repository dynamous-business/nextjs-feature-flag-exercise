import initSqlJs, { Database } from 'sql.js'
import { createTables } from './schema.js'
import { seedFlags, isSeeded } from './seed.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'flags.db')

let db: Database | null = null
let initPromise: Promise<Database> | null = null

export async function getDb(): Promise<Database> {
  if (db) return db

  // Prevent race condition during initialization
  if (initPromise) return initPromise

  initPromise = initializeDatabase()
  return initPromise
}

async function initializeDatabase(): Promise<Database> {
  try {
    const SQL = await initSqlJs()

    // Try to load existing database
    if (fs.existsSync(DB_PATH)) {
      try {
        const fileBuffer = fs.readFileSync(DB_PATH)
        db = new SQL.Database(fileBuffer)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error'
        throw new Error(`Failed to read database file: ${message}`)
      }
    } else {
      db = new SQL.Database()
      createTables(db)
      seedFlags(db)
      saveDb()
    }

    // Seed if empty
    if (!isSeeded(db)) {
      seedFlags(db)
      saveDb()
    }

    return db
  } catch (error) {
    // Reset state on failure so retry is possible
    db = null
    initPromise = null
    throw error
  }
}

export function saveDb(): void {
  if (!db) {
    throw new Error('Cannot save database: database not initialized')
  }

  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Failed to save database: ${message}`)
  }
}

export function closeDb(): void {
  if (db) {
    saveDb()
    db.close()
    db = null
    initPromise = null
  }
}

/**
 * Reset database state for testing purposes.
 * Allows injecting an in-memory database for isolated tests.
 */
export function _resetDbForTesting(testDb: Database | null = null): void {
  if (db && db !== testDb) {
    db.close()
  }
  db = testDb
  initPromise = testDb ? Promise.resolve(testDb) : null
}
