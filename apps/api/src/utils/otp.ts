import crypto from 'crypto'

export const OTP_EXPIRY_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 5

export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}
