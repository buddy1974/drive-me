import { apiFetch } from '@/lib/api'
import type { Job, PaginatedResponse } from '@/types'

const JOB_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:                 { label: 'Pending',         className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  ACCEPTED:                { label: 'Accepted',        className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  EN_ROUTE_TO_PICKUP:      { label: 'En route',        className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  ARRIVED_AT_PICKUP:       { label: 'At pickup',       className: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  IN_PROGRESS:             { label: 'In progress',     className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  ARRIVED_AT_DESTINATION:  { label: 'At destination',  className: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  COMPLETED:               { label: 'Completed',       className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  CANCELLED_BY_USER:       { label: 'Cancelled (user)',  className: 'bg-red-500/10 text-red-400 border-red-500/30' },
  CANCELLED_BY_AGENT:      { label: 'Cancelled (agent)', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
  CANCELLED_BY_ADMIN:      { label: 'Cancelled (admin)', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
}

const SERVICE_ICON: Record<string, string> = {
  ERRAND:   '🛍️',
  PICKUP:   '🚗',
  DELIVERY: '📦',
}

function StatusBadge({ status }: { status: string }) {
  const s = JOB_STATUS[status] ?? { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams

  const qs = new URLSearchParams()
  if (status) qs.set('status', status)
  if (page)   qs.set('page', page)

  const { data, error } = await apiFetch<PaginatedResponse<Job>>(
    `/admin/jobs?${qs.toString()}`,
  )

  const jobs  = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Job monitoring</h1>
          <p className="text-sm text-slate-400 mt-1">
            {total} job{total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { label: 'All',       value: undefined },
            { label: 'Pending',   value: 'PENDING' },
            { label: 'Active',    value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED' },
          ].map(({ label, value }) => {
            const isActive = (value ?? '') === (status ?? '')
            const href = value ? `/jobs?status=${value}` : '/jobs'
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
          Failed to load jobs: {error}
        </div>
      )}

      <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155] bg-[#0F172A]">
              {['Job ID', 'Type', 'Status', 'User', 'Agent', 'Price', 'Pickup zone', 'Created'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-slate-500 text-sm">No jobs yet</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#243144] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {job.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>{SERVICE_ICON[job.serviceType] ?? ''}</span>
                      <span>{job.serviceType.charAt(0) + job.serviceType.slice(1).toLowerCase()}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-100">{job.user.name}</p>
                    <p className="text-slate-500 text-xs">{job.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {job.agent ? (
                      <>
                        <p className="font-medium text-slate-100">{job.agent.name}</p>
                        <p className="text-slate-500 text-xs">{job.agent.phone}</p>
                      </>
                    ) : (
                      <span className="text-slate-500 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium tabular-nums">
                    {job.estimatedPrice.toLocaleString('fr-FR')} XAF
                  </td>
                  <td className="px-4 py-3 text-slate-400">{job.pickupLocation.quarter}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(job.createdAt)}</td>
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
                href={`/jobs?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page - 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B] hover:border-slate-400 transition-colors"
              >
                Previous
              </a>
            )}
            {data.page < data.totalPages && (
              <a
                href={`/jobs?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page + 1) }).toString()}`}
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
