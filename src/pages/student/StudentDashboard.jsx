import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { BookOpen, Video, ClipboardList, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cohortsAPI, coursesAPI, assignmentsAPI, submissionsAPI } from '../../services'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [cohorts, setCohorts] = useState([])
  const [courses, setCourses] = useState([])
  const [assignmentsCount, setAssignmentsCount] = useState(0)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [cohortsRes, coursesRes, submissionsRes] = await Promise.all([
          cohortsAPI.list(),
          coursesAPI.list(),
          submissionsAPI.list(user ? { studentId: user.id } : {})
        ])
        
        const allCohorts = cohortsRes.cohorts || cohortsRes || []
        const allCourses = coursesRes.courses || coursesRes || []
        
        setCohorts(allCohorts)
        setCourses(allCourses)

        if (submissionsRes.success || submissionsRes.submissions) {
          setSubmissions(submissionsRes.submissions || [])
        }

        // Gather all assignments count across courses
        let totalAsn = 0
        for (const course of allCourses) {
          const res = await assignmentsAPI.list({ courseId: course.id })
          if (res.success || res.assignments) {
            totalAsn += (res.assignments || []).length
          }
        }
        setAssignmentsCount(totalAsn)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load student dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const studentName = `${user?.first_name || ''} ${user?.last_name || 'Student'}`.trim()
  const gradedSubmissions = submissions.filter(s => s.grade !== null)
  const avgGrade = gradedSubmissions.length > 0 
    ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + (parseFloat(curr.grade) || 0), 0) / gradedSubmissions.length)
    : null

  const gradeLetter = avgGrade === null ? 'N/A' : avgGrade >= 90 ? 'A' : avgGrade >= 80 ? 'B' : avgGrade >= 70 ? 'C' : 'D'

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg, #2563EB, #6366f1)' }} className="rounded-2xl p-6 text-white flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-lg font-bold mb-1">Welcome back, {user?.first_name || 'Learner'} 👋</h1>
              <p className="text-xs text-white/80">You're making great progress. Continue your learning journey below.</p>
              <p className="text-[10px] text-white/60 mt-1.5 font-bold uppercase tracking-wider">
                {cohorts.length > 0 ? `${cohorts[0].name} · ` : ''}Student Learning Portal
              </p>
            </div>
            <button onClick={() => navigate('/student/course')}
              className="flex items-center gap-2 bg-white text-[#2563EB] text-xs font-bold rounded-xl px-5 py-2.5 hover:bg-blue-50 transition flex-shrink-0 shadow-sm">
              <BookOpen size={14} /> View My Course
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Enrolled Programme', value: loading ? '-' : courses.length, icon: BookOpen, bg: 'bg-blue-50', color: 'text-[#2563EB]', sub: 'Current learning programme' },
              { label: 'Cohort', value: loading ? '-' : cohorts.length, icon: Video, bg: 'bg-green-50', color: 'text-green-600', sub: 'Active cohort group' },
              { label: 'Assignments', value: loading ? '-' : `${submissions.length}/${assignmentsCount}`, icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-600', sub: 'Submitted vs total' },
              { label: 'Grade Average', value: loading ? '-' : gradeLetter, icon: Star, bg: 'bg-purple-50', color: 'text-purple-600', sub: avgGrade !== null ? `${avgGrade}% overall` : 'Pending assessment' },
            ].map(({ label, value, icon: Icon, bg, color, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-bold">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">{sub}</p>
              </div>
            ))}
          </div>

          {/* Main workspace info */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* My Courses */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">My Learning Programme</h2>
                <button onClick={() => navigate('/student/course')}
                  className="text-xs text-[#2563EB] font-bold hover:underline">
                  Go to Course →
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#2563EB]"></div>
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-xs text-gray-400 p-5 text-center font-bold">You have not been enrolled in a course yet. Please contact your administrator.</p>
                ) : (
                  courses.map((course, idx) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 truncate">{course.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 capitalize">{course.category || 'General Training'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 uppercase">
                          {course.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Cohort */}
            <div className="w-full lg:w-[280px] lg:flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">My Cohort</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#2563EB]"></div>
                  </div>
                ) : cohorts.length === 0 ? (
                  <p className="text-xs text-gray-400 p-5 text-center font-bold">You have not been assigned to a cohort yet.</p>
                ) : (
                  cohorts.map((cohort, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{cohort.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5 capitalize">Status: {cohort.status || 'Active'}</p>
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