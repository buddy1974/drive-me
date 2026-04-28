import { apiFetch } from '@/lib/api'
import type { AdminData, AdminStats } from '@/types'

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
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
        <p className="text-sm text-red-400">Failed to load: {adminError}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Signed in as <span className="font-medium text-slate-300">{admin.email}</span>
          {' '}·{' '}
          <span className="font-medium text-slate-300">
            {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total agents" value={String(stats?.totalAgents ?? 0)} icon="👤" />
        <StatCard label="Active jobs"  value={String(stats?.activeJobs  ?? 0)} icon="📋" />
        <StatCard label="Total users"  value={String(stats?.totalUsers  ?? 0)} icon="🧑" />
        <StatCard label="Revenue"      value={formatXAF(stats?.revenue  ?? 0)} icon="💰" />
      </div>

      <div className="mt-8 bg-[#1E293B] rounded-xl border border-[#334155] p-5">
        <h2 className="text-sm font-semibold text-slate-100 mb-4">System status</h2>
        <div className="space-y-2">
          {[
            { label: 'API', value: 'Online' },
            { label: 'Auth', value: 'Active session' },
            { label: 'Database', value: 'Connected' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#1E293B] rounded-xl border border-[#1A56DB]/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Investor Presentation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Drive Me — Seed Round 2026</p>
          </div>
          <a
            href="/drive-me-pitch-deck.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
          >
            Open Pitch Deck
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
