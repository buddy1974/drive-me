import { cookies } from 'next/headers'

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('dm_access')?.value
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken()
  return !!token
}
