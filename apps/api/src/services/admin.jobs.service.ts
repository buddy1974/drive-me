import { prisma } from '../lib/prisma'
import type { PaginatedResult } from './admin.agents.service'

export interface JobListItem {
  id: string
  serviceType: string
  status: string
  estimatedPrice: number
  finalPrice: number | null
  paymentMethod: string
  createdAt: Date
  user: { name: string; phone: string }
  agent: { name: string; phone: string } | null
  pickupLocation: { quarter: string; address: string }
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10)
  return isNaN(n) || n < 1 ? 1 : n
}

function parseLimit(raw: string | undefined): number {
  const n = parseInt(raw ?? '20', 10)
  return isNaN(n) || n < 1 ? 20 : Math.min(n, 100)
}

export async function listJobs(
  status: string | undefined,
  rawPage: string | undefined,
  rawLimit: string | undefined,
): Promise<PaginatedResult<JobListItem>> {
  const page = parsePage(rawPage)
  const limit = parseLimit(rawLimit)
  const skip = (page - 1) * limit

  const where = status ? { status: status as never } : {}

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: {
        id: true,
        serviceType: true,
        status: true,
        estimatedPrice: true,
        finalPrice: true,
        paymentMethod: true,
        createdAt: true,
        user: { select: { name: true, phone: true } },
        agent: { select: { name: true, phone: true } },
        pickupLocation: { select: { quarter: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ])

  return { data: jobs, total, page, limit, totalPages: Math.ceil(total / limit) }
}
