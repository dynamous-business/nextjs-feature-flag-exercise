import { z } from 'zod'

export const createFlagSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1, 'Owner is required'),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const updateFlagSchema = createFlagSchema.partial()
