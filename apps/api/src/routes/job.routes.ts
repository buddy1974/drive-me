import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'
import {
  createJobHandler,
  getAvailableJobsHandler,
  getMyJobsHandler,
  getJobHandler,
  acceptJobHandler,
  updateJobStatusHandler,
  cancelJobHandler,
} from '../controllers/job.controller'

const router = Router()

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1).max(500),
  quarter: z.string().min(1).max(200),
  landmark: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
})

const createJobSchema = z.object({
  serviceType: z.enum(['ERRAND', 'PICKUP', 'DELIVERY']),
  pickupLocation: locationSchema,
  destinationLocation: locationSchema.optional(),
  description: z.string().min(1).max(1000),
  paymentMethod: z.enum(['MTN_MOMO', 'ORANGE_MONEY', 'CASH']),
})

const updateStatusSchema = z.object({
  status: z.enum([
    'EN_ROUTE_TO_PICKUP',
    'ARRIVED_AT_PICKUP',
    'IN_PROGRESS',
    'ARRIVED_AT_DESTINATION',
    'COMPLETED',
  ]),
})

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
})

router.post('/', authenticate, validate(createJobSchema), createJobHandler)
// Static routes MUST come before /:id
router.get('/available', authenticate, getAvailableJobsHandler)
router.get('/my',        authenticate, getMyJobsHandler)
router.get('/:id',       authenticate, getJobHandler)
router.patch('/:id/accept', authenticate, acceptJobHandler)
router.patch('/:id/status', authenticate, validate(updateStatusSchema), updateJobStatusHandler)
router.post('/:id/cancel', authenticate, validate(cancelSchema), cancelJobHandler)

export default router
