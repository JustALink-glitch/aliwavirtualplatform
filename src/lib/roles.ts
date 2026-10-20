/** Roles from Development Reference V1 §03. Must match the API's `member_role`. */
export type Role = 'owner' | 'admin' | 'trainer' | 'assistant_trainer' | 'participant'

export type Area = 'admin' | 'trainer' | 'participant'

export function areaForRole(role: Role): Area {
  switch (role) {
    case 'owner':
    case 'admin':
      return 'admin'
    case 'trainer':
    case 'assistant_trainer':
      return 'trainer'
    case 'participant':
      return 'participant'
  }
}

/** Where each role lands after sign-in (§03 "Lands on"). */
export function homePath(role: Role): string {
  return `/${areaForRole(role)}`
}
