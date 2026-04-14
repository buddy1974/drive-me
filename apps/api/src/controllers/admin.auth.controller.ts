import { Request, Response } from 'express'
import {
  adminLogin,
  adminRefreshAccessToken,
  adminLogout,
  getAdminMe,
} from '../services/admin.auth.service'
import { NotFoundError, UnauthorizedError } from '../services/auth.service'

function handleError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/v1/admin/auth/login
export async function adminLoginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string }
    const result = await adminLogin(email, password, req.ip)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/admin/auth/refresh
export async function adminRefreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string }
    const result = await adminRefreshAccessToken(refreshToken)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/admin/auth/logout
export async function adminLogoutHandler(req: Request, res: Response): Promise<void> {
  try {
    await adminLogout(req.admin.sessionId)
    res.status(204).send()
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/admin/auth/me
export async function adminMeHandler(req: Request, res: Response): Promise<void> {
  try {
    const admin = await getAdminMe(req.admin.adminId)
    res.json(admin)
  } catch (err) {
    handleError(res, err)
  }
}
