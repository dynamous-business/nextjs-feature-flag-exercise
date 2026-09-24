import type { Database } from 'sql.js'
import { v4 as uuidv4 } from 'uuid'

const MOCK_FLAGS = [
  // Production - Release flags
  { name: 'dark-mode', description: 'Enable dark mode theme for users', enabled: true, environment: 'production', type: 'release', rolloutPercentage: 100, owner: 'team-frontend', tags: ['frontend', 'ux'] },
  { name: 'new-checkout-flow', description: 'Redesigned checkout experience', enabled: true, environment: 'production', type: 'release', rolloutPercentage: 50, owner: 'team-payments', tags: ['frontend', 'payments'] },
  { name: 'mobile-push-notifications', description: 'Push notification support for mobile', enabled: false, environment: 'production', type: 'release', rolloutPercentage: 0, owner: 'team-mobile', tags: ['mobile', 'notifications'] },

  // Production - Experiment flags
  { name: 'pricing-ab-test', description: 'A/B test for new pricing page layout', enabled: true, environment: 'production', type: 'experiment', rolloutPercentage: 25, owner: 'team-growth', tags: ['frontend', 'growth'] },
  { name: 'onboarding-flow-v2', description: 'New user onboarding experiment', enabled: true, environment: 'production', type: 'experiment', rolloutPercentage: 10, owner: 'team-growth', tags: ['frontend', 'ux', 'growth'] },

  // Production - Operational flags
  { name: 'rate-limiting-strict', description: 'Stricter rate limiting for API', enabled: true, environment: 'production', type: 'operational', rolloutPercentage: 100, owner: 'team-platform', tags: ['backend', 'performance'] },
  { name: 'cache-invalidation-v2', description: 'New cache invalidation strategy', enabled: false, environment: 'production', type: 'operational', rolloutPercentage: 0, owner: 'team-platform', tags: ['backend', 'performance'] },

  // Staging - Release flags
  { name: 'ai-recommendations', description: 'AI-powered product recommendations', enabled: true, environment: 'staging', type: 'release', rolloutPercentage: 100, owner: 'team-ml', tags: ['backend', 'ml'] },
  { name: 'social-login', description: 'Login with social providers', enabled: true, environment: 'staging', type: 'release', rolloutPercentage: 100, owner: 'team-auth', tags: ['frontend', 'auth'] },
  { name: 'export-to-csv', description: 'Export data to CSV format', enabled: false, environment: 'staging', type: 'release', rolloutPercentage: 0, owner: 'team-frontend', tags: ['frontend', 'ux'] },

  // Staging - Permission flags
  { name: 'admin-dashboard-v2', description: 'New admin dashboard for internal users', enabled: true, environment: 'staging', type: 'permission', rolloutPercentage: 100, owner: 'team-internal', tags: ['frontend', 'admin'] },
  { name: 'beta-features-access', description: 'Access to beta features for select users', enabled: true, environment: 'staging', type: 'permission', rolloutPercentage: 100, owner: 'team-product', tags: ['frontend', 'backend'] },

  // Staging - Experiment flags
  { name: 'search-algorithm-v3', description: 'New search ranking algorithm', enabled: true, environment: 'staging', type: 'experiment', rolloutPercentage: 50, owner: 'team-search', tags: ['backend', 'ml'] },
  { name: 'personalized-homepage', description: 'Personalized homepage content', enabled: false, environment: 'staging', type: 'experiment', rolloutPercentage: 0, owner: 'team-frontend', tags: ['frontend', 'ml'] },

  // Development - Various flags
  { name: 'debug-mode', description: 'Enable debug logging and tools', enabled: true, environment: 'development', type: 'operational', rolloutPercentage: 100, owner: 'team-platform', tags: ['backend', 'debug'] },
  { name: 'mock-payment-gateway', description: 'Use mock payment gateway', enabled: true, environment: 'development', type: 'operational', rolloutPercentage: 100, owner: 'team-payments', tags: ['backend', 'payments'] },
  { name: 'feature-flag-ui-v2', description: 'New feature flag management UI', enabled: true, environment: 'development', type: 'release', rolloutPercentage: 100, owner: 'team-platform', tags: ['frontend', 'admin'] },
  { name: 'graphql-api', description: 'GraphQL API endpoint', enabled: false, environment: 'development', type: 'release', rolloutPercentage: 0, owner: 'team-backend', tags: ['backend', 'api'] },
  { name: 'real-time-sync', description: 'Real-time data synchronization', enabled: true, environment: 'development', type: 'experiment', rolloutPercentage: 100, owner: 'team-backend', tags: ['backend', 'realtime'] },
  { name: 'super-admin-tools', description: 'Super admin tools access', enabled: true, environment: 'development', type: 'permission', rolloutPercentage: 100, owner: 'team-internal', tags: ['admin', 'internal'] },
]

export function isSeeded(db: Database): boolean {
  const result = db.exec('SELECT COUNT(*) as count FROM flags')
  if (result.length === 0) return false
  const count = result[0].values[0][0] as number
  return count > 0
}

export function seedFlags(db: Database): void {
  const now = new Date().toISOString()

  // Create timestamps with some variety
  const getRandomPastDate = (daysAgo: number): string => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
    return date.toISOString()
  }

  const getRandomFutureDate = (daysAhead: number): string | null => {
    if (Math.random() > 0.3) return null // 70% have no expiration
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead))
    return date.toISOString()
  }

  const getRandomEvaluatedDate = (): string | null => {
    const rand = Math.random()
    if (rand < 0.3) return null // 30% never evaluated
    if (rand < 0.5) {
      // 20% stale (over 30 days ago)
      const date = new Date()
      date.setDate(date.getDate() - 30 - Math.floor(Math.random() * 60))
      return date.toISOString()
    }
    // 50% recent (within last 7 days)
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    return date.toISOString()
  }

  const stmt = db.prepare(`
    INSERT INTO flags (id, name, description, enabled, environment, type, rollout_percentage, owner, tags, created_at, updated_at, expires_at, last_evaluated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const flag of MOCK_FLAGS) {
    const createdAt = getRandomPastDate(90) // Created within last 90 days
    const updatedAt = createdAt < now ? getRandomPastDate(30) : createdAt

    stmt.run([
      uuidv4(),
      flag.name,
      flag.description,
      flag.enabled ? 1 : 0,
      flag.environment,
      flag.type,
      flag.rolloutPercentage,
      flag.owner,
      JSON.stringify(flag.tags),
      createdAt,
      updatedAt > createdAt ? updatedAt : createdAt,
      getRandomFutureDate(60),
      getRandomEvaluatedDate(),
    ])
  }

  stmt.free()
}
