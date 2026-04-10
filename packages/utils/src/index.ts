// ================================
// Currency
// ================================

/**
 * Format amount in XAF (Central African Franc)
 */
export function formatCurrency(amount: number, currency = 'XAF'): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ================================
// Phone number utilities (Cameroon)
// ================================

const CMR_PHONE_REGEX = /^(\+237|237)?[26][0-9]{8}$/

/**
 * Validate a Cameroon phone number
 * Accepts: +237XXXXXXXXX, 237XXXXXXXXX, 6XXXXXXXXX, 2XXXXXXXXX
 */
export function validateCMRPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '')
  return CMR_PHONE_REGEX.test(cleaned)
}

/**
 * Normalize Cameroon phone number to international format (+237XXXXXXXXX)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.startsWith('+237')) return cleaned
  if (cleaned.startsWith('237')) return `+${cleaned}`
  if (cleaned.startsWith('6') || cleaned.startsWith('2')) return `+237${cleaned}`
  return cleaned
}

/**
 * Detect mobile money provider from phone number
 * MTN: 65x, 67x, 68x, 69x
 * Orange: 69x (some), 655x, 656x, 657x, 658x, 659x
 */
export function detectMobileMoneyProvider(phone: string): 'MTN' | 'ORANGE' | null {
  const normalized = formatPhone(phone).replace('+237', '')
  if (/^(65[0-4]|67[0-9]|68[0-9])/.test(normalized)) return 'MTN'
  if (/^(69[0-9]|655|656|657|658|659)/.test(normalized)) return 'ORANGE'
  return null
}

// ================================
// Date utilities
// ================================

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
