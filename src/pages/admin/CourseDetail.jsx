import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import AssignTrainerModal from '../../components/admin/modals/AssignTrainerModal'
import { ChevronRight, Edit2, BookOpen, Archive, Video, FileText, CheckCircle, HelpCircle, UserPlus } from 'lucide-react'
import { coursesAPI, assignmentsAPI, sessionsAPI, resourcesAPI } from '../../services'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const navigate = useNavigate()
  const { id: courseId } = useParams()
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [course, setCourse] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [sessions, setSessions] = useState([])
  const [resources, setResources] = useState([])
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

      if (cRes.success || cRes.course) {
        const courseData = cRes.course || cRes
        setCourse(courseData)
        setNewName(courseData.name)
      }
      if (aRes.success || aRes.assignments) {
        setAssignments(aRes.assignments || [])
      }
      if (sRes.success || sRes.sessions) {
        setSessions(sRes.sessions || [])
      }
      if (rRes.success || rRes.resources) {
        setResources(rRes.resources || [])
      }
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

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <Sidebar collapsed={collapsed} activePath="/admin/courses" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
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
          <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
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
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

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
                <UserPlus size={14} /> Assign Trainer
              </button>
              <button onClick={handleToggleStatus} className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                <Archive size={14} /> {course.status === 'active' ? 'Pause Course' : 'Activate Course'}
              </button>
              <button onClick={handleDeleteCourse} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-100 transition-colors">
                Delete Course
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
                    {course.description || 'No description provided for this course yet.'}
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Assignments', value: assignments.length, icon: FileText },
                  { label: 'Live classes', value: sessions.length, icon: Video },
                  { label: 'Study Resources', value: resources.length, icon: BookOpen },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Icon size={15} className="text-[#2563EB]" />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-bold">{label}</p>
                  </div>
                ))}
              </div>

              {/* Section: Syllabus / Modules */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Course Modules / Lessons ({sessions.length})</h2>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 font-semibold">No live classes scheduled for this course yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sessions.map((session, idx) => (
                      <div key={session.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563EB] text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{session.title}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{new Date(session.scheduled_at).toLocaleString()} · {session.duration || '1 hour'}</p>
                          </div>
                        </div>
                        {session.zoom_link && (
                          <a href={session.zoom_link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-[#2563EB] border border-blue-100 px-2 py-1 rounded-md font-bold hover:bg-blue-100">
                            Join Zoom
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel — Resources */}
            <div className="w-full lg:w-[260px] lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-5 space-y-4">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Study Resources ({resources.length})</h3>

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
