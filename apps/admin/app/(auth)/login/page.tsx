'use client'

import { useActionState, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { login, type LoginState } from '@/actions/auth'

const QUICK_USERS = [
  {
    label:    'Marcel',
    role:     'SUPER ADMIN',
    email:    'admin@drive-me.cm',
    password: 'ChangeMe2025!',
  },
] as const

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, null)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function handleQuickAccess(qEmail: string, qPassword: string) {
    // flushSync commits state to the DOM synchronously before requestSubmit reads it
    flushSync(() => {
      setEmail(qEmail)
      setPassword(qPassword)
    })
    formRef.current?.requestSubmit()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">DM</span>
            </div>
            <span className="font-semibold text-zinc-900">Drive Me</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Admin sign in</h1>
          <p className="text-sm text-zinc-500 mt-1">Operator access only</p>
        </div>

        {/* Error */}
        {state?.error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              placeholder="admin@drive-me.cm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Quick access */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-xs text-zinc-400 shrink-0">Quick access</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                disabled={isPending}
                onClick={() => handleQuickAccess(u.email, u.password)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-[#1A56DB] text-xs text-zinc-200 hover:bg-[#1A56DB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>{u.label}</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-[#1A56DB] text-white text-[10px] font-semibold tracking-wide">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
