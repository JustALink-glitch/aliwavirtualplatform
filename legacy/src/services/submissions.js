import apiCall from './api'

const submissionsAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/submissions${query}`)
  },
  get: (id) => apiCall(`/submissions/${id}`),
  create: (data) => apiCall('/submissions', 'POST', data),
  grade: (id, grade, feedback) => apiCall(`/submissions/${id}/grade`, 'PATCH', { grade, feedback }),
}

export default submissionsAPI
