import apiCall from './api'

const notificationsAPI = {
  list: () => apiCall('/notifications').catch(() => ({ notifications: [] })),
  markAllRead: () => apiCall('/notifications/mark-all-read', 'PATCH').catch(() => ({})),
  markOneRead: (id) => apiCall(`/notifications/${id}/mark-read`, 'PATCH').catch(() => ({})),
}

export default notificationsAPI
