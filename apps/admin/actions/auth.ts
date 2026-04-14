'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import type { AdminData } from '@/types'

const API_URL = process.env.API_URL!

export type LoginState = { error: string } | null

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let accessToken: string
  let refreshToken: string

  try {
    const res = await fetch(`${API_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? 'Login failed' }
    }

    const result = data as { accessToken: string; refreshToken: string; admin: AdminData }
    accessToken = result.accessToken
    refreshToken = result.refreshToken
  } catch {
    return { error: 'Could not reach server — try again' }
  }

  const cookieStore = await cookies()

  cookieStore.set('dm_access', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  cookieStore.set('dm_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const token = await getAccessToken()

  if (token) {
    try {
      await fetch(`${API_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
    } catch {
      // continue with local logout even if API call fails
    }
  }

  const cookieStore = await cookies()
  cookieStore.delete('dm_access')
  cookieStore.delete('dm_refresh')

  redirect('/login')
}
