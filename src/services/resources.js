import apiCall from './api'

const resourcesAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/resources${query}`)
  },
  create: (data) => apiCall('/resources', 'POST', data),
  remove: (id) => apiCall(`/resources/${id}`, 'DELETE'),
}

export default resourcesAPI
