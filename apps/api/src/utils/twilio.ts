import twilio from 'twilio'

const getClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  await getClient().messages.create({
    body: `Your Drive Me verification code is: ${code}. Valid for ${10} minutes. Do not share this code.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
  })
}
