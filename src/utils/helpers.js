export const normalizeUser = (user) => {
  if (!user) return null

  const firstName = user.firstName ?? user.first_name ?? ''
  const lastName = user.lastName ?? user.last_name ?? ''
  const phone = user.phone ?? user.phone_number ?? ''
  const isFirstLogin = user.isFirstLogin ?? user.is_first_login ?? false

  return {
    ...user,
    firstName,
    lastName,
    first_name: user.first_name ?? firstName,
    last_name: user.last_name ?? lastName,
    phone,
    phone_number: user.phone_number ?? phone,
    isFirstLogin,
    is_first_login: user.is_first_login ?? isFirstLogin,
  }
}

export const getUserFullName = (user) => {
  if (!user) return ''
  return `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim()
}

export const getUserInitials = (user, fallback = '??') => {
  if (!user) return fallback
  const firstName = user.firstName || user.first_name || ''
  const lastName = user.lastName || user.last_name || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  return initials || fallback
}

export const getUserPhone = (user) => user?.phone || user?.phone_number || ''
export const getUserBio = (user) => user?.bio || ''
