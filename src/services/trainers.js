import apiCall from './api'

const trainersAPI = {
  // List trainers — filter by role=trainer
  list: (params = {}) => {
    const query = new URLSearchParams({ role: 'trainer', ...params }).toString()
    return apiCall(`/users?${query}`)
  },
  get: (id) => apiCall(`/users/${id}`),
  // Invite a trainer
  invite: (data) => apiCall('/users/invite-trainer', 'POST', data),
  update: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
  revoke: (id) => apiCall(`/users/${id}/revoke`, 'PATCH'),
  remove: (id) => apiCall(`/users/${id}`, 'DELETE'),
}

export default trainersAPI
