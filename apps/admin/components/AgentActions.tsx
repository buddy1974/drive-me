'use client'

import { useTransition, useState } from 'react'
import { approveAgent, rejectAgent } from '@/actions/agents'

export function AgentActions({
  agentId,
  status,
}: {
  agentId: string
  status: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (status !== 'PENDING_VERIFICATION') return null

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveAgent(agentId)
      if (result.error) setError(result.error)
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectAgent(agentId)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-xs text-red-500 mr-1">{error}</span>
      )}
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '…' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="px-2.5 py-1 rounded-md bg-white text-red-600 border border-red-200 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        {isPending ? '…' : 'Reject'}
      </button>
    </div>
  )
}
