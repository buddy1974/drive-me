import { Request, Response } from 'express'
import {
  createJob,
  getJob,
  acceptJob,
  updateJobStatus,
  cancelJob,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../services/job.service'

function handleError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof UnauthorizedError) {
    res.status(403).json({ error: err.message })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/v1/jobs
export async function createJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'user') {
      res.status(403).json({ error: 'Only users can create jobs' })
      return
    }
    const job = await createJob(req.actor.actorId, req.body)
    res.status(201).json(job)
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/jobs/:id
export async function getJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role === 'admin') {
      res.status(403).json({ error: 'Use admin routes for admin access' })
      return
    }
    const job = await getJob(req.params.id, req.actor.actorId, req.actor.role)
    res.json(job)
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/v1/jobs/:id/accept
export async function acceptJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'agent') {
      res.status(403).json({ error: 'Only agents can accept jobs' })
      return
    }
    const job = await acceptJob(req.params.id, req.actor.actorId)
    res.json(job)
  } catch (err) {
    handleError(res, err)
  }
}

// PATCH /api/v1/jobs/:id/status
export async function updateJobStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'agent') {
      res.status(403).json({ error: 'Only agents can update job status' })
      return
    }
    const { status } = req.body as { status: string }
    const job = await updateJobStatus(req.params.id, req.actor.actorId, status)
    res.json(job)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/jobs/:id/cancel
export async function cancelJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const role = req.actor.role
    if (role !== 'user' && role !== 'agent') {
      res.status(403).json({ error: 'Only users or agents can cancel jobs' })
      return
    }
    const { reason } = req.body as { reason?: string }
    const job = await cancelJob(req.params.id, req.actor.actorId, role, reason)
    res.json(job)
  } catch (err) {
    handleError(res, err)
  }
}
