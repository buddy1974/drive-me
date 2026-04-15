import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import adminAuthRoutes from './routes/admin.auth.routes'
import adminStatsRoutes from './routes/admin.stats.routes'
import adminAgentsRoutes from './routes/admin.agents.routes'
import adminJobsRoutes from './routes/admin.jobs.routes'
import jobRoutes from './routes/job.routes'
import ratingRoutes from './routes/rating.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 4000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin/auth', adminAuthRoutes)
app.use('/api/v1/admin/stats', adminStatsRoutes)
app.use('/api/v1/admin/agents', adminAgentsRoutes)
app.use('/api/v1/admin/jobs', adminJobsRoutes)
app.use('/api/v1/jobs', jobRoutes)
app.use('/api/v1/ratings', ratingRoutes)
// app.use('/api/v1/users', userRoutes)
// app.use('/api/v1/agents', agentRoutes)
// app.use('/api/v1/payments', paymentRoutes)

app.listen(PORT, () => {
  console.log(`Drive Me API running on port ${PORT}`)
})

export default app
