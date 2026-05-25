import { useState, useEffect, useRef } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Users, Video, ClipboardList, BookOpen, Plus, Upload, X, FileText, Link as LinkIcon } from 'lucide-react'
import { coursesAPI, studentsAPI, assignmentsAPI, resourcesAPI, sessionsAPI } from '../../services'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const tabs = ['Overview', 'Students', 'Assignments', 'Resources', 'Sessions']

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

function AddAssignmentModal({ courseId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', due_date: '', description: '', total_points: '100' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Please enter a title')
    try {
      setSubmitting(true)
      const res = await assignmentsAPI.create({
        title: form.title,
        description: form.description,
        total_points: parseInt(form.total_points) || 100,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        course_id: courseId
      })
      if (res.success || res.assignment) {
        toast.success('Assignment added successfully!')
        if (onCreated) onCreated()
        onClose()
      } else {
        toast.error(res.message || 'Failed to add assignment')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Add Assignment</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">TITLE *</label>
          <input name="title" required value={form.title} onChange={handle} placeholder="e.g. Hero Section Design"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">DUE DATE</label>
            <input type="date" name="due_date" value={form.due_date} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">TOTAL POINTS</label>
            <input name="total_points" value={form.total_points} onChange={handle} placeholder="e.g. 100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-bold text-gray-700" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">DESCRIPTION</label>
          <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Assignment instructions..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none font-semibold text-gray-700" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2 hover:bg-blue-700 transition-colors">
            {submitting ? 'Adding...' : 'Add Assignment'}
          </button>
        </div>
      </form>
    </div>
  )
}

function UploadResourceModal({ courseId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', url: '', file_type: 'link' })
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.url) return toast.error('Please fill in all fields')
    try {
      setSubmitting(true)
      const res = await resourcesAPI.create({
        name: form.name,
        url: form.url,
        file_type: form.file_type,
        course_id: courseId
      })
      if (res.success || res.resource) {
        toast.success('Study resource uploaded successfully!')
        if (onCreated) onCreated()
        onClose()
      } else {
        toast.error(res.message || 'Failed to add resource')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setForm(prev => ({
        ...prev,
        name: prev.name || file.name,
        // In a real scenario, we'd upload to storage and get a URL.
        // For now, show the file name and instruct trainer to paste URL.
        file_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'link'
      }))
      toast('File detected: paste the hosted URL below to complete upload.', { icon: '📎' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Add Study Resource</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['link', 'pdf', 'video'].map(t => (
            <button type="button" key={t} onClick={() => setForm(prev => ({ ...prev, file_type: t }))}
              className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all capitalize ${
                form.file_type === t ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Drag-and-drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleDrop({ preventDefault: ()=>{}, dataTransfer: e.target })} />
          <Upload size={22} className={`mx-auto mb-2 ${dragActive ? 'text-[#2563EB]' : 'text-gray-300'}`} />
          <p className="text-xs font-bold text-gray-500">Drag & drop a file here</p>
          <p className="text-[10px] text-gray-400 mt-0.5">or click to browse — PDF, Video, Docs</p>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">RESOURCE NAME *</label>
          <input name="name" required value={form.name} onChange={handle} placeholder="e.g. Figma Design Kit"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">RESOURCE URL *</label>
          <input name="url" required value={form.url} onChange={handle} placeholder="https://..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2 hover:bg-blue-700 transition-colors">
            {submitting ? 'Saving...' : 'Add Resource'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TrainerCoursePage() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [resources, setResources] = useState([])
  const [sessions, setSessions] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [showUploadResource, setShowUploadResource] = useState(false)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // Filter courses by this trainer's ID so they only see their assigned courses
      const params = user?.id ? { trainer_id: user.id } : {}
      const res = await coursesAPI.list(params)
      if (res.success || res.courses) {
        const list = res.courses || res || []
        setCourses(list)
        if (list.length > 0) {
          setSelectedCourse(list[0])
        }
      }
    } catch (err) {
      toast.error('Failed to load your assigned courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseDetails = async () => {
    if (!selectedCourse) return
    try {
      setLoadingDetails(true)
      const [studentsRes, assignmentsRes, resourcesRes, sessionsRes] = await Promise.all([
        studentsAPI.list(selectedCourse.cohort_id ? { cohort_id: selectedCourse.cohort_id } : {}),
        assignmentsAPI.list({ courseId: selectedCourse.id }),
        resourcesAPI.list({ courseId: selectedCourse.id }),
        sessionsAPI.list({ courseId: selectedCourse.id })
      ])

      if (studentsRes.success || studentsRes.students || studentsRes.users) {
        setStudents(studentsRes.students || studentsRes.users || [])
      }
      if (assignmentsRes.success || assignmentsRes.assignments) {
        setAssignments(assignmentsRes.assignments || [])
      }
      if (resourcesRes.success || resourcesRes.resources) {
        setResources(resourcesRes.resources || [])
      }
      if (sessionsRes.success || sessionsRes.sessions) {
        setSessions(sessionsRes.sessions || [])
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
  }, [selectedCourse])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] font-[Manrope] overflow-hidden">
        <TrainerSidebar collapsed={collapsed} activePath="/trainer/course" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
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
        <TrainerSidebar collapsed={collapsed} activePath="/trainer/course" />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen size={48} className="text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">No Courses Assigned Yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} activePath="/trainer/course" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Selector header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-gray-500 uppercase">Select Course:</label>
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-gray-900">{selectedCourse.name}</h1>
                    <span className="bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-green-200 uppercase">
                      {selectedCourse.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedCourse.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold">
                    <span>👥 {students.length} Students</span>
                    <span>📚 Cohort: {selectedCourse.cohort_id || 'Global'}</span>
                    <span>📅 Duration: {selectedCourse.duration || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowUploadResource(true)}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2 hover:bg-gray-50 bg-white transition shadow-sm">
                    <Upload size={13} /> Upload Resource
                  </button>
                  <button onClick={() => setShowAddAssignment(true)}
                    className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-3 py-2 hover:bg-blue-700 transition shadow-sm">
                    <Plus size={13} /> Add Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students Roster', value: students.length, icon: Users, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Live Classes', value: sessions.length, icon: Video, bg: 'bg-purple-50', color: 'text-purple-600' },
              { label: 'Assignments Created', value: assignments.length, icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Study Resources', value: resources.length, icon: BookOpen, bg: 'bg-green-50', color: 'text-green-600' },
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

          {/* Tabs Workspace */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-gray-100 px-4 overflow-x-auto bg-gray-50/50">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {loadingDetails ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
                </div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === 'Overview' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Category</p>
                        <p className="text-sm font-semibold text-gray-600 capitalize">{selectedCourse.category || 'General'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Duration</p>
                          <p className="text-sm font-bold text-gray-800">{selectedCourse.duration || 'Flexible timeline'}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Status</p>
                          <p className="text-sm font-bold text-gray-800 capitalize">{selectedCourse.status}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STUDENTS TAB */}
                  {activeTab === 'Students' && (
                    students.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No students enrolled in this cohort yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Student Name', 'Email', 'Role', 'Status'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {students.map((s, idx) => {
                              const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student'
                              return (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[10px] font-bold`}>
                                        {sName[0]}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-800">{sName}</p>
                                        <p className="text-[9px] text-gray-400 font-semibold">{s.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{s.email}</td>
                                  <td className="px-4 py-3 text-xs text-gray-500 font-bold capitalize">{s.role}</td>
                                  <td className="px-4 py-3">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-100 uppercase">
                                      {s.status || 'Active'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {/* ASSIGNMENTS TAB */}
                  {activeTab === 'Assignments' && (
                    assignments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-gray-400 font-bold mb-2">No assignments added yet</p>
                        <button onClick={() => setShowAddAssignment(true)} className="text-xs font-black text-[#2563EB] hover:underline">
                          Create your first assignment
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Title', 'Due Date', 'Total Points', 'Created At'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {assignments.map(a => (
                              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="text-xs font-bold text-gray-800">{a.title}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[200px]">{a.description}</p>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 font-semibold">
                                  {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'}
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-gray-800">{a.total_points} pts</td>
                                <td className="px-4 py-3 text-xs text-gray-500 font-semibold">
                                  {new Date(a.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {/* RESOURCES TAB */}
                  {activeTab === 'Resources' && (
                    resources.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-gray-400 font-bold mb-2">No resources uploaded yet</p>
                        <button onClick={() => setShowUploadResource(true)} className="text-xs font-black text-[#2563EB] hover:underline">
                          Add course material
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Resource Name', 'Type', 'Web Link'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {resources.map(r => (
                              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
                                      {r.file_type === 'video' ? <Video size={13} /> : r.file_type === 'pdf' ? <FileText size={13} /> : <LinkIcon size={13} />}
                                    </div>
                                    <p className="text-xs font-bold text-gray-800">{r.name}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 font-semibold uppercase">{r.file_type}</td>
                                <td className="px-4 py-3">
                                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] font-bold hover:underline truncate max-w-[250px] inline-block">
                                    {r.url}
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {/* SESSIONS TAB */}
                  {activeTab === 'Sessions' && (
                    sessions.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No sessions scheduled for this course yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Session Title', 'Scheduled At', 'Duration', 'Zoom Access Link'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {sessions.map(s => (
                              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-xs font-bold text-gray-800">{s.title}</td>
                                <td className="px-4 py-3 text-xs text-gray-600 font-semibold">
                                  {new Date(s.scheduled_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{s.duration || '1 hour'}</td>
                                <td className="px-4 py-3">
                                  <a href={s.zoom_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] font-bold hover:underline truncate max-w-[200px] inline-block">
                                    {s.zoom_link}
                                  </a>
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

      {showAddAssignment && (
        <AddAssignmentModal
          courseId={selectedCourse.id}
          onClose={() => setShowAddAssignment(false)}
          onCreated={fetchCourseDetails}
        />
      )}

      {showUploadResource && (
        <UploadResourceModal
          courseId={selectedCourse.id}
          onClose={() => setShowUploadResource(false)}
          onCreated={fetchCourseDetails}
        />
      )}
    </div>
  )
}
