import { Request, Response } from 'express'
import { getAdminStats } from '../services/admin.stats.service'

export async function adminStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getAdminStats()
    res.json(stats)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
