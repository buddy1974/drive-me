import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticateAdmin } from '../middleware/authenticateAdmin'
import {
  adminLoginHandler,
  adminRefreshHandler,
  adminLogoutHandler,
  adminMeHandler,
} from '../controllers/admin.auth.controller'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts — try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

router.post('/login', loginLimiter, validate(loginSchema), adminLoginHandler)
router.post('/refresh', validate(refreshSchema), adminRefreshHandler)
router.post('/logout', authenticateAdmin, adminLogoutHandler)
router.get('/me', authenticateAdmin, adminMeHandler)

export default router
