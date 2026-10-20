import apiCall from './api'

const cohortsAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/cohorts${query}`)
  },
  get: (id) => apiCall(`/cohorts/${id}`),
  create: (data) => apiCall('/cohorts', 'POST', data),
  update: (id, data) => apiCall(`/cohorts/${id}`, 'PUT', data),
  remove: (id) => apiCall(`/cohorts/${id}`, 'DELETE'),
  assignTrainer: (cohortId, trainerId) => apiCall(`/cohorts/${cohortId}/assign-trainer`, 'POST', { trainerId }),
  enrollStudent: (cohortId, studentId) => apiCall(`/cohorts/${cohortId}/enroll`, 'POST', { studentId }),
}

export default cohortsAPI
