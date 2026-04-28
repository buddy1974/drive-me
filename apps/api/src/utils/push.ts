// Expo Push Notification service — never throws, push failures must not break job flow

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export async function sendPush(
  token:  string | null | undefined,
  title:  string,
  body:   string,
  data?:  Record<string, unknown>,
): Promise<void> {
  if (!token?.startsWith('ExponentPushToken[')) return

  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify({
        to:    token,
        title,
        body,
        sound: 'default',
        ...(data ? { data } : {}),
      }),
    })
  } catch {
    // best-effort — never propagate push errors to callers
  }
}
