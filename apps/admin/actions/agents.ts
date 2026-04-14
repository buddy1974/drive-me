'use server'

import { revalidatePath } from 'next/cache'
import { apiFetch } from '@/lib/api'

export async function approveAgent(agentId: string): Promise<{ error?: string }> {
  const { error } = await apiFetch(`/admin/agents/${agentId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ decision: 'APPROVED' }),
  })
  if (error) return { error }
  revalidatePath('/agents')
  return {}
}

export async function rejectAgent(
  agentId: string,
  rejectionReason?: string,
): Promise<{ error?: string }> {
  const { error } = await apiFetch(`/admin/agents/${agentId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ decision: 'REJECTED', rejectionReason: rejectionReason ?? '' }),
  })
  if (error) return { error }
  revalidatePath('/agents')
  return {}
}
