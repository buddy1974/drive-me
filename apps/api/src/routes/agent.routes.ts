import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/authenticate'
import { validate }     from '../middleware/validate'
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

// GET /api/v1/agents/me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  if (req.actor.role !== 'agent') {
    res.status(403).json({ error: 'Agents only' })
    return
  }
  const agent = await prisma.agent.findUnique({
    where:  { id: req.actor.actorId },
    select: {
      id: true, name: true, phone: true, status: true,
      vehicleType: true, vehiclePlate: true, vehicleMake: true,
      vehicleModel: true, vehicleYear: true, momoPhone: true, orangePhone: true,
    },
  })
  if (!agent) { res.status(404).json({ error: 'Agent not found' }); return }
  res.json(agent)
})

// PATCH /api/v1/agents/me
const patchAgentSchema = z.object({
  name:         z.string().min(2).max(100).optional(),
  vehicleType:  z.enum(['MOTORBIKE', 'CAR', 'ON_FOOT']).optional(),
  vehiclePlate: z.string().min(1).max(20).optional(),
  vehicleMake:  z.string().min(1).max(50).optional(),
  vehicleModel: z.string().min(1).max(50).optional(),
  vehicleYear:  z.number().int().min(1990).max(2035).optional(),
  momoPhone:    z.string().max(20).nullable().optional(),
  orangePhone:  z.string().max(20).nullable().optional(),
})

router.patch('/me', authenticate, validate(patchAgentSchema), async (req: Request, res: Response): Promise<void> => {
  if (req.actor.role !== 'agent') {
    res.status(403).json({ error: 'Agents only' })
    return
  }
  const {
    name, vehicleType, vehiclePlate, vehicleMake,
    vehicleModel, vehicleYear, momoPhone, orangePhone,
  } = req.body as z.infer<typeof patchAgentSchema>

  const agent = await prisma.agent.update({
    where: { id: req.actor.actorId },
    data: {
      ...(name         !== undefined ? { name }         : {}),
      ...(vehicleType  !== undefined ? { vehicleType: vehicleType as never } : {}),
      ...(vehiclePlate !== undefined ? { vehiclePlate } : {}),
      ...(vehicleMake  !== undefined ? { vehicleMake }  : {}),
      ...(vehicleModel !== undefined ? { vehicleModel } : {}),
      ...(vehicleYear  !== undefined ? { vehicleYear }  : {}),
      ...(momoPhone    !== undefined ? { momoPhone }    : {}),
      ...(orangePhone  !== undefined ? { orangePhone }  : {}),
    },
    select: {
      id: true, name: true, phone: true, status: true,
      vehicleType: true, vehiclePlate: true, vehicleMake: true,
      vehicleModel: true, vehicleYear: true, momoPhone: true, orangePhone: true,
    },
  })
  res.json(agent)
})

// POST /api/v1/agents/me/documents
const documentSchema = z.object({
  type:     z.enum(['ID_FRONT', 'ID_BACK', 'VEHICLE_PHOTO', 'DRIVER_LICENSE', 'AGENT_AGREEMENT']),
  fileUrl:  z.string().url(),
  fileName: z.string().min(1).max(255),
})

router.post('/me/documents', authenticate, validate(documentSchema), async (req: Request, res: Response): Promise<void> => {
  if (req.actor.role !== 'agent') {
    res.status(403).json({ error: 'Agents only' })
    return
  }
  const { type, fileUrl, fileName } = req.body as z.infer<typeof documentSchema>
  const doc = await prisma.verificationDocument.create({
    data: {
      agentId:  req.actor.actorId,
      type:     type as never,
      fileUrl,
      fileName,
    },
  })
  res.status(201).json(doc)
})

export default router
