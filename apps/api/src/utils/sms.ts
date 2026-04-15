// eslint-disable-next-line @typescript-eslint/no-require-imports
const AfricasTalking = require('africastalking') as (opts: {
  apiKey: string
  username: string
}) => { SMS: { send: (opts: { to: string[]; message: string; from?: string }) => Promise<unknown> } }

function getClient() {
  return AfricasTalking({
    apiKey:   process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!,
  })
}

export async function sendSMS(to: string, message: string): Promise<void> {
  const sms = getClient().SMS
  await sms.send({ to: [to], message, from: undefined })
}
