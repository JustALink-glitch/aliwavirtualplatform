import apiCall from './api'

/**
 * Frontend Service for Zoom Meeting SDK Integrations
 */
const zoomAPI = {
  /**
   * Fetches the JWT signature for the Zoom SDK from the backend.
   *
   * @param {string|number} meetingNumber
   * @param {number} role 0 = student/attendee, 1 = trainer/host
   */
  getSDKSignature: (meetingNumber, role = 0) => {
    return apiCall(`/zoom/signature?meetingNumber=${meetingNumber}&role=${role}`)
  },

  /**
   * Fetches the Zoom Access Token (ZAK) or OBF token for the teacher.
   *
   * @param {string} teacherUserId User ID of the session's teacher/trainer
   */
  getOBFToken: (teacherUserId) => {
    return apiCall(`/zoom/obf-token?teacherUserId=${teacherUserId}`)
  }
}

export default zoomAPI
