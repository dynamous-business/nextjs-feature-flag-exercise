import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import initSqlJs, { Database } from 'sql.js'
import { createTables } from '../db/schema.js'
import { _resetDbForTesting } from '../db/client.js'
import {
  getAllFlags,
  getFlagById,
  getFlagByName,
  createFlag,
  updateFlag,
  deleteFlag,
} from '../services/flags.js'
import type { CreateFlagInput } from '../../../shared/types.js'

let db: Database

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

describe('Flag Service', () => {
  beforeEach(async () => {
    const SQL = await initSqlJs()
    db = new SQL.Database()
    createTables(db)
    _resetDbForTesting(db)
  })

  afterEach(() => {
    _resetDbForTesting(null)
    db.close()
  })

  describe('getAllFlags', () => {
    it('returns empty array when no flags exist', async () => {
      const flags = await getAllFlags()
      expect(flags).toEqual([])
    })

    it('returns all flags', async () => {
      await createFlag(validFlagInput)

      const flags = await getAllFlags()
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('test-flag')
    })
  })

  describe('createFlag', () => {
    it('creates a flag with correct data', async () => {
      const flag = await createFlag({
        name: 'new-feature',
        description: 'A new feature',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 50,
        owner: 'team-a',
        tags: ['frontend', 'ux'],
      })

      expect(flag.name).toBe('new-feature')
      expect(flag.description).toBe('A new feature')
      expect(flag.enabled).toBe(true)
      expect(flag.environment).toBe('production')
      expect(flag.type).toBe('release')
      expect(flag.rolloutPercentage).toBe(50)
      expect(flag.owner).toBe('team-a')
      expect(flag.tags).toEqual(['frontend', 'ux'])
    })

    it('generates a UUID for the flag', async () => {
      const flag = await createFlag({
        name: 'uuid-test',
        description: 'Test UUID',
        enabled: false,
        environment: 'development',
        type: 'experiment',
        rolloutPercentage: 0,
        owner: 'team-b',
        tags: [],
      })

      expect(flag.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('sets timestamps', async () => {
      const before = new Date().toISOString()
      const flag = await createFlag({
        name: 'timestamp-test',
        description: 'Test timestamps',
        enabled: true,
        environment: 'staging',
        type: 'operational',
        rolloutPercentage: 100,
        owner: 'team-c',
        tags: [],
      })
      const after = new Date().toISOString()

      expect(flag.createdAt >= before).toBe(true)
      expect(flag.createdAt <= after).toBe(true)
      expect(flag.updatedAt >= before).toBe(true)
      expect(flag.updatedAt <= after).toBe(true)
    })

    it('rejects duplicate names', async () => {
      await createFlag({
        name: 'duplicate-name',
        description: 'First flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      await expect(createFlag({
        name: 'duplicate-name',
        description: 'Second flag',
        enabled: false,
        environment: 'staging',
        type: 'experiment',
        rolloutPercentage: 50,
        owner: 'team-b',
        tags: [],
      })).rejects.toThrow('already exists')
    })
  })

  describe('getFlagById', () => {
    it('returns the correct flag', async () => {
      const created = await createFlag({
        name: 'find-me',
        description: 'Find this flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: ['findable'],
      })

      const found = await getFlagById(created.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe('find-me')
      expect(found?.tags).toEqual(['findable'])
    })

    it('returns null for unknown ID', async () => {
      const found = await getFlagById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('getFlagByName', () => {
    it('returns the correct flag', async () => {
      await createFlag({
        name: 'search-by-name',
        description: 'Find by name',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      const found = await getFlagByName('search-by-name')
      expect(found).not.toBeNull()
      expect(found?.name).toBe('search-by-name')
    })

    it('returns null for unknown name', async () => {
      const found = await getFlagByName('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('updateFlag', () => {
    it('modifies specified fields', async () => {
      const created = await createFlag({
        name: 'update-me',
        description: 'Original description',
        enabled: false,
        environment: 'development',
        type: 'experiment',
        rolloutPercentage: 10,
        owner: 'team-a',
        tags: ['original'],
      })

      const updated = await updateFlag(created.id, {
        description: 'Updated description',
        enabled: true,
        rolloutPercentage: 50,
      })

      expect(updated.name).toBe('update-me') // Unchanged
      expect(updated.description).toBe('Updated description')
      expect(updated.enabled).toBe(true)
      expect(updated.rolloutPercentage).toBe(50)
      expect(updated.tags).toEqual(['original']) // Unchanged
    })

    it('updates the updatedAt timestamp', async () => {
      const created = await createFlag({
        name: 'timestamp-update',
        description: 'Test timestamp update',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = await updateFlag(created.id, { description: 'Updated' })
      expect(updated.updatedAt > created.updatedAt).toBe(true)
    })

    it('throws error for unknown ID', async () => {
      await expect(updateFlag('non-existent-id', { description: 'Update' }))
        .rejects.toThrow('not found')
    })

    it('throws error when updating name to existing name', async () => {
      await createFlag({
        name: 'existing-flag',
        description: 'First flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      const second = await createFlag({
        name: 'different-flag',
        description: 'Second flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-b',
        tags: [],
      })

      await expect(updateFlag(second.id, { name: 'existing-flag' }))
        .rejects.toThrow('already exists')
    })
  })

  describe('deleteFlag', () => {
    it('removes the flag', async () => {
      const created = await createFlag({
        name: 'delete-me',
        description: 'To be deleted',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      await deleteFlag(created.id)

      const found = await getFlagById(created.id)
      expect(found).toBeNull()
    })

    it('throws error for unknown ID', async () => {
      await expect(deleteFlag('non-existent-id'))
        .rejects.toThrow('not found')
    })
  })
})
