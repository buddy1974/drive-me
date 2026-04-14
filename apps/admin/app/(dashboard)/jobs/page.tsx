import { apiFetch } from '@/lib/api'
import type { Job, PaginatedResponse } from '@/types'

const JOB_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:                 { label: 'Pending', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  ACCEPTED:                { label: 'Accepted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_ROUTE_TO_PICKUP:      { label: 'En route', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ARRIVED_AT_PICKUP:       { label: 'At pickup', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  IN_PROGRESS:             { label: 'In progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ARRIVED_AT_DESTINATION:  { label: 'At destination', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  COMPLETED:               { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED_BY_USER:       { label: 'Cancelled (user)', className: 'bg-red-50 text-red-600 border-red-200' },
  CANCELLED_BY_AGENT:      { label: 'Cancelled (agent)', className: 'bg-red-50 text-red-600 border-red-200' },
  CANCELLED_BY_ADMIN:      { label: 'Cancelled (admin)', className: 'bg-red-50 text-red-700 border-red-200' },
}

const SERVICE_LABEL: Record<string, string> = {
  ERRAND: 'Errand',
  PICKUP: 'Pickup',
  DELIVERY: 'Delivery',
}

function StatusBadge({ status }: { status: string }) {
  const s = JOB_STATUS[status] ?? { label: status, className: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
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
  if (page) qs.set('page', page)

  const { data, error } = await apiFetch<PaginatedResponse<Job>>(
    `/admin/jobs?${qs.toString()}`,
  )

  const jobs = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Job monitoring</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {total} job{total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { label: 'All', value: undefined },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Active', value: 'IN_PROGRESS' },
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
          Failed to load jobs: {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {['Job ID', 'Type', 'Status', 'User', 'Agent', 'Pickup zone', 'Created'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-zinc-400 text-sm">No jobs yet</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {job.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {SERVICE_LABEL[job.serviceType] ?? job.serviceType}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{job.user.name}</p>
                    <p className="text-zinc-400 text-xs">{job.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {job.agent ? (
                      <>
                        <p className="font-medium text-zinc-900">{job.agent.name}</p>
                        <p className="text-zinc-400 text-xs">{job.agent.phone}</p>
                      </>
                    ) : (
                      <span className="text-zinc-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{job.pickupLocation.quarter}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(job.createdAt)}</td>
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
                href={`/jobs?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page - 1) }).toString()}`}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 transition-colors"
              >
                Previous
              </a>
            )}
            {data.page < data.totalPages && (
              <a
                href={`/jobs?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.page + 1) }).toString()}`}
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
