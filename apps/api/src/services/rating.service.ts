import { prisma } from '../lib/prisma'
import { NotFoundError, UnauthorizedError, ValidationError } from './auth.service'

export { NotFoundError, UnauthorizedError, ValidationError }

export async function createRating(
  userId: string,
  jobId: string,
  stars: number,
  comment?: string,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, userId: true, agentId: true, status: true },
  })

  if (!job) throw new NotFoundError('Job not found')
  if (job.status !== 'COMPLETED') throw new ValidationError('Can only rate completed jobs')
  if (job.userId !== userId) throw new UnauthorizedError('Access denied')
  if (!job.agentId) throw new ValidationError('No agent to rate on this job')

  const existing = await prisma.rating.findUnique({ where: { jobId } })
  if (existing) throw new ValidationError('This job has already been rated')

  return prisma.$transaction(async (tx) => {
    const rating = await tx.rating.create({
      data: {
        jobId,
        userId,
        agentId: job.agentId!,
        stars,
        comment: comment ?? null,
      },
    })

    // Recalculate agent average rating
    const agent = await tx.agent.findUnique({
      where: { id: job.agentId! },
      select: { avgRating: true, totalRatings: true },
    })

    if (agent) {
      const newTotal = agent.totalRatings + 1
      const newAvg = (agent.avgRating * agent.totalRatings + stars) / newTotal
      await tx.agent.update({
        where: { id: job.agentId! },
        data: {
          avgRating: Math.round(newAvg * 100) / 100,
          totalRatings: newTotal,
        },
      })
    }

    return rating
  })
}
