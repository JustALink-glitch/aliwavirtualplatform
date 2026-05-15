import apiCall from './api'

const studentsAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/students${query}`)
  },
  get: (id) => apiCall(`/students/${id}`),
  create: (data) => apiCall('/students', 'POST', data),
  update: (id, data) => apiCall(`/students/${id}`, 'PUT', data),
  remove: (id) => apiCall(`/students/${id}`, 'DELETE'),
  onboard: (data) => apiCall('/students/onboard', 'POST', data),
}

export default studentsAPI
