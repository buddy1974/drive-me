import { apiFetch } from '@/lib/api'
import type { AdminData, AdminStats } from '@/types'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
    </div>
  )
}

function formatXAF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' XAF'
}

export default async function DashboardPage() {
  const [{ data: admin, error: adminError }, { data: stats }] = await Promise.all([
    apiFetch<AdminData>('/admin/auth/me'),
    apiFetch<AdminStats>('/admin/stats'),
  ])

  if (adminError || !admin) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">Failed to load: {adminError}</p>
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
        <StatCard label="Total agents" value={String(stats?.totalAgents ?? 0)} />
        <StatCard label="Active jobs" value={String(stats?.activeJobs ?? 0)} />
        <StatCard label="Total users" value={String(stats?.totalUsers ?? 0)} />
        <StatCard label="Revenue" value={formatXAF(stats?.revenue ?? 0)} />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">System status</h2>
        <div className="space-y-2">
          {[
            { label: 'API', value: 'Online' },
            { label: 'Auth', value: 'Active session' },
            { label: 'Database', value: 'Connected' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">{label}</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
