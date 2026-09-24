import { Router } from 'express'
import { getAllFlags, getFlagById, createFlag, updateFlag, deleteFlag } from '../services/flags.js'
import { createFlagSchema, updateFlagSchema } from '../middleware/validation.js'
import { NotFoundError } from '../middleware/error.js'

export const flagsRouter = Router()

// GET /api/flags - List all flags
// TODO (Workshop): Add query params for filtering
// e.g., ?environment=production&enabled=true&type=release
flagsRouter.get('/', async (_req, res, next) => {
  try {
    const flags = await getAllFlags()
    res.json(flags)
  } catch (error) {
    next(error)
  }
})

// GET /api/flags/:id - Get single flag
flagsRouter.get('/:id', async (req, res, next) => {
  try {
    const flag = await getFlagById(req.params.id)
    if (!flag) {
      throw new NotFoundError(`Flag with id '${req.params.id}' not found`)
    }
    res.json(flag)
  } catch (error) {
    next(error)
  }
})

// POST /api/flags - Create new flag
flagsRouter.post('/', async (req, res, next) => {
  try {
    const input = createFlagSchema.parse(req.body)
    const flag = await createFlag(input)
    res.status(201).json(flag)
  } catch (error) {
    next(error)
  }
})

// PUT /api/flags/:id - Update flag
flagsRouter.put('/:id', async (req, res, next) => {
  try {
    const input = updateFlagSchema.parse(req.body)
    const flag = await updateFlag(req.params.id, input)
    res.json(flag)
  } catch (error) {
    next(error)
  }
})

// DELETE /api/flags/:id - Delete flag
flagsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteFlag(req.params.id)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})
