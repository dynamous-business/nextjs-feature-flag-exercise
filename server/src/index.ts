import express from 'express'
import cors from 'cors'
import { flagsRouter } from './routes/flags.js'
import { errorHandler } from './middleware/error.js'
import { getDb } from './db/client.js'

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/flags', flagsRouter)

// Error handling
app.use(errorHandler)

// Initialize database and start server
async function start() {
  await getDb() // Initialize database
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

start().catch(console.error)
