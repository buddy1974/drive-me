import { apiFetch } from '@/lib/api'
import { AgentActions } from '@/components/AgentActions'
import type { AgentListItem, PaginatedResponse } from '@/types'

const AGENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING_VERIFICATION: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  VERIFIED:             { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ONLINE:               { label: 'Online', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  OFFLINE:              { label: 'Offline', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  SUSPENDED:            { label: 'Suspended', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  BANNED:               { label: 'Banned', className: 'bg-red-50 text-red-700 border-red-200' },
}

const VEHICLE_LABEL: Record<string, string> = {
  MOTORBIKE: 'Motorbike',
  CAR: 'Car',
  ON_FOOT: 'On foot',
}

const LEVEL_LABEL: Record<string, string> = {
  LEVEL_1: 'Level 1',
  LEVEL_2: 'Level 2',
  LEVEL_3: 'Level 3',
}

function StatusBadge({ status }: { status: string }) {
  const s = AGENT_STATUS[status] ?? { label: status, className: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams

  const qs = new URLSearchParams()
  if (status) qs.set('status', status)
  if (page) qs.set('page', page)

  const { data, error } = await apiFetch<PaginatedResponse<AgentListItem>>(
    `/admin/agents?${qs.toString()}`,
  )

  const agents = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Agent verification</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {total} agent{total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { label: 'All', value: undefined },
            { label: 'Pending', value: 'PENDING_VERIFICATION' },
            { label: 'Verified', value: 'VERIFIED' },
            { label: 'Suspended', value: 'SUSPENDED' },
          ].map(({ label, value }) => {
            const isActive = (value ?? '') === (status ?? '')
            const href = value ? `/agents?status=${value}` : '/agents'
            return (
              <a
                key={label}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Failed to load agents: {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {['Name', 'Phone', 'Status', 'Level', 'Vehicle', 'Rating', 'Applied', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-zinc-400 text-sm">No agents yet</p>
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">{agent.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{agent.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{LEVEL_LABEL[agent.agentLevel] ?? agent.agentLevel}</td>
                  <td className="px-4 py-3 text-zinc-600">{VEHICLE_LABEL[agent.vehicleType] ?? agent.vehicleType}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {agent.totalRatings > 0
                      ? `${agent.avgRating.toFixed(1)} (${agent.totalRatings})`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(agent.createdAt)}</td>
                  <td className="px-4 py-3">
                    <AgentActions agentId={agent.id} status={agent.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {data.page} of {data.totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <a
                href={`/agents?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page - 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 transition-colors"
              >
                Previous
              </a>
            )}
            {data.page < data.totalPages && (
              <a
                href={`/agents?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page + 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
