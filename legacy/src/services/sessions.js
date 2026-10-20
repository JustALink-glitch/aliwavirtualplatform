import apiCall from './api'

const sessionsAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/sessions${query}`)
  },
  get: (id) => apiCall(`/sessions/${id}`),
  create: (data) => apiCall('/sessions', 'POST', data),
  update: (id, data) => apiCall(`/sessions/${id}`, 'PUT', data),
  remove: (id) => apiCall(`/sessions/${id}`, 'DELETE'),
}

export default sessionsAPI
