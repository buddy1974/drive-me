import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'
import { createRatingHandler } from '../controllers/rating.controller'

const router = Router()

const createRatingSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

router.post('/', authenticate, validate(createRatingSchema), createRatingHandler)

export default router
