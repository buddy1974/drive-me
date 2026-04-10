import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

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
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes (to be added)
// app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/users', userRoutes)
// app.use('/api/v1/agents', agentRoutes)
// app.use('/api/v1/jobs', jobRoutes)
// app.use('/api/v1/payments', paymentRoutes)

app.listen(PORT, () => {
  console.log(`Drive Me API running on port ${PORT}`)
})

export default app
