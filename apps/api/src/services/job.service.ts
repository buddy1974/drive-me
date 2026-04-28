import { prisma } from '../lib/prisma'
import { NotFoundError, UnauthorizedError, ValidationError } from './auth.service'
import { convertToW3W } from '../utils/w3w'
import { sendPush } from '../utils/push'

export { NotFoundError, UnauthorizedError, ValidationError }

// ─── Legal agent-driven transitions ───────────────────────────────────────────

const AGENT_TRANSITIONS: Record<string, string> = {
  ACCEPTED:               'EN_ROUTE_TO_PICKUP',
  EN_ROUTE_TO_PICKUP:     'ARRIVED_AT_PICKUP',
  ARRIVED_AT_PICKUP:      'IN_PROGRESS',
  IN_PROGRESS:            'ARRIVED_AT_DESTINATION',
  ARRIVED_AT_DESTINATION: 'COMPLETED',
}

// ─── Standard job select ──────────────────────────────────────────────────────

const JOB_SELECT = {
  id: true,
  serviceType: true,
  status: true,
  description: true,
  estimatedPrice: true,
  finalPrice: true,
  paymentMethod: true,
  commissionRate: true,
  platformFee: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, phone: true } },
  agent: { select: { id: true, name: true, phone: true } },
  pickupLocation: true,
  destinationLocation: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function estimatePrice(serviceType: string): Promise<number> {
  const FALLBACK: Record<string, number> = { ERRAND: 500, PICKUP: 1000, DELIVERY: 1500 }

  const rule = await prisma.pricingRule.findFirst({
    where: {
      serviceType: serviceType as never,
      effectiveFrom: { lte: new Date() },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }],
    },
    orderBy: { effectiveFrom: 'desc' },
  })

  return rule ? rule.baseRate * rule.multiplier : (FALLBACK[serviceType] ?? 1000)
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface LocationInput {
  lat: number
  lng: number
  address: string
  quarter: string
  landmark?: string
  description?: string
}

export interface CreateJobInput {
  serviceType: string
  pickupLocation: LocationInput
  destinationLocation?: LocationInput
  description: string
  paymentMethod: string
}

// ─── Create job ───────────────────────────────────────────────────────────────

export async function createJob(userId: string, input: CreateJobInput) {
  // Resolve price + W3W addresses in parallel before opening the transaction
  const [estimatedPrice, pickupW3w, destW3w] = await Promise.all([
    estimatePrice(input.serviceType),
    convertToW3W(input.pickupLocation.lat, input.pickupLocation.lng),
    input.destinationLocation
      ? convertToW3W(input.destinationLocation.lat, input.destinationLocation.lng)
      : Promise.resolve(null),
  ])

  const job = await prisma.$transaction(async (tx) => {
    const pickup = await tx.location.create({
      data: {
        lat:         input.pickupLocation.lat,
        lng:         input.pickupLocation.lng,
        address:     input.pickupLocation.address,
        quarter:     input.pickupLocation.quarter,
        landmark:    input.pickupLocation.landmark    ?? null,
        description: input.pickupLocation.description ?? null,
        w3wAddress:  pickupW3w ?? null,
      },
    })

    let destinationId: string | null = null
    if (input.destinationLocation) {
      const dest = await tx.location.create({
        data: {
          lat:         input.destinationLocation.lat,
          lng:         input.destinationLocation.lng,
          address:     input.destinationLocation.address,
          quarter:     input.destinationLocation.quarter,
          landmark:    input.destinationLocation.landmark    ?? null,
          description: input.destinationLocation.description ?? null,
          w3wAddress:  destW3w ?? null,
        },
      })
      destinationId = dest.id
    }

    const created = await tx.job.create({
      data: {
        userId,
        serviceType:           input.serviceType as never,
        status:                'PENDING',
        pickupLocationId:      pickup.id,
        destinationLocationId: destinationId,
        description:           input.description,
        estimatedPrice,
        paymentMethod:         input.paymentMethod as never,
        commissionRate:        0.15,
      },
      select: JOB_SELECT,
    })

    await tx.jobStatusHistory.create({
      data: {
        jobId:          created.id,
        status:         'PENDING',
        changedByUserId: userId,
        changedByType:  'USER',
      },
    })

    return created
  })

  // Notify online agents about the new job (fire-and-forget — outside transaction)
  void (async () => {
    try {
      const agents = await prisma.agent.findMany({
        where:  { status: 'ONLINE', pushToken: { not: null } },
        select: { pushToken: true },
      })
      for (const a of agents) {
        void sendPush(
          a.pushToken,
          'New job available',
          `${input.serviceType} in ${input.pickupLocation.quarter}`,
          { jobId: job.id },
        )
      }
    } catch { /* never break the create flow */ }
  })()

  return job
}

// ─── Get job ──────────────────────────────────────────────────────────────────

export async function getJob(jobId: string, actorId: string, role: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: JOB_SELECT,
  })

  if (!job) throw new NotFoundError('Job not found')

  if (role === 'user' && (job.user as { id: string }).id !== actorId) {
    throw new UnauthorizedError('Access denied')
  }
  if (role === 'agent') {
    const agentId = (job.agent as { id: string } | null)?.id
    if (agentId !== actorId && job.status !== 'PENDING') {
      throw new UnauthorizedError('Access denied')
    }
  }

  return job
}

// ─── Accept job ───────────────────────────────────────────────────────────────

export async function acceptJob(jobId: string, agentId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw new NotFoundError('Job not found')
  if (job.status !== 'PENDING') throw new ValidationError('Job is no longer available')

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.job.update({
      where: { id: jobId },
      data:  { agentId, status: 'ACCEPTED' },
      select: JOB_SELECT,
    })

    await tx.jobStatusHistory.create({
      data: {
        jobId,
        status:           'ACCEPTED',
        changedByAgentId: agentId,
        changedByType:    'AGENT',
      },
    })

    return u
  })

  // Notify the user that their job was accepted (fire-and-forget)
  void (async () => {
    try {
      const user = await prisma.user.findUnique({
        where:  { id: job.userId },
        select: { pushToken: true, name: true },
      })
      const agent = await prisma.agent.findUnique({
        where:  { id: agentId },
        select: { name: true },
      })
      void sendPush(user?.pushToken, 'Agent accepted your job', `${agent?.name ?? 'Your agent'} is on the way`)
    } catch { /* ignore */ }
  })()

  return updated
}

// ─── Update job status ────────────────────────────────────────────────────────

export async function updateJobStatus(
  jobId:     string,
  agentId:   string,
  newStatus: string,
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw new NotFoundError('Job not found')
  if (job.agentId !== agentId) throw new UnauthorizedError('Not your job')

  const expectedNext = AGENT_TRANSITIONS[job.status]
  if (expectedNext !== newStatus) {
    throw new ValidationError(
      `Cannot transition from ${job.status} to ${newStatus}. Expected: ${expectedNext ?? 'none'}`,
    )
  }

  const isCompleting = newStatus === 'COMPLETED'
  const finalPrice   = isCompleting ? job.estimatedPrice : null

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.job.update({
      where: { id: jobId },
      data: {
        status: newStatus as never,
        ...(isCompleting ? { finalPrice } : {}),
      },
      select: JOB_SELECT,
    })

    await tx.jobStatusHistory.create({
      data: {
        jobId,
        status:           newStatus as never,
        changedByAgentId: agentId,
        changedByType:    'AGENT',
      },
    })

    if (isCompleting) {
      const payoutAmount = job.estimatedPrice * (1 - job.commissionRate)

      const agent = await tx.agent.findUnique({
        where:  { id: agentId },
        select: { momoPhone: true, orangePhone: true },
      })

      const mobileMoneyNumber = agent?.momoPhone ?? agent?.orangePhone ?? null

      if (mobileMoneyNumber) {
        await tx.payout.create({
          data: {
            jobId,
            agentId,
            amount:            payoutAmount,
            status:            'PENDING',
            mobileMoneyNumber,
          },
        })
      }

      await tx.agentEarnings.upsert({
        where:  { agentId },
        create: {
          agentId,
          totalEarned:   payoutAmount,
          completedJobs: 1,
          pendingPayout: payoutAmount,
        },
        update: {
          totalEarned:   { increment: payoutAmount },
          completedJobs: { increment: 1 },
          pendingPayout: { increment: payoutAmount },
        },
      })
    }

    return u
  })

  // Notify user on completion (fire-and-forget)
  if (isCompleting) {
    void (async () => {
      try {
        const user = await prisma.user.findUnique({
          where:  { id: job.userId },
          select: { pushToken: true },
        })
        void sendPush(user?.pushToken, 'Job completed ✓', 'Your job has been completed. Rate your agent.')
      } catch { /* ignore */ }
    })()
  }

  return updated
}

// ─── Available jobs (agent browse) ───────────────────────────────────────────

export async function getAvailableJobs(page: number, limit: number) {
  const safeLimit = Math.min(limit, 50)
  const skip      = (page - 1) * safeLimit

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where:   { status: 'PENDING' },
      select:  JOB_SELECT,
      orderBy: { createdAt: 'asc' },
      skip,
      take: safeLimit,
    }),
    prisma.job.count({ where: { status: 'PENDING' } }),
  ])

  return { jobs, total, page, limit: safeLimit }
}

// ─── Agent's own active jobs ──────────────────────────────────────────────────

export async function getAgentActiveJobs(agentId: string) {
  return prisma.job.findMany({
    where: {
      agentId,
      status: { notIn: ['COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_AGENT', 'CANCELLED_BY_ADMIN'] as never[] },
    },
    select:  JOB_SELECT,
    orderBy: { updatedAt: 'desc' },
  })
}

// ─── Cancel job ───────────────────────────────────────────────────────────────

export async function cancelJob(
  jobId:   string,
  actorId: string,
  role:    'user' | 'agent',
  reason?: string,
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw new NotFoundError('Job not found')

  if (!['PENDING', 'ACCEPTED'].includes(job.status)) {
    throw new ValidationError('Job cannot be cancelled at this stage')
  }
  if (role === 'agent' && job.status === 'PENDING') {
    throw new ValidationError('Agents cannot cancel jobs they have not accepted')
  }
  if (role === 'user'  && job.userId  !== actorId) throw new UnauthorizedError('Access denied')
  if (role === 'agent' && job.agentId !== actorId) throw new UnauthorizedError('Not your job')

  const cancelStatus = role === 'user' ? 'CANCELLED_BY_USER' : 'CANCELLED_BY_AGENT'

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.job.update({
      where: { id: jobId },
      data:  { status: cancelStatus as never },
      select: JOB_SELECT,
    })

    await tx.jobStatusHistory.create({
      data: {
        jobId,
        status:           cancelStatus as never,
        changedByType:    role === 'user' ? 'USER' : 'AGENT',
        changedByUserId:  role === 'user'  ? actorId : null,
        changedByAgentId: role === 'agent' ? actorId : null,
        notes:            reason ?? null,
      },
    })

    await tx.cancellationRecord.create({
      data: {
        jobId,
        cancelledByType:   role === 'user' ? 'USER' : 'AGENT',
        cancelledByUserId:  role === 'user'  ? actorId : null,
        cancelledByAgentId: role === 'agent' ? actorId : null,
        reason:             reason ?? null,
      },
    })

    return u
  })

  // Notify the other party (fire-and-forget)
  void (async () => {
    try {
      if (role === 'user' && job.agentId) {
        const agent = await prisma.agent.findUnique({ where: { id: job.agentId }, select: { pushToken: true } })
        void sendPush(agent?.pushToken, 'Job cancelled', 'The customer cancelled the job')
      } else if (role === 'agent') {
        const user = await prisma.user.findUnique({ where: { id: job.userId }, select: { pushToken: true } })
        void sendPush(user?.pushToken, 'Job cancelled', 'Your agent cancelled the job')
      }
    } catch { /* ignore */ }
  })()

  return updated
}
