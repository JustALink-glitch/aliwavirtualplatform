import { useState, useEffect } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { BookOpen, Video, FileText, Link as LinkIcon, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { coursesAPI, assignmentsAPI, resourcesAPI, submissionsAPI } from '../../services'
import toast from 'react-hot-toast'

const tabs = ['Overview', 'Resources', 'Assignments']

const typeStyles = {
  pdf: { bg: 'bg-red-50', color: 'text-red-500', icon: FileText },
  video: { bg: 'bg-purple-50', color: 'text-purple-500', icon: Video },
  link: { bg: 'bg-blue-50', color: 'text-blue-500', icon: LinkIcon },
}

const assignmentStyles = {
  Graded: 'bg-green-50 text-green-700 border border-green-200',
  Submitted: 'bg-amber-50 text-amber-600 border border-amber-200',
  Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
  Overdue: 'bg-red-50 text-red-600 border border-red-200',
}

export default function StudentCoursePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  const [assignments, setAssignments] = useState([])
  const [resources, setResources] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const { user } = useAuth()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await coursesAPI.list()
      if (res.success || res.courses) {
        const list = res.courses || res || []
        setCourses(list)
        if (list.length > 0) {
          setSelectedCourse(list[0])
        }
      }
    } catch (err) {
      toast.error('Failed to load enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseDetails = async () => {
    if (!selectedCourse || !user) return
    try {
      setLoadingDetails(true)
      const [assignmentsRes, resourcesRes, submissionsRes] = await Promise.all([
        assignmentsAPI.list({ courseId: selectedCourse.id }),
        resourcesAPI.list({ courseId: selectedCourse.id }),
        submissionsAPI.list({ studentId: user.id })
      ])

      const listSubs = submissionsRes.submissions || []

      if (resourcesRes.success || resourcesRes.resources) {
        setResources(resourcesRes.resources || [])
      }

      if (assignmentsRes.success || assignmentsRes.assignments) {
        const listAsn = (assignmentsRes.assignments || []).map(a => {
          const matchSub = listSubs.find(s => s.assignment_id === a.id)
          let status = 'Pending'
          if (matchSub) {
            status = matchSub.grade !== null ? 'Graded' : 'Submitted'
          } else if (a.due_date && new Date(a.due_date) < new Date()) {
            status = 'Overdue'
          }
          return {
            ...a,
            status,
            submission: matchSub
          }
        })
        setAssignments(listAsn)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchCourseDetails()
  }, [selectedCourse, user])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <StudentSidebar collapsed={collapsed} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedCourse) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <StudentSidebar collapsed={collapsed} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen size={48} className="text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-700">No Enrolled Courses Found</p>
          </div>
        </div>
      </div>
    )
  }

  const completedCount = assignments.filter(a => a.status === 'Graded' || a.status === 'Submitted').length
  const progressPercent = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 100

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header course switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Select Course:</label>
              <select
                value={selectedCourse.id}
                onChange={e => setSelectedCourse(courses.find(c => c.id === e.target.value))}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#2563EB]"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Course banner */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div style={{ background: 'linear-gradient(135deg, #60a5fa, #6366f1)', height: '110px' }} />
            <div className="bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-gray-900">{selectedCourse.name}</h1>
                    <span className="bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-green-200 uppercase">
                      {selectedCourse.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedCourse.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold">
                    <span>📚 Cohort: {selectedCourse.cohort_id || 'Global'}</span>
                    <span>📅 Timeline: {selectedCourse.duration || 'Flexible'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Work Progress', value: `${progressPercent}%`, icon: BookOpen, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Completed Tasks', value: `${completedCount}/${assignments.length}`, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Total Course Materials', value: resources.length, icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Timeline Duration', value: selectedCourse.duration || 'Ongoing', icon: Video, bg: 'bg-purple-50', color: 'text-purple-600' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={15} className={color} />
                </div>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-gray-100 px-4 bg-gray-50/50">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
                </div>
              ) : (
                <>
                  {/* OVERVIEW */}
                  {activeTab === 'Overview' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Category</p>
                        <p className="text-xs font-bold text-gray-700 capitalize">{selectedCourse.category || 'General study'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[10px] text-gray-400 mb-1 font-black uppercase tracking-wider">Duration</p>
                          <p className="text-xs font-bold text-gray-800">{selectedCourse.duration || 'Flexible timeline'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-[10px] text-gray-400 mb-1 font-black uppercase tracking-wider">Cohort Status</p>
                          <p className="text-xs font-bold text-green-600 uppercase">ACTIVE ENROLLMENT</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RESOURCES */}
                  {activeTab === 'Resources' && (
                    resources.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6 font-bold">No study materials attached to this course yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Resource', 'Type', 'Web Link'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {resources.map(r => {
                              const TypeStyle = typeStyles[r.file_type?.toLowerCase()] || typeStyles.link
                              const TypeIcon = TypeStyle.icon
                              return (
                                <tr key={r.id} className="hover:bg-gray-50 transition">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg ${TypeStyle.bg} flex items-center justify-center flex-shrink-0`}>
                                        <TypeIcon size={13} className={TypeStyle.color} />
                                      </div>
                                      <p className="text-xs font-bold text-gray-800">{r.name}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${TypeStyle.bg} ${TypeStyle.color}`}>
                                      {r.file_type || 'link'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] font-bold hover:underline truncate max-w-[250px] inline-block">
                                      {r.url}
                                    </a>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {/* ASSIGNMENTS */}
                  {activeTab === 'Assignments' && (
                    assignments.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6 font-bold">No assignments scheduled for this course yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Assignment Name', 'Due date', 'Points', 'Status'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {assignments.map(a => (
                              <tr key={a.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3">
                                  <p className="text-xs font-bold text-gray-800">{a.title}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[200px]">{a.description}</p>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-650 font-semibold">
                                  {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Flexible'}
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-gray-700">{a.total_points} pts</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${assignmentStyles[a.status]}`}>
                                    {a.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}