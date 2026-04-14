import { Router } from 'express'
import { authenticateAdmin } from '../middleware/authenticateAdmin'
import { adminStatsHandler } from '../controllers/admin.stats.controller'

const router = Router()

router.get('/', authenticateAdmin, adminStatsHandler)

export default router
