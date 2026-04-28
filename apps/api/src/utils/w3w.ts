// W3W_API_KEY — add to Render environment variables
// Get a free key at: https://developer.what3words.com/public-api

const BASE = 'https://api.what3words.com/v3'

export async function convertToW3W(lat: number, lng: number): Promise<string | null> {
  const key = process.env.W3W_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `${BASE}/convert-to-3wa?coordinates=${lat},${lng}&language=en&format=json&key=${key}`,
    )
    if (!res.ok) return null
    const json = await res.json() as { words?: string }
    return json.words ?? null
  } catch {
    return null
  }
}

export async function convertFromW3W(words: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.W3W_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `${BASE}/convert-to-coordinates?words=${encodeURIComponent(words)}&format=json&key=${key}`,
    )
    if (!res.ok) return null
    const json = await res.json() as { coordinates?: { lat: number; lng: number } }
    return json.coordinates ?? null
  } catch {
    return null
  }
}
