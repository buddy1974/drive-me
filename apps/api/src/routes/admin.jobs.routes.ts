import { Router } from 'express'
import { authenticateAdmin } from '../middleware/authenticateAdmin'
import { listJobsHandler } from '../controllers/admin.jobs.controller'

const router = Router()

router.get('/', authenticateAdmin, listJobsHandler)

export default router
