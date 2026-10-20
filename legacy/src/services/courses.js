import apiCall from './api'

const coursesAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/courses${query}`)
  },
  get: (id) => apiCall(`/courses/${id}`),
  create: (data) => apiCall('/courses', 'POST', data),
  update: (id, data) => apiCall(`/courses/${id}`, 'PUT', data),
  assignTrainer: (id, trainerId) => apiCall(`/courses/${id}/assign-trainer`, 'PATCH', { trainerId }),
  remove: (id) => apiCall(`/courses/${id}`, 'DELETE'),
}

export default coursesAPI
