import { useState, useEffect } from 'react'
import { Search, LayoutGrid, List, Check, X, Calendar } from 'lucide-react'
import { coursesAPI, studentsAPI, sessionsAPI, attendanceAPI } from '../../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-teal-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-pink-500',
]

function AttendanceMark({ value, onChange }) {
  const [showTip, setShowTip] = useState(false)
  const isPresent = value === 'present'

  return (
    <div className="relative inline-block font-[Manrope]">
      <button
        onClick={() => setShowTip(!showTip)}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isPresent ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'
        }`}
      >
        {isPresent ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      </button>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-20">
          <button
            onClick={() => { onChange('present'); setShowTip(false) }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 text-left"
          >
            <Check size={11} className="text-green-600 font-extrabold" /> Present
          </button>
          <button
            onClick={() => { onChange('absent'); setShowTip(false) }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 text-left"
          >
            <X size={11} className="text-red-500 font-extrabold" /> Absent
          </button>
        </div>
      )}
    </div>
  )
}

export default function AttendanceTab({ cohortId }) {
  const [coursesList, setCoursesList] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [studentsList, setStudentsList] = useState([])
  const [sessionsList, setSessionsList] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingGrid, setLoadingGrid] = useState(false)

  const [view, setView] = useState('card')
  const [search, setSearch] = useState('')

  // Load courses and students of the cohort
  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [coursesRes, studentsRes] = await Promise.all([
        coursesAPI.list({ cohort_id: cohortId }),
        studentsAPI.list({ cohort_id: cohortId })
      ])

      if (coursesRes.success) {
        setCoursesList(coursesRes.courses || [])
        if (coursesRes.courses && coursesRes.courses.length > 0) {
          setSelectedCourse(coursesRes.courses[0])
        }
      }
      if (studentsRes.success) {
        setStudentsList(studentsRes.students || [])
      }
    } catch (err) {
      toast.error('Failed to load attendance options')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cohortId) loadInitialData()
  }, [cohortId])

  // Load sessions and attendance records whenever selected course changes
  const loadGridData = async () => {
    if (!selectedCourse) return
    try {
      setLoadingGrid(true)
      const [sessionsRes, attendanceRes] = await Promise.all([
        sessionsAPI.list({ courseId: selectedCourse.id }),
        attendanceAPI.list() // retrieve all, we'll filter locally for safety/simplicity
      ])

      if (sessionsRes.success || sessionsRes.sessions) {
        setSessionsList(sessionsRes.sessions || [])
      }
      if (attendanceRes.success || attendanceRes.attendance) {
        setAttendanceRecords(attendanceRes.attendance || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingGrid(false)
    }
  }

  useEffect(() => {
    loadGridData()
  }, [selectedCourse])

  // Map student attendance for sessions: { [studentId]: { [sessionId]: 'present' | 'absent' } }
  const gridMap = {}
  studentsList.forEach(student => {
    gridMap[student.id] = {}
    sessionsList.forEach(session => {
      // Find matching attendance record
      const record = attendanceRecords.find(r => r.session_id === session.id && r.student_id === student.id)
      gridMap[student.id][session.id] = record ? record.status : 'absent' // default to absent if not marked yet
    })
  })

  const handleMark = async (studentId, sessionId, newStatus) => {
    try {
      const res = await attendanceAPI.mark({
        session_id: sessionId,
        student_id: studentId,
        status: newStatus
      })
      if (res.success || res.attendance) {
        toast.success('Attendance updated!')
        // Reload attendance records
        const attendanceRes = await attendanceAPI.list()
        if (attendanceRes.success || attendanceRes.attendance) {
          setAttendanceRecords(attendanceRes.attendance || [])
        }
      } else {
        toast.error(res.message || 'Failed to update attendance')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  const filteredStudents = studentsList.filter(s => {
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 font-[Manrope]">
      {/* Left — Course selector */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Courses</p>
        {coursesList.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold px-2">No courses linked yet</p>
        ) : (
          coursesList.map((course, idx) => (
            <button key={course.id} onClick={() => setSelectedCourse(course)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCourse?.id === course.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
              }`}>
              <div className={`w-6 h-6 rounded-md ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                {course.name[0]}
              </div>
              <p className={`text-xs font-bold truncate ${selectedCourse?.id === course.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                {course.name}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 bg-white">
        {selectedCourse ? (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-3 justify-between flex-wrap">
              <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Find Student..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400 font-semibold" />
              </div>

              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setView('card')}
                    className={`p-1.5 rounded-md transition-colors ${view === 'card' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
                    <LayoutGrid size={15} />
                  </button>
                  <button onClick={() => setView('list')}
                    className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {loadingGrid ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : sessionsList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold">No sessions scheduled for this course yet.</p>
                <p className="text-[10px] text-gray-400 mt-1">Schedule dynamic live sessions in the courses tab to mark daily attendance logs.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <p className="text-xs text-gray-400 font-semibold">No students matching the search filter</p>
              </div>
            ) : (
              <>
                {/* CARD VIEW */}
                {view === 'card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredStudents.map((student, idx) => {
                      const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
                      const studentAttendance = gridMap[student.id] || {}
                      const presentCount = Object.values(studentAttendance).filter(v => v === 'present').length
                      const totalCount = sessionsList.length

                      return (
                        <div key={student.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-7 h-7 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                              {studentName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{studentName}</p>
                              <p className="text-[9px] text-gray-400 truncate">{student.email}</p>
                            </div>
                          </div>

                          {/* Attendance marks */}
                          <div className="flex flex-wrap gap-1.5 mb-3 bg-gray-50 p-2 rounded-lg">
                            {sessionsList.map((session, sIdx) => (
                              <div key={session.id} className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-bold text-gray-400">S{sIdx + 1}</span>
                                <AttendanceMark
                                  value={studentAttendance[session.id]}
                                  onChange={(newVal) => handleMark(student.id, session.id, newVal)}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-[9px] text-gray-500 font-bold">
                              <span className="font-extrabold text-green-600">{presentCount}/{totalCount}</span> Attended
                            </p>
                            <p className="text-[9px] text-red-500 font-bold">
                              <span className="font-extrabold">{totalCount - presentCount}</span> Absences
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* LIST VIEW */}
                {view === 'list' && (
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 sticky left-0 bg-gray-50 min-w-[180px]">Student</th>
                          {sessionsList.map((s, idx) => (
                            <th key={s.id} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-3 min-w-[60px]" title={s.title}>
                              Session {idx + 1}
                              <span className="block text-[8px] text-gray-400 normal-case mt-0.5">{new Date(s.scheduled_at).toLocaleDateString()}</span>
                            </th>
                          ))}
                          <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Attended</th>
                          <th className="text-center text-[10px] font-bold text-red-400 uppercase tracking-wider px-3 py-3">Absent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {filteredStudents.map((student, idx) => {
                          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
                          const studentAttendance = gridMap[student.id] || {}
                          const presentCount = Object.values(studentAttendance).filter(v => v === 'present').length
                          const totalCount = sessionsList.length

                          return (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-2.5 sticky left-0 bg-white border-r border-gray-50">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                                    {studentName[0]}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-800">{studentName}</p>
                                    <p className="text-[9px] text-gray-400">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              {sessionsList.map(session => (
                                <td key={session.id} className="px-2 py-2.5 text-center">
                                  <div className="flex justify-center">
                                    <AttendanceMark
                                      value={studentAttendance[session.id]}
                                      onChange={(newVal) => handleMark(student.id, session.id, newVal)}
                                    />
                                  </div>
                                </td>
                              ))}
                              <td className="px-3 py-2.5 text-center">
                                <span className="text-xs font-extrabold text-green-600">{presentCount}</span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="text-xs font-extrabold text-red-500">{totalCount - presentCount}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-400 font-bold">Please select a course on the left to see attendance logs</p>
          </div>
        )}
      </div>
    </div>
  )
}