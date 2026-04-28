import { Request, Response } from 'express'
import {
  createJob,
  getJob,
  getAvailableJobs,
  getAgentActiveJobs,
  acceptJob,
  updateJobStatus,
  cancelJob,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../services/job.service'
import {
  postLocationUpdate,
  getLatestLocation,
} from '../services/location.service'

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

// GET /api/v1/jobs/available
export async function getAvailableJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'agent') {
      res.status(403).json({ error: 'Only agents can browse available jobs' })
      return
    }
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
    const result = await getAvailableJobs(page, limit)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/jobs/my
export async function getMyJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'agent') {
      res.status(403).json({ error: 'Only agents can use this endpoint' })
      return
    }
    const jobs = await getAgentActiveJobs(req.actor.actorId)
    res.json({ jobs })
  } catch (err) {
    handleError(res, err)
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

// POST /api/v1/jobs/:id/location
export async function postLocationHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'agent') {
      res.status(403).json({ error: 'Agents only' })
      return
    }
    const { lat, lng } = req.body as { lat: number; lng: number }
    const update = await postLocationUpdate(req.params.id, req.actor.actorId, lat, lng)
    res.status(201).json(update)
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/jobs/:id/location
export async function getLocationHandler(req: Request, res: Response): Promise<void> {
  try {
    const loc = await getLatestLocation(req.params.id, req.actor.actorId, req.actor.role)
    res.json(loc ?? null)
  } catch (err) {
    handleError(res, err)
  }
}
