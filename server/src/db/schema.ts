import type { Database } from 'sql.js'

export const createTables = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      environment TEXT NOT NULL,
      type TEXT NOT NULL,
      rollout_percentage INTEGER NOT NULL DEFAULT 100,
      owner TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT,
      last_evaluated_at TEXT
    )
  `)
}
