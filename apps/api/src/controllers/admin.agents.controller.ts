import { Request, Response } from 'express'
import {
  listAgents,
  getAgentById,
  verifyAgent,
  NotFoundError,
  ValidationError,
} from '../services/admin.agents.service'

function handleError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/v1/admin/agents
export async function listAgentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { status, page, limit } = req.query as Record<string, string | undefined>
    const result = await listAgents(status, page, limit)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/admin/agents/:id
export async function getAgentHandler(req: Request, res: Response): Promise<void> {
  try {
    const agent = await getAgentById(req.params.id)
    res.json(agent)
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/v1/admin/agents/:id/verify
export async function verifyAgentHandler(req: Request, res: Response): Promise<void> {
  try {
    await verifyAgent(req.params.id, req.admin.adminId, req.body)
    res.json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}
