import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import AssignTrainerModal from '../../components/admin/modals/AssignTrainerModal'
import { ChevronRight, Edit2, BookOpen, Archive, Video, FileText, CheckCircle, HelpCircle, UserPlus, UserX, Users, BarChart3, Clock3 } from 'lucide-react'
import { coursesAPI, assignmentsAPI, sessionsAPI, resourcesAPI, studentsAPI, submissionsAPI, attendanceAPI } from '../../services'
import toast from 'react-hot-toast'

const isPresentRecord = (record) => ['present', 'joined', 'late'].includes((record?.status || '').toLowerCase())

const parseDurationToMinutes = (duration) => {
  if (duration === null || duration === undefined || duration === '') return 60
  if (typeof duration === 'number') return Math.max(duration, 60)

  const normalized = String(duration).toLowerCase().trim()
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(hr|hrs|hour|hours)/)
  if (hourMatch) return Math.round(Number(hourMatch[1]) * 60)

  const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes)/)
  if (minuteMatch) return Math.round(Number(minuteMatch[1]))

  const numericMatch = normalized.match(/(\d+(?:\.\d+)?)/)
  if (numericMatch) return Math.max(Math.round(Number(numericMatch[1])) * 60, 60)

  return 60
}

export default function CourseDetail() {
  const navigate = useNavigate()
  const { id: courseId } = useParams()
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [course, setCourse] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [sessions, setSessions] = useState([])
  const [resources, setResources] = useState([])
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [attendanceBySession, setAttendanceBySession] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAssignTrainer, setShowAssignTrainer] = useState(false)

  const [newName, setNewName] = useState('')

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const [cRes, aRes, sRes, rRes] = await Promise.all([
        coursesAPI.get(courseId),
        assignmentsAPI.list({ courseId }),
        sessionsAPI.list({ courseId }),
        resourcesAPI.list({ courseId })
      ])

      const courseData = cRes.course || cRes || null
      const courseAssignments = aRes.assignments || aRes || []
      const courseSessions = sRes.sessions || sRes || []
      const courseResources = rRes.resources || rRes || []

      setCourse(courseData)
      setNewName(courseData?.name || '')
      setAssignments(courseAssignments)
      setSessions(courseSessions)
      setResources(courseResources)

      let enrolledStudents = []
      if (courseData?.cohort_id) {
        const studentRes = await studentsAPI.list({ cohort_id: courseData.cohort_id })
        enrolledStudents = studentRes.success ? studentRes.users || [] : []
        setStudents(enrolledStudents)
      } else {
        setStudents([])
      }

      const submissionsResponse = await submissionsAPI.list()
      const allSubmissions = submissionsResponse.submissions || submissionsResponse || []
      const courseSubmissions = allSubmissions.filter(submission =>
        courseAssignments.some(assignment => assignment.id === submission.assignment_id)
      )
      setSubmissions(courseSubmissions)

      const attendanceEntries = await Promise.all(
        courseSessions.map(async (session) => {
          const attendanceResponse = await attendanceAPI.list({ sessionId: session.id })
          return [session.id, attendanceResponse.attendance || []]
        })
      )

      setAttendanceBySession(Object.fromEntries(attendanceEntries))
    } catch (err) {
      toast.error('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) fetchCourseData()
  }, [courseId])

  const handleUpdateName = async () => {
    if (!newName) return setEditingName(false)
    try {
      const res = await coursesAPI.update(courseId, { name: newName })
      if (res.success || res.course) {
        setCourse(prev => ({ ...prev, name: newName }))
        toast.success('Course name updated successfully!')
      } else {
        toast.error(res.message || 'Failed to update course name')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setEditingName(false)
    }
  }

  const handleToggleStatus = async () => {
    const nextStatus = course.status === 'active' ? 'suspended' : 'active'
    try {
      const res = await coursesAPI.update(courseId, { status: nextStatus })
      if (res.success || res.course) {
        setCourse(prev => ({ ...prev, status: nextStatus }))
        toast.success(`Course ${nextStatus === 'active' ? 'activated' : 'paused'} successfully!`)
      } else {
        toast.error(res.message || 'Failed to toggle status')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  const handleUnassignTrainer = async () => {
    if (!course?.trainer_id) {
      toast.error('No trainer is currently assigned to this course.')
      return
    }

    if (!window.confirm('Remove the trainer assignment from this course?')) return

    try {
      const res = await coursesAPI.assignTrainer(courseId, null)
      if (res.success) {
        toast.success('Trainer unassigned successfully.')
        fetchCourseData()
      } else {
        toast.error(res.message || 'Failed to unassign trainer')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to unassign trainer')
    }
  }

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course permanently? This will affect cohorts linked to it.')) return
    try {
      const res = await coursesAPI.remove(courseId)
      if (res.success) {
        toast.success('Course deleted successfully!')
        navigate('/admin/courses')
      } else {
        toast.error(res.message || 'Failed to delete course')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  const formatSessionDate = (value) => {
    const date = new Date(value)
    return new Intl.DateTimeFormat('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const getSessionStatus = (session) => {
    const start = new Date(session.scheduled_at)
    const durationMinutes = parseDurationToMinutes(session.duration)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    const now = new Date()

    if (now > end) return 'Ended'
    if (now >= start && now <= end) return 'Live'
    return 'Upcoming'
  }

  const getSessionSourceLabel = (session) => {
    if (session.zoom_link) return 'Manual link'
    if (session.zoom_meeting_id) return 'Generated Zoom ID'
    return 'No link'
  }

  const handleJoinSession = (session) => {
    const status = getSessionStatus(session)
    if (status === 'Ended') {
      toast('This session has already ended.', { icon: 'ℹ️' })
      return
    }

    const meetingUrl = session.zoom_link || (session.zoom_meeting_id ? `https://zoom.us/j/${session.zoom_meeting_id}` : null)
    if (!meetingUrl) {
      toast.error('No active Zoom link is available for this session.')
      return
    }

    window.open(meetingUrl, '_blank', 'noopener,noreferrer')
  }

  const sessionStats = sessions.map((session) => {
    const attendanceRecords = attendanceBySession[session.id] || []
    const presentCount = attendanceRecords.filter(record => isPresentRecord(record)).length
    return {
      ...session,
      status: getSessionStatus(session),
      attendanceCount: presentCount,
      attendanceTotal: attendanceRecords.length,
      sourceLabel: getSessionSourceLabel(session)
    }
  })

  const assignmentStats = assignments.map((assignment) => {
    const relatedSubmissions = submissions.filter(submission => submission.assignment_id === assignment.id)
    const gradedCount = relatedSubmissions.filter(submission => submission.status === 'graded').length
    const submittedCount = relatedSubmissions.length
    const uniqueStudents = new Set(relatedSubmissions.map(submission => submission.student_id).filter(Boolean))
    const submissionRate = students.length > 0 ? Math.round((uniqueStudents.size / students.length) * 100) : 0

    return {
      ...assignment,
      relatedSubmissions,
      gradedCount,
      submittedCount,
      uniqueStudents: uniqueStudents.size,
      submissionRate
    }
  })

  const totalStudents = students.length
  const totalSubmissions = submissions.length
  const overallEngagement = totalStudents > 0 ? Math.round((new Set(submissions.map(submission => submission.student_id).filter(Boolean)).size / totalStudents) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <Sidebar collapsed={collapsed} activePath="/admin/courses" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} showCohortSelector={false} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <Sidebar collapsed={collapsed} activePath="/admin/courses" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} showCohortSelector={false} />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <HelpCircle size={48} className="text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">Course Not Found</p>
            <button onClick={() => navigate('/admin/courses')} className="text-xs text-[#2563EB] font-black hover:underline mt-2">Back to Courses</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} activePath="/admin/courses" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} showCohortSelector={false} />

        <div className="flex-1 overflow-y-auto">
          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <button onClick={() => navigate('/admin/courses')} className="hover:text-[#2563EB] transition-colors">
                Courses
              </button>
              <ChevronRight size={13} />
              <span className="text-gray-800 font-semibold">{course.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAssignTrainer(true)} className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                <UserPlus size={14} /> Assign Lead Instructor
              </button>
              {course.trainer_id && (
                <button onClick={handleUnassignTrainer} className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <UserX size={14} /> Unassign Trainer
                </button>
              )}
              <button onClick={handleToggleStatus} className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                <Archive size={14} /> {course.status === 'active' ? 'Suspend Course' : 'Resume Course'}
              </button>
              <button onClick={handleDeleteCourse} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-100 transition-colors">
                Delete Course Permanently
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-0 h-full">
            {/* Main content */}
            <div className="flex-1 p-6 space-y-5 min-w-0">
              {/* Course banner */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', height: '120px' }} />
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {editingName ? (
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={handleUpdateName}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateName() }}
                        autoFocus
                        className="text-xl font-bold text-gray-900 border-b border-[#2563EB] outline-none bg-transparent"
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-gray-900">{course.name}</h1>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      course.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {course.status}
                    </span>
                    <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-[#2563EB] transition-colors ml-1">
                      <Edit2 size={13} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {course.description || 'An official curriculum detail has not been provided for this learning module.'}
                  </p>

                  <div className="flex items-center gap-5 text-xs text-gray-500 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-gray-400" />
                      <span>Duration: {course.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-gray-400" />
                      <span>Category: {course.category || 'General'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                {[
                  { label: 'Enrolled learners', value: totalStudents, icon: Users, accent: 'bg-blue-50 text-[#2563EB]' },
                  { label: 'Assignments', value: assignments.length, icon: FileText, accent: 'bg-purple-50 text-purple-600' },
                  { label: 'Live classes', value: sessions.length, icon: Video, accent: 'bg-cyan-50 text-cyan-600' },
                  { label: 'Study Resources', value: resources.length, icon: BookOpen, accent: 'bg-amber-50 text-amber-600' },
                  { label: 'Submission rate', value: `${overallEngagement}%`, icon: BarChart3, accent: 'bg-green-50 text-green-600' },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${accent}`}>
                      <Icon size={15} />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-bold">{label}</p>
                  </div>
                ))}
              </div>

              {/* Section: Session schedule & Attendance */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Session schedule & attendance ({sessionStats.length})</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Session completion, Zoom source, and attendance capture from recorded logs.</p>
                  </div>
                </div>

                {sessionStats.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 font-semibold">No live classes scheduled for this course yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionStats.map((session, idx) => {
                      const statusTone = session.status === 'Live'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : session.status === 'Ended'
                          ? 'bg-gray-100 text-gray-500 border-gray-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'

                      const sourceTone = session.zoom_link
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : session.zoom_meeting_id
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'

                      return (
                        <div key={session.id} className="rounded-xl border border-gray-100 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563EB] text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800">{session.title}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusTone}`}>{session.status}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sourceTone}`}>{session.sourceLabel}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-semibold mt-2">{formatSessionDate(session.scheduled_at)} · {session.duration || '1 hour'} · {session.trainer ? `${session.trainer.first_name || ''} ${session.trainer.last_name || ''}`.trim() : 'Unassigned trainer'}</p>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Attendance</p>
                              <p className="text-sm font-bold text-gray-800 mt-1">{session.attendanceCount}/{Math.max(totalStudents, 1)} attended</p>
                              <p className="text-[10px] text-gray-400 mt-1">{session.attendanceTotal || 0} record{session.attendanceTotal === 1 ? '' : 's'} logged</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                              <Clock3 size={12} className="text-gray-400" />
                              <span>{session.duration || '1 hour'} planned duration</span>
                            </div>

                            {session.status === 'Ended' ? (
                              <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md font-bold">
                                Session ended
                              </span>
                            ) : (
                              <button
                                onClick={() => handleJoinSession(session)}
                                className="text-[10px] bg-[#2563EB] text-white px-3 py-1.5 rounded-md font-bold hover:bg-blue-700 transition-colors"
                              >
                                Join live session
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Section: Assignments, submissions & engagement */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Assignments, submissions & engagement ({assignmentStats.length})</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Submission volume, grading progress, and learner participation by assignment.</p>
                  </div>
                </div>

                {assignmentStats.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 font-semibold">No assignments have been created for this course yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignmentStats.map((assignment) => (
                      <div key={assignment.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{assignment.title}</p>
                            <p className="text-[10px] text-gray-500 font-semibold mt-1">Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'} · {assignment.total_points || 0} points</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Learner engagement</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">{assignment.submissionRate}%</p>
                            <p className="text-[10px] text-gray-400">{assignment.uniqueStudents}/{Math.max(totalStudents, 1)} learners submitted</p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-gray-50 p-2 text-center">
                            <p className="text-lg font-bold text-gray-800">{assignment.relatedSubmissions.length}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Submissions</p>
                          </div>
                          <div className="rounded-lg bg-green-50 p-2 text-center">
                            <p className="text-lg font-bold text-green-700">{assignment.gradedCount}</p>
                            <p className="text-[10px] text-green-700 font-bold uppercase">Graded</p>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-2 text-center">
                            <p className="text-lg font-bold text-[#2563EB]">{assignment.uniqueStudents}</p>
                            <p className="text-[10px] text-[#2563EB] font-bold uppercase">Learners</p>
                          </div>
                        </div>

                        {assignment.relatedSubmissions.length === 0 ? (
                          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[10px] text-gray-500 font-semibold">
                            No submissions recorded yet for this assignment.
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {assignment.relatedSubmissions.slice(0, 5).map((submission) => (
                              <div key={submission.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{submission.student?.first_name || ''} {submission.student?.last_name || ''}</p>
                                  <p className="text-[10px] text-gray-500">{submission.status || 'submitted'} · {submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/${assignment.total_points || 100}` : 'Not graded yet'}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${submission.status === 'graded' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {submission.status || 'pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel — Resources */}
            <div className="w-full lg:w-[260px] lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-5 space-y-4">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Learning Materials ({resources.length})</h3>

              {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">No resources yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.map((res) => (
                    <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                        <FileText size={11} className="text-[#2563EB]" />
                      </div>
                      <p className="text-xs font-bold text-gray-700 truncate hover:text-[#2563EB]">{res.name}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AssignTrainerModal isOpen={showAssignTrainer} onClose={() => setShowAssignTrainer(false)} onSuccess={fetchCourseData} />
    </div>
  )
}
