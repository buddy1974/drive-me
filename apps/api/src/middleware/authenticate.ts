import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      actor: JwtPayload & { actorId: string }
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.actor = { ...payload, actorId: payload.sub }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
