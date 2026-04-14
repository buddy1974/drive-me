import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../utils/jwt'

export interface AdminPayload extends JwtPayload {
  role: 'admin'
  adminId: string
  adminRole: 'SUPER_ADMIN' | 'OPS'
}

declare global {
  namespace Express {
    interface Request {
      admin: AdminPayload
    }
  }
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }
    req.admin = {
      ...payload,
      role: 'admin',
      adminId: payload.sub,
      adminRole: payload.adminRole ?? 'OPS',
    }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Role gate — wrap routes that require SUPER_ADMIN
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.admin.adminRole !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Super admin access required' })
    return
  }
  next()
}
