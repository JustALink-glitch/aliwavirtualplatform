import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services'
import { normalizeUser } from '../utils/helpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(normalizeUser(JSON.parse(savedUser)))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password })
    const normalized = normalizeUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
    return normalized
  }

  const register = async (formData) => {
    const data = await authAPI.register(formData)
    const normalized = normalizeUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
    return normalized
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const setPassword = async (formData) => {
    const data = await authAPI.setPassword(formData)
    const normalized = normalizeUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
    return normalized
  }

  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)