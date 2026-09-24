export type Environment = 'development' | 'staging' | 'production'
export type FlagType = 'release' | 'experiment' | 'operational' | 'permission'

export interface FeatureFlag {
  readonly id: string
  name: string
  description: string
  enabled: boolean
  environment: Environment
  type: FlagType
  rolloutPercentage: number
  owner: string
  tags: string[]
  readonly createdAt: string
  updatedAt: string
  expiresAt: string | null
  lastEvaluatedAt: string | null
}

export interface CreateFlagInput {
  name: string
  description: string
  enabled: boolean
  environment: Environment
  type: FlagType
  rolloutPercentage: number
  owner: string
  tags: string[]
  expiresAt?: string | null
}

export interface UpdateFlagInput {
  name?: string
  description?: string
  enabled?: boolean
  environment?: Environment
  type?: FlagType
  rolloutPercentage?: number
  owner?: string
  tags?: string[]
  expiresAt?: string | null
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}
