const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING_VERIFICATION: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ONLINE: { label: 'Online', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  OFFLINE: { label: 'Offline', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  SUSPENDED: { label: 'Suspended', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  BANNED: { label: 'Banned', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default function AgentsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Agent verification</h1>
          <p className="text-sm text-zinc-500 mt-1">Review and approve agent applications</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Verified', 'Suspended'].map((filter) => (
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
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Agent</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Vehicle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Level</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <p className="text-zinc-400 text-sm">No agents yet</p>
                <p className="text-zinc-300 text-xs mt-1">
                  Agent management API endpoints are next in the build queue
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status badge reference — kept for when data arrives */}
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
