import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/v1/agents/earnings
router.get('/earnings', authenticate, async (req: Request, res: Response): Promise<void> => {
  if (req.actor.role !== 'agent') {
    res.status(403).json({ error: 'Agents only' })
    return
  }
  const earnings = await prisma.agentEarnings.findUnique({
    where: { agentId: req.actor.actorId },
    select: {
      totalEarned:   true,
      completedJobs: true,
      pendingPayout: true,
      updatedAt:     true,
    },
  })
  res.json(earnings ?? { totalEarned: 0, completedJobs: 0, pendingPayout: 0, updatedAt: null })
})

export default router
