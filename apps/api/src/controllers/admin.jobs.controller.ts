import { Request, Response } from 'express'
import { listJobs } from '../services/admin.jobs.service'

export async function listJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { status, page, limit } = req.query as Record<string, string | undefined>
    const result = await listJobs(status, page, limit)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
