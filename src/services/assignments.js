import apiCall from './api'

const assignmentsAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/assignments${query}`)
  },
  get: (id) => apiCall(`/assignments/${id}`),
  create: (data) => apiCall('/assignments', 'POST', data),
  update: (id, data) => apiCall(`/assignments/${id}`, 'PUT', data),
  remove: (id) => apiCall(`/assignments/${id}`, 'DELETE'),
}

export default assignmentsAPI
