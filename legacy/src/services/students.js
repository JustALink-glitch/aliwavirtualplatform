import apiCall from './api'

const studentsAPI = {
  // List students — filter by role=student on the /users endpoint
  list: (params = {}) => {
    const query = new URLSearchParams({ role: 'student', ...params }).toString()
    return apiCall(`/users?${query}`)
  },
  get: (id) => apiCall(`/users/${id}`),
  // Onboard a single student
  onboard: (data) => apiCall('/users/onboard-student', 'POST', data),
  // Bulk onboard
  bulkOnboard: (data) => apiCall('/users/bulk-onboard', 'POST', data),
  update: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
  revoke: (id) => apiCall(`/users/${id}/revoke`, 'PATCH'),
  remove: (id) => apiCall(`/users/${id}`, 'DELETE'),
}

export default studentsAPI
