import apiCall from './api'

const attendanceAPI = {
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiCall(`/attendance${query}`)
  },
  mark: (data) => apiCall('/attendance/mark', 'POST', data),
}

export default attendanceAPI
