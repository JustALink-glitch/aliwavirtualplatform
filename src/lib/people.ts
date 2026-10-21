import type { Role } from './roles'

/** "AF" from "ALIWA Foundation", "NE" from "Ngozi Eze". */
export function initials(...parts: (string | null | undefined)[]): string {
  const words = parts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0]!.charAt(0)
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : ''
  return (first + last).toUpperCase()
}

/** "Abdulhameed O." — names in meta lines, the top bar and history. */
export function shortName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0)
  return initial ? `${firstName} ${initial}.` : firstName
}

export const roleLabel: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  trainer: 'Trainer',
  assistant_trainer: 'Assistant trainer',
  participant: 'Participant',
}

/** Splits a full name the way the API does: the last word is the last name. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const clean = fullName.trim().replace(/\s+/g, ' ')
  const at = clean.lastIndexOf(' ')
  return at === -1 ? { firstName: clean, lastName: '' } : { firstName: clean.slice(0, at), lastName: clean.slice(at + 1) }
}
