import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await isAuthenticated()) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      {children}
    </div>
  )
}
