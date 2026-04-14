import { prisma } from '../lib/prisma'

export interface AdminStats {
  totalAgents: number
  activeJobs: number
  totalUsers: number
  revenue: number
}

const TERMINAL_STATUSES = [
  'COMPLETED',
  'CANCELLED_BY_USER',
  'CANCELLED_BY_AGENT',
  'CANCELLED_BY_ADMIN',
] as const

export async function getAdminStats(): Promise<AdminStats> {
  const [totalAgents, totalUsers, activeJobs, revenueResult] = await Promise.all([
    prisma.agent.count(),
    prisma.user.count(),
    prisma.job.count({
      where: { status: { notIn: [...TERMINAL_STATUSES] } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    }),
  ])

  return {
    totalAgents,
    totalUsers,
    activeJobs,
    revenue: revenueResult._sum.amount ?? 0,
  }
}
