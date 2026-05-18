import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Users, ClipboardList, BookOpen, Video, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cohortsAPI, coursesAPI, submissionsAPI, sessionsAPI, studentsAPI } from '../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-orange-400',
  'bg-red-400',
  'bg-purple-500',
]

export default function TrainerDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [cohorts, setCohorts] = useState([])
  const [courses, setCourses] = useState([])
  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [totalStudentsCount, setTotalStudentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [cohortsRes, coursesRes, submissionsRes, sessionsRes, studentsRes] = await Promise.all([
        cohortsAPI.list(),
        coursesAPI.list(),
        submissionsAPI.list({ status: 'pending' }),
        sessionsAPI.list(),
        studentsAPI.list()
      ])

      if (cohortsRes.success || cohortsRes.cohorts) {
        setCohorts(cohortsRes.cohorts || cohortsRes || [])
      }
      if (coursesRes.success || coursesRes.courses) {
        setCourses(coursesRes.courses || coursesRes || [])
      }
      if (submissionsRes.success || submissionsRes.submissions) {
        setPendingSubmissions(submissionsRes.submissions || [])
      }
      if (sessionsRes.success || sessionsRes.sessions) {
        const list = sessionsRes.sessions || []
        // Filter for upcoming sessions in future
        const now = new Date()
        const upcoming = list.filter(s => new Date(s.scheduled_at) > now)
        setUpcomingSessions(upcoming)
      }
      if (studentsRes.success || studentsRes.students) {
        setTotalStudentsCount((studentsRes.students || []).length)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load trainer dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const trainerName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Trainer'

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Welcome banner */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Welcome Back, {trainerName} 👋</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Here is your live training center overview and tasks for today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/trainer/assignments')}
                className="bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition">
                Start grading
              </button>
              <button
                onClick={() => navigate('/trainer/sessions')}
                className="border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                View sessions
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Cohorts', value: loading ? '-' : cohorts.length, icon: '🎓', bg: 'bg-blue-50' },
              { label: 'Assigned Courses', value: loading ? '-' : courses.length, icon: '📚', bg: 'bg-green-50' },
              { label: 'Total Students Enrolled', value: loading ? '-' : totalStudentsCount, icon: '👥', bg: 'bg-orange-50' },
              { label: 'Pending Submissions', value: loading ? '-' : pendingSubmissions.length, icon: '📋', bg: 'bg-purple-50' },
            ].map(({ label, value, icon, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-bold">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Main content split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Grading Queue */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 flex flex-col min-w-0">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Grading Queue</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Pending student submissions waiting for your feedback</p>
                </div>
                <button onClick={() => navigate('/trainer/assignments')} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5">
                  View all <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-gray-50 flex-1 min-h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
                  </div>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ClipboardList className="text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-bold">Awesome! Grading queue is clear.</p>
                  </div>
                ) : (
                  pendingSubmissions.slice(0, 5).map((sub, idx) => {
                    const studentName = sub.student ? `${sub.student.first_name || ''} ${sub.student.last_name || ''}`.trim() : 'Anonymous Student'
                    const assignmentTitle = sub.assignment ? sub.assignment.title : 'General Assignment'
                    const courseName = sub.assignment?.course ? sub.assignment.course.name : 'Class Course'

                    return (
                      <div key={sub.id} onClick={() => navigate('/trainer/assignments')} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {studentName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{studentName}</p>
                            <p className="text-[10px] text-gray-400 font-semibold truncate">{assignmentTitle} · {courseName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right: Upcoming Sessions */}
            <div className="bg-white rounded-xl border border-gray-100 flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Upcoming Live Classes</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Scheduled class meetings</p>
                </div>
                <button onClick={() => navigate('/trainer/sessions')} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5">
                  All <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-gray-50 flex-1 min-h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Video className="text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-bold">No upcoming classes scheduled</p>
                  </div>
                ) : (
                  upcomingSessions.slice(0, 5).map((session, idx) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{session.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{session.course?.name || 'Class Course'}</p>
                        </div>
                        <span className="bg-blue-50 text-[#2563EB] border border-blue-100 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                          Upcoming
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-2">
                        <span>{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}