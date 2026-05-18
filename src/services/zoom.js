const API_URL = 'http://localhost:5000/api'

const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token')
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  }
  const response = await fetch(`${API_URL}${endpoint}`, config)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Something went wrong')
  return result
}

/**
 * zoomAPI — wraps the /api/zoom/* backend endpoints
 */
const zoomAPI = {
  /** Get Meeting SDK JWT signature for client.join() */
  getSDKSignature: (meetingNumber, role = 0) =>
    apiCall(`/zoom/sdk-signature?meetingNumber=${meetingNumber}&role=${role}`),

  /**
   * Get OBF token for cross-account joins.
   * @param {string} teacherUserId - internal UUID of the teacher who hosts the meeting
   */
  getOBFToken: (teacherUserId) =>
    apiCall(`/zoom/obf-token?teacherUserId=${teacherUserId}`),

  /** Check if the current trainer has connected their Zoom account */
  getOAuthStatus: () => apiCall('/zoom/oauth/status'),
}

export default zoomAPI
