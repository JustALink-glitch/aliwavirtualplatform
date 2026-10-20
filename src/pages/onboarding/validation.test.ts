import { describe, expect, it } from 'vitest'
import { timeZoneLabel } from '@/lib/format'
import { validateEmail, validateFullName, validatePassword } from './validation'

describe('onboarding validation (R1.01x, T1.01x copy)', () => {
  it('needs a first and last name', () => {
    expect(validateFullName('  ')).toBe('Enter your full name.')
    expect(validateFullName('Ada')).toBe('Enter your first and last name.')
    expect(validateFullName(' Ada   Obi ')).toBeUndefined()
  })

  it('checks email shape', () => {
    expect(validateEmail('abdulhameed@aliwa')).toBe('Enter an email address like name@organisation.org.')
    expect(validateEmail('ada@aliwa.org')).toBeUndefined()
  })

  it('needs at least 10 characters', () => {
    expect(validatePassword('short')).toBe('Use at least 10 characters.')
    expect(validatePassword('ten-chars!')).toBeUndefined()
  })
})

describe('timeZoneLabel', () => {
  it('matches the design wording for Lagos', () => {
    expect(timeZoneLabel('Africa/Lagos')).toBe('West Africa Time — Lagos (UTC+01:00)')
  })
})
