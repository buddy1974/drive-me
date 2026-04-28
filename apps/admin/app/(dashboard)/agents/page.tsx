import { apiFetch } from '@/lib/api'
import { AgentActions } from '@/components/AgentActions'
import type { AgentListItem, PaginatedResponse } from '@/types'

const AGENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING_VERIFICATION: { label: 'Pending',   className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  VERIFIED:             { label: 'Verified',  className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  ONLINE:               { label: 'Online',    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  OFFLINE:              { label: 'Offline',   className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  SUSPENDED:            { label: 'Suspended', className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  BANNED:               { label: 'Banned',    className: 'bg-red-500/10 text-red-400 border-red-500/30' },
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
  const s = AGENT_STATUS[status] ?? { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function AgentAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-indigo-400">{initials}</span>
    </div>
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
  const total  = data?.total ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Agent verification</h1>
          <p className="text-sm text-slate-400 mt-1">
            {total} agent{total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { label: 'All',       value: undefined },
            { label: 'Pending',   value: 'PENDING_VERIFICATION' },
            { label: 'Verified',  value: 'VERIFIED' },
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
                    ? 'bg-[#1A56DB] text-white border-[#1A56DB]'
                    : 'bg-[#1E293B] text-slate-400 border-[#334155] hover:border-slate-400'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          Failed to load agents: {error}
        </div>
      )}

      <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155] bg-[#0F172A]">
              {['Name', 'Phone', 'Status', 'Level', 'Vehicle', 'Rating', 'Applied', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-slate-500 text-sm">No agents yet</p>
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#243144] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AgentAvatar name={agent.name} />
                      <span className="font-medium text-slate-100">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{agent.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{LEVEL_LABEL[agent.agentLevel] ?? agent.agentLevel}</td>
                  <td className="px-4 py-3 text-slate-400">{VEHICLE_LABEL[agent.vehicleType] ?? agent.vehicleType}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {agent.totalRatings > 0
                      ? `${agent.avgRating.toFixed(1)} (${agent.totalRatings})`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(agent.createdAt)}</td>
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
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Page {data.page} of {data.totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <a
                href={`/agents?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page - 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B] hover:border-slate-400 transition-colors"
              >
                Previous
              </a>
            )}
            {data.page < data.totalPages && (
              <a
                href={`/agents?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page + 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B] hover:border-slate-400 transition-colors"
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
