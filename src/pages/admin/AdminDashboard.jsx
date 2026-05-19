import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import StatCards from '../../components/admin/StatCards'
import CoursesTable from '../../components/admin/CoursesTable'
import AttendanceTable from '../../components/admin/AttendanceTable'
import RightPanel from '../../components/admin/RightPanel'
import { coursesAPI, studentsAPI, sessionsAPI, attendanceAPI } from '../../services'

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesRes, studentsRes, sessionsRes, attendanceRes] = await Promise.all([
          coursesAPI.list().catch(() => ({ courses: [] })),
          studentsAPI.list().catch(() => ({ users: [] })),
          sessionsAPI.list().catch(() => ({ sessions: [] })),
          attendanceAPI.list().catch(() => ({ attendance: [] }))
        ])

        setCourses(coursesRes.courses || coursesRes || [])
        setStudents(studentsRes.users || studentsRes || [])
        setSessions(sessionsRes.sessions || sessionsRes || [])
        setAttendance(attendanceRes.attendance || attendanceRes || [])
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

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
                <CoursesTable courses={courses} />
                <AttendanceTable courses={courses} attendanceRecords={attendance} />
              </div>

              {/* Right panel — full width on mobile, fixed width on xl */}
              <div className="w-full xl:w-[240px] xl:flex-shrink-0">
                <RightPanel sessions={sessions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}