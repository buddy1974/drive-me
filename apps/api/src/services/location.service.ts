import { prisma } from '../lib/prisma'
import { convertToW3W } from '../utils/w3w'
import { NotFoundError, UnauthorizedError } from './auth.service'

export { NotFoundError, UnauthorizedError }

export async function postLocationUpdate(
  jobId:   string,
  agentId: string,
  lat:     number,
  lng:     number,
) {
  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { agentId: true },
  })
  if (!job) throw new NotFoundError('Job not found')
  if (job.agentId !== agentId) throw new UnauthorizedError('Not your job')

  const w3w = await convertToW3W(lat, lng)

  return prisma.locationUpdate.create({
    data: { jobId, agentId, lat, lng, w3w: w3w ?? null },
  })
}

export async function getLatestLocation(
  jobId:   string,
  actorId: string,
  role:    string,
) {
  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { userId: true, agentId: true },
  })
  if (!job) throw new NotFoundError('Job not found')

  if (role === 'user'  && job.userId  !== actorId) throw new UnauthorizedError('Access denied')
  if (role === 'agent' && job.agentId !== actorId) throw new UnauthorizedError('Access denied')

  return prisma.locationUpdate.findFirst({
    where:   { jobId },
    orderBy: { createdAt: 'desc' },
  })
}
