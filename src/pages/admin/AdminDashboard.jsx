import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import StatCards from '../../components/admin/StatCards'
import CoursesTable from '../../components/admin/CoursesTable'
import AttendanceTable from '../../components/admin/AttendanceTable'
import RightPanel from '../../components/admin/RightPanel'
import { coursesAPI, studentsAPI, trainersAPI, sessionsAPI, attendanceAPI } from '../../services'

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [trainers, setTrainers] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, studentsRes, trainersRes, sessionsRes, attendanceRes] = await Promise.all([
        coursesAPI.list().catch(() => ({ courses: [] })),
        studentsAPI.list().catch(() => ({ users: [] })),
        trainersAPI.list().catch(() => ({ users: [] })),
        sessionsAPI.list().catch(() => ({ sessions: [] })),
        attendanceAPI.list().catch(() => ({ attendance: [] }))
      ])

      setCourses(coursesRes.courses || coursesRes || [])
      setStudents(studentsRes.users || studentsRes || [])
      setTrainers(trainersRes.users || trainersRes || [])
      setSessions(sessionsRes.sessions || sessionsRes || [])
      setAttendance(attendanceRes.attendance || attendanceRes || [])
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 20000)
    return () => clearInterval(intervalId)
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredCourses = normalizedQuery
    ? courses.filter((course) => {
        const title = (course.name || '').toLowerCase()
        const trainer = (course.trainer?.first_name || '' + course.trainer?.last_name || '').toLowerCase()
        return title.includes(normalizedQuery) || trainer.includes(normalizedQuery)
      })
    : courses

  const filteredSessions = normalizedQuery
    ? sessions.filter((session) => {
        const title = (session.title || '').toLowerCase()
        const courseName = (session.course?.name || '').toLowerCase()
        return title.includes(normalizedQuery) || courseName.includes(normalizedQuery)
      })
    : sessions

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
          searchPlaceholder="Search courses, sessions or trainers"
          showCohortSelector={false}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-5">
              {/* Main content — full width on mobile */}
              <div className="flex-1 min-w-0 space-y-5">
                <StatCards coursesCount={courses.length} studentsCount={students.length} attendanceRecords={attendance} />
                <CoursesTable courses={filteredCourses} />
                <AttendanceTable courses={filteredCourses} attendanceRecords={attendance} />
              </div>

              {/* Right panel — full width on mobile, fixed width on xl */}
              <div className="w-full xl:w-[240px] xl:flex-shrink-0">
                <RightPanel sessions={filteredSessions} students={students} trainers={trainers} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}