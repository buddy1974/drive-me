import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'
import {
  initiatePaymentHandler,
  mtnWebhookHandler,
  orangeWebhookHandler,
  getPaymentHandler,
} from '../controllers/payment.controller'

const router = Router()

const initiateSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
})

// Authenticated routes
router.post('/initiate', authenticate, validate(initiateSchema), initiatePaymentHandler)
router.get('/:jobId',   authenticate, getPaymentHandler)

// Webhook routes — no auth, raw body preserved upstream
router.post('/webhook/mtn',    mtnWebhookHandler)
router.post('/webhook/orange', orangeWebhookHandler)

export default router
