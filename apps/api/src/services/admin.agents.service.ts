import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from './auth.service'

export { NotFoundError, ValidationError }

export interface AgentListItem {
  id: string
  name: string
  phone: string
  status: string
  agentLevel: string
  vehicleType: string
  avgRating: number
  totalRatings: number
  createdAt: Date
  verification: {
    status: string
    method: string | null
    createdAt: Date
  } | null
}

export interface AgentDetail extends AgentListItem {
  vehiclePlate: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  momoPhone: string | null
  orangePhone: string | null
  verificationDocs: {
    id: string
    type: string
    fileUrl: string
    fileName: string
    uploadedAt: Date
  }[]
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function parsePage(raw: string | undefined, def = 1): number {
  const n = parseInt(raw ?? String(def), 10)
  return isNaN(n) || n < 1 ? def : n
}

function parseLimit(raw: string | undefined, def = 20): number {
  const n = parseInt(raw ?? String(def), 10)
  return isNaN(n) || n < 1 ? def : Math.min(n, 100)
}

// ─── List agents ──────────────────────────────────────────────────────────────

export async function listAgents(
  status: string | undefined,
  rawPage: string | undefined,
  rawLimit: string | undefined,
): Promise<PaginatedResult<AgentListItem>> {
  const page = parsePage(rawPage)
  const limit = parseLimit(rawLimit)
  const skip = (page - 1) * limit

  const where = status ? { status: status as never } : {}

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        agentLevel: true,
        vehicleType: true,
        avgRating: true,
        totalRatings: true,
        createdAt: true,
        verification: {
          select: { status: true, method: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.agent.count({ where }),
  ])

  return { data: agents, total, page, limit, totalPages: Math.ceil(total / limit) }
}

// ─── Agent detail ─────────────────────────────────────────────────────────────

export async function getAgentById(id: string): Promise<AgentDetail> {
  const agent = await prisma.agent.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      agentLevel: true,
      vehicleType: true,
      vehiclePlate: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleYear: true,
      momoPhone: true,
      orangePhone: true,
      avgRating: true,
      totalRatings: true,
      createdAt: true,
      verification: {
        select: { status: true, method: true, createdAt: true },
      },
      verificationDocs: {
        select: { id: true, type: true, fileUrl: true, fileName: true, uploadedAt: true },
        orderBy: { uploadedAt: 'desc' },
      },
    },
  })

  if (!agent) throw new NotFoundError('Agent not found')
  return agent
}

// ─── Verify agent ─────────────────────────────────────────────────────────────

export type VerificationDecision = 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO'

export interface VerifyAgentInput {
  decision: VerificationDecision
  method?: string
  notes?: string
  neighbourNotes?: string
  rejectionReason?: string
  requestedInfoNote?: string
}

export async function verifyAgent(
  agentId: string,
  adminId: string,
  input: VerifyAgentInput,
): Promise<void> {
  const { decision, method, notes, neighbourNotes, rejectionReason, requestedInfoNote } = input

  await prisma.$transaction(async (tx) => {
    // 1. Confirm agent exists and capture current state
    const agent = await tx.agent.findUnique({
      where: { id: agentId },
      select: { id: true, status: true, name: true },
    })
    if (!agent) throw new NotFoundError('Agent not found')

    const currentVerification = await tx.agentVerification.findUnique({
      where: { agentId },
      select: { status: true },
    })

    // 2. Upsert verification record
    await tx.agentVerification.upsert({
      where: { agentId },
      create: {
        agentId,
        adminId,
        status: decision,
        method: (method as never) ?? null,
        notes: notes ?? null,
        neighbourNotes: neighbourNotes ?? null,
        requestedInfoNote: requestedInfoNote ?? null,
        rejectionReason: rejectionReason ?? null,
      },
      update: {
        adminId,
        status: decision,
        method: (method as never) ?? null,
        notes: notes ?? null,
        neighbourNotes: neighbourNotes ?? null,
        requestedInfoNote: requestedInfoNote ?? null,
        rejectionReason: rejectionReason ?? null,
      },
    })

    // 3. Update Agent.status only on APPROVED
    const newAgentStatus = decision === 'APPROVED' ? 'VERIFIED' : agent.status
    if (decision === 'APPROVED') {
      await tx.agent.update({
        where: { id: agentId },
        data: { status: 'VERIFIED' },
      })
    }

    // 4. AuditLog
    await tx.auditLog.create({
      data: {
        adminId,
        action: 'AGENT_VERIFICATION',
        targetType: 'Agent',
        targetId: agentId,
        details: {
          before: {
            verificationStatus: currentVerification?.status ?? null,
            agentStatus: agent.status,
          },
          after: {
            verificationStatus: decision,
            agentStatus: newAgentStatus,
          },
          reason: rejectionReason ?? requestedInfoNote ?? notes ?? null,
        },
      },
    })

    // 5. In-app notification for agent
    const notifTitle =
      decision === 'APPROVED'
        ? 'Account verified'
        : decision === 'REJECTED'
          ? 'Verification rejected'
          : 'More information required'

    const notifBody =
      decision === 'APPROVED'
        ? 'Your account has been verified. You can now start accepting jobs.'
        : decision === 'REJECTED'
          ? `Your verification was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`
          : `We need more information to complete your verification. ${requestedInfoNote ?? ''}`

    await tx.notification.create({
      data: {
        recipientType: 'AGENT',
        agentId,
        channel: 'SMS',
        type: 'VERIFICATION_DECISION',
        title: notifTitle,
        body: notifBody.trim(),
      },
    })
  })
}
