import { apiFetch } from '@/lib/api'
import type { AdminData } from '@/types'

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
      {note && <p className="text-xs text-zinc-400 mt-1">{note}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const { data: admin, error } = await apiFetch<AdminData>('/admin/auth/me')

  if (error || !admin) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">Failed to load admin profile: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Signed in as <span className="font-medium text-zinc-700">{admin.email}</span>
          {' '}·{' '}
          <span className="font-medium text-zinc-700">
            {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total agents" value="—" note="API endpoint pending" />
        <StatCard label="Active jobs" value="—" note="API endpoint pending" />
        <StatCard label="Total users" value="—" note="API endpoint pending" />
        <StatCard label="Revenue (XAF)" value="—" note="API endpoint pending" />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">System status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">API</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Auth</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active session
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Database</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
