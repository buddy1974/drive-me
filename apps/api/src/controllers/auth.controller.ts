import { Request, Response } from 'express'
import {
  sendOtp,
  verifyOtp,
  refreshAccessToken,
  logout,
  getMe,
  NotFoundError,
  UnauthorizedError,
  TooManyAttemptsError,
  ValidationError,
} from '../services/auth.service'

function handleError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else if (err instanceof TooManyAttemptsError) {
    res.status(429).json({ error: err.message })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/v1/auth/send-otp
export async function sendOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { phone, actor } = req.body as { phone: string; actor: 'user' | 'agent' }
    await sendOtp(phone, actor)
    // Always return success to prevent phone enumeration
    res.json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/auth/verify-otp
export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { phone, code, actor, name, deviceInfo } = req.body as {
      phone: string
      code: string
      actor: 'user' | 'agent'
      name?: string
      deviceInfo?: string
    }
    const ip = req.ip
    const result = await verifyOtp(phone, code, actor, name, deviceInfo, ip)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/auth/refresh
export async function refreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string }
    const result = await refreshAccessToken(refreshToken)
    res.json(result)
  } catch (err) {
    handleError(res, err)
  }
}

// POST /api/v1/auth/logout
export async function logoutHandler(req: Request, res: Response): Promise<void> {
  try {
    await logout(req.actor.sessionId, req.actor.role)
    res.status(204).send()
  } catch (err) {
    handleError(res, err)
  }
}

// GET /api/v1/auth/me
export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    const actor = await getMe(req.actor.actorId, req.actor.role)
    res.json(actor)
  } catch (err) {
    handleError(res, err)
  }
}
