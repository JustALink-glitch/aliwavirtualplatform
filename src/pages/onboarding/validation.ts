// Client-side checks mirroring the API (copy from R1.01x / T1.01x). The API validates again.

export const MIN_PASSWORD_LENGTH = 10

export function validateFullName(value: string): string | undefined {
  const name = value.trim().replace(/\s+/g, ' ')
  if (!name) return 'Enter your full name.'
  if (!name.includes(' ')) return 'Enter your first and last name.'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? undefined : 'Enter an email address like name@organisation.org.'
}

export function validatePassword(value: string): string | undefined {
  if (value.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (value.length > 72) return 'Use at most 72 characters.'
  return undefined
}
