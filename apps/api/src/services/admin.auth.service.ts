import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt'
import { NotFoundError, UnauthorizedError } from './auth.service'

export type { NotFoundError, UnauthorizedError }

export interface AdminData {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'OPS'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  admin: AdminData
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string,
  ip?: string,
): Promise<LoginResult> {
  const admin = await prisma.adminUser.findUnique({ where: { email } })

  // Constant-time failure — don't reveal whether the email exists
  if (!admin) {
    await bcrypt.compare(password, '$2a$12$invalidhashpadding000000000000000000000000000000000000')
    throw new UnauthorizedError('Invalid credentials')
  }

  const passwordValid = await bcrypt.compare(password, admin.passwordHash)
  if (!passwordValid) throw new UnauthorizedError('Invalid credentials')

  if (admin.status === 'INACTIVE') throw new UnauthorizedError('Invalid credentials')

  // ── Create session ───────────────────────────────────────────────────────────
  const opaqueToken = crypto.randomUUID()
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const session = await prisma.adminSession.create({
    data: {
      adminId: admin.id,
      token: opaqueToken,
      expiresAt: sessionExpiresAt,
      ipAddress: ip ?? null,
    },
  })

  const jwtPayload: JwtPayload = {
    sub: admin.id,
    role: 'admin',
    sessionId: session.id,
    adminRole: admin.role,
  }

  return {
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload),
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
    },
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function adminRefreshAccessToken(token: string): Promise<{ accessToken: string }> {
  let payload: JwtPayload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  if (payload.role !== 'admin') throw new UnauthorizedError('Invalid token role')

  const session = await prisma.adminSession.findFirst({
    where: { id: payload.sessionId, expiresAt: { gt: new Date() } },
  })
  if (!session) throw new UnauthorizedError('Session expired or revoked')

  return { accessToken: signAccessToken(payload) }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function adminLogout(sessionId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { id: sessionId } })
}

// ─── Get current admin ────────────────────────────────────────────────────────

export async function getAdminMe(adminId: string): Promise<AdminData> {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, status: true },
  })
  if (!admin) throw new NotFoundError('Admin not found')
  return admin
}
