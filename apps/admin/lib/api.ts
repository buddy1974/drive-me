import { getAccessToken } from './auth'

const API_URL = process.env.API_URL!

type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  const token = await getAccessToken()

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      cache: 'no-store',
    })

    const json = await res.json()

    if (!res.ok) {
      return { data: null, error: (json as { error?: string }).error ?? 'Request failed' }
    }

    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Could not reach server' }
  }
}
