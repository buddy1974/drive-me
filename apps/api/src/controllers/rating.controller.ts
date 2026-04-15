import { Request, Response } from 'express'
import {
  createRating,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../services/rating.service'

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

// POST /api/v1/ratings
export async function createRatingHandler(req: Request, res: Response): Promise<void> {
  try {
    if (req.actor.role !== 'user') {
      res.status(403).json({ error: 'Only users can submit ratings' })
      return
    }
    const { jobId, stars, comment } = req.body as {
      jobId: string
      stars: number
      comment?: string
    }
    const rating = await createRating(req.actor.actorId, jobId, stars, comment)
    res.status(201).json(rating)
  } catch (err) {
    handleError(res, err)
  }
}
