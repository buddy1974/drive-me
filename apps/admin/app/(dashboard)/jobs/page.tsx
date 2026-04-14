const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  ACCEPTED: { label: 'Accepted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_ROUTE_TO_PICKUP: { label: 'En route', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ARRIVED_AT_PICKUP: { label: 'At pickup', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ARRIVED_AT_DESTINATION: { label: 'At destination', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED_BY_USER: { label: 'Cancelled (user)', className: 'bg-red-50 text-red-600 border-red-200' },
  CANCELLED_BY_AGENT: { label: 'Cancelled (agent)', className: 'bg-red-50 text-red-600 border-red-200' },
  CANCELLED_BY_ADMIN: { label: 'Cancelled (admin)', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default function JobsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Job monitoring</h1>
          <p className="text-sm text-zinc-500 mt-1">Live view of all rides and deliveries</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Completed', 'Cancelled'].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                filter === 'All'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Job ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Agent</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <p className="text-zinc-400 text-sm">No jobs yet</p>
                <p className="text-zinc-300 text-xs mt-1">
                  Job management API endpoints are next in the build queue
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status badge reference */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(STATUS_LABELS).map(([key, { label, className }]) => (
          <span
            key={key}
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${className}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
