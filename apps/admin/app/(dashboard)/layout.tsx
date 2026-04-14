import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import type { AdminData } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect('/login')
  }

  const { data: admin } = await apiFetch<AdminData>('/admin/auth/me')

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar
        adminName={admin?.name ?? '—'}
        adminRole={admin?.role ?? 'OPS'}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
