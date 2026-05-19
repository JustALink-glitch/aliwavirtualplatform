const API_URL = import.meta.env.VITE_API_URL || 'https://hemstitch-encourage-anguished.ngrok-free.dev/api'

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token')

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(data && { body: JSON.stringify(data) })
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong')
  }

  return result
}

// Auth API
export const authAPI = {
  register: (data) => apiCall('/auth/register', 'POST', data),
  login: (data) => apiCall('/auth/login', 'POST', data),
  setPassword: (data) => apiCall('/auth/set-password', 'POST', data),
  forgotPassword: (data) => apiCall('/auth/forgot-password', 'POST', data),
  verifyOtp: (data) => apiCall('/auth/verify-otp', 'POST', data),
  resetPassword: (data) => apiCall('/auth/reset-password', 'POST', data),
  getMe: () => apiCall('/auth/me'),
}

export default apiCall