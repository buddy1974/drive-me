import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { generateOtp, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '../utils/otp'
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt'
import { sendSMS } from '../utils/sms'

export type ActorRole = 'user' | 'agent'

export interface ActorData {
  id: string
  name: string
  phone: string
  status: string
}

export interface VerifyOtpResult {
  accessToken: string
  refreshToken: string
  actor: ActorData
}

// ─── Custom errors ────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class TooManyAttemptsError extends Error {
  constructor() {
    super('Maximum OTP attempts reached')
    this.name = 'TooManyAttemptsError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string, actor: ActorRole): Promise<void> {
  let userId: string | null = null
  let agentId: string | null = null

  if (actor === 'user') {
    const user = await prisma.user.findUnique({ where: { phone } })
    // Silently skip banned/suspended users — don't reveal account status
    if (user) {
      if (user.status === 'BANNED' || user.status === 'SUSPENDED') return
      userId = user.id
    }
    // If user doesn't exist yet → OTP is phone-only; account created on verify
  } else {
    const agent = await prisma.agent.findUnique({ where: { phone } })
    // Silently skip unknown or banned agents — prevents phone enumeration
    if (!agent || agent.status === 'BANNED') return
    agentId = agent.id
  }

  // Invalidate all prior unused OTPs for this phone
  await prisma.oTPCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  })

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.oTPCode.create({
    data: { phone, code, expiresAt, userId, agentId },
  })

  await sendSMS(phone, `Your Drive Me verification code is: ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`)
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(
  phone: string,
  code: string,
  actor: ActorRole,
  name?: string,
  deviceInfo?: string,
  ip?: string,
): Promise<VerifyOtpResult> {
  // Find the most recent valid OTP for this phone
  const otp = await prisma.oTPCode.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    throw new NotFoundError('No valid OTP found — request a new one')
  }

  // Enforce attempt limit before checking code
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.oTPCode.update({ where: { id: otp.id }, data: { used: true } })
    throw new TooManyAttemptsError()
  }

  // Always increment attempts first
  await prisma.oTPCode.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 } },
  })

  if (otp.code !== code) {
    throw new UnauthorizedError('Invalid OTP code')
  }

  // Mark OTP consumed
  await prisma.oTPCode.update({ where: { id: otp.id }, data: { used: true } })

  // ── Resolve actor ────────────────────────────────────────────────────────────
  let actorId: string
  let actorData: ActorData

  if (actor === 'user') {
    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      if (!name?.trim()) {
        throw new ValidationError('name is required to create a new account')
      }
      user = await prisma.user.create({ data: { phone, name: name.trim() } })
    }
    actorId = user.id
    actorData = { id: user.id, name: user.name, phone: user.phone, status: user.status }
  } else {
    const agent = await prisma.agent.findUnique({ where: { phone } })
    if (!agent) throw new NotFoundError('Agent not found')
    actorId = agent.id
    actorData = { id: agent.id, name: agent.name, phone: agent.phone, status: agent.status }
  }

  // ── Create session ───────────────────────────────────────────────────────────
  // Use an opaque UUID as the stored token; sessionId from DB row goes into JWT
  const opaqueToken = crypto.randomUUID()
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  let sessionId: string

  if (actor === 'user') {
    const session = await prisma.userSession.create({
      data: {
        userId: actorId,
        token: opaqueToken,
        expiresAt: sessionExpiresAt,
        deviceInfo: deviceInfo ?? null,
        ipAddress: ip ?? null,
      },
    })
    sessionId = session.id
  } else {
    const session = await prisma.agentSession.create({
      data: {
        agentId: actorId,
        token: opaqueToken,
        expiresAt: sessionExpiresAt,
        deviceInfo: deviceInfo ?? null,
        ipAddress: ip ?? null,
      },
    })
    sessionId = session.id
  }

  const jwtPayload: JwtPayload = { sub: actorId, role: actor, sessionId }
  const accessToken = signAccessToken(jwtPayload)
  const refreshToken = signRefreshToken(jwtPayload)

  return { accessToken, refreshToken, actor: actorData }
}

// ─── Refresh access token ─────────────────────────────────────────────────────

export async function refreshAccessToken(token: string): Promise<{ accessToken: string }> {
  let payload: JwtPayload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  // Confirm session still exists in DB (not logged out)
  const session =
    payload.role === 'user'
      ? await prisma.userSession.findFirst({
          where: { id: payload.sessionId, expiresAt: { gt: new Date() } },
        })
      : await prisma.agentSession.findFirst({
          where: { id: payload.sessionId, expiresAt: { gt: new Date() } },
        })

  if (!session) {
    throw new UnauthorizedError('Session expired or revoked')
  }

  const accessToken = signAccessToken(payload)
  return { accessToken }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(sessionId: string, role: ActorRole): Promise<void> {
  if (role === 'user') {
    await prisma.userSession.deleteMany({ where: { id: sessionId } })
  } else {
    await prisma.agentSession.deleteMany({ where: { id: sessionId } })
  }
}

// ─── Get current actor ────────────────────────────────────────────────────────

export async function getMe(actorId: string, role: ActorRole): Promise<ActorData> {
  if (role === 'user') {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, phone: true, status: true },
    })
    if (!user) throw new NotFoundError('User not found')
    return user
  } else {
    const agent = await prisma.agent.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, phone: true, status: true },
    })
    if (!agent) throw new NotFoundError('Agent not found')
    return agent
  }
}
