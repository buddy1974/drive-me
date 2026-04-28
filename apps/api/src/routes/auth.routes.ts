import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'
import { prisma } from '../lib/prisma'
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from '../controllers/auth.controller'

const router = Router()

// Strict rate limit for OTP sending: 3 requests per 15 minutes per IP
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many OTP requests — try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
})

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format (+[country code][number)'),
  actor: z.enum(['user', 'agent']),
})

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format (+[country code][number)'),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  actor: z.enum(['user', 'agent']),
  name: z.string().min(2).max(100).optional(),
  deviceInfo: z.string().max(255).optional(),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

router.post('/send-otp', sendOtpLimiter, validate(sendOtpSchema), sendOtpHandler)
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtpHandler)
router.post('/refresh', validate(refreshSchema), refreshHandler)
router.post('/logout', authenticate, logoutHandler)
router.get('/me', authenticate, meHandler)

router.post(
  '/push-token',
  authenticate,
  validate(z.object({ token: z.string().min(1).max(300) })),
  async (req, res): Promise<void> => {
    const { token }  = req.body as { token: string }
    const { actorId, role } = req.actor
    try {
      if (role === 'user') {
        await prisma.user.update({ where: { id: actorId }, data: { pushToken: token } })
      } else if (role === 'agent') {
        await prisma.agent.update({ where: { id: actorId }, data: { pushToken: token } })
      }
      res.json({ success: true })
    } catch {
      res.status(500).json({ error: 'Failed to save push token' })
    }
  },
)

export default router
