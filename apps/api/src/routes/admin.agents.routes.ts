import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { authenticateAdmin } from '../middleware/authenticateAdmin'
import {
  listAgentsHandler,
  getAgentHandler,
  verifyAgentHandler,
} from '../controllers/admin.agents.controller'

const router = Router()

const verifySchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'NEEDS_MORE_INFO']),
  method: z.enum(['PHONE_CONFIRMATION', 'PHYSICAL_VISIT', 'NEIGHBOUR_CONFIRMATION']).optional(),
  notes: z.string().max(1000).optional(),
  neighbourNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(1000).optional(),
  requestedInfoNote: z.string().max(1000).optional(),
})

router.get('/', authenticateAdmin, listAgentsHandler)
router.get('/:id', authenticateAdmin, getAgentHandler)
router.patch('/:id/verify', authenticateAdmin, validate(verifySchema), verifyAgentHandler)

export default router
