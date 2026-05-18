import { useState, useRef, useEffect } from 'react'
import { Search, MoreHorizontal, Eye, CheckCircle, Trash2, X, Plus, Calendar, Award } from 'lucide-react'
import { coursesAPI, assignmentsAPI, submissionsAPI } from '../../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-teal-500',
  'bg-purple-500',
  'bg-green-500',
]

const statusStyles = {
  graded: 'bg-green-50 text-green-700 border border-green-200 font-semibold',
  pending: 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold',
  late: 'bg-amber-50 text-amber-600 border border-amber-200 font-semibold',
}

function CreateAssignmentModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [points, setPoints] = useState('100')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title) return toast.error('Assignment title is required')
    try {
      setSubmitting(true)
      const res = await assignmentsAPI.create({
        course_id: courseId,
        title,
        description,
        due_date: dueDate || null,
        total_points: parseInt(points) || 100
      })
      if (res.success || res.assignment) {
        toast.success('Assignment created successfully!')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Failed to create assignment')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800">Create New Assignment</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">ASSIGNMENT TITLE *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Portfolio UX Redesign"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">INSTRUCTIONS / DESCRIPTION</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide instructions for the students..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none font-semibold text-gray-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">DUE DATE</label>
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">MAX POINTS</label>
            <input type="number" value={points} onChange={e => setPoints(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2.5 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            {submitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  )
}

function GradeModal({ submission, onClose, onGraded }) {
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!score) return toast.error('Please enter a grade')
    try {
      setSubmitting(true)
      const res = await submissionsAPI.grade(submission.id, score, feedback)
      if (res.success || res.submission) {
        toast.success('Submission graded successfully!')
        if (onGraded) onGraded()
        onClose()
      } else {
        toast.error(res.message || 'Failed to submit grade')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const studentName = submission.student ? `${submission.student.first_name || ''} ${submission.student.last_name || ''}`.trim() : 'Anonymous Student'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
              {studentName[0]}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{studentName}</p>
              <p className="text-[10px] text-gray-400">ID: {submission.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 text-xs font-semibold text-gray-600">
          <div className="flex items-center justify-between">
            <span>Submitted At:</span>
            <span className="text-gray-800">{new Date(submission.submitted_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Submission File/Link:</span>
            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline font-bold break-all">
              {submission.file_url}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Status:</span>
            <span className="text-gray-800 capitalize font-bold">{submission.status}</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">ENTER SCORE / GRADE</label>
          <input type="number" required placeholder="e.g. 85" value={score} onChange={e => setScore(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-bold text-gray-700" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">FEEDBACK (optional)</label>
          <textarea rows={2} placeholder="Excellent effort, clean presentation..." value={feedback} onChange={e => setFeedback(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none font-semibold text-gray-700" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2.5 hover:bg-gray-50">
            Close
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            {submitting ? 'Grading...' : 'Submit Grade'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AssignmentsTab({ cohortId }) {
  const [coursesList, setCoursesList] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [assignmentsList, setAssignmentsList] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionsList, setSubmissionsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [loadingSub, setLoadingSub] = useState(false)

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [openMenu, setOpenMenu] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await coursesAPI.list({ cohort_id: cohortId })
      if (res.success) {
        setCoursesList(res.courses || [])
        if (res.courses && res.courses.length > 0) {
          setSelectedCourse(res.courses[0])
        }
      }
    } catch (err) {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cohortId) fetchCourses()
  }, [cohortId])

  const fetchAssignments = async () => {
    if (!selectedCourse) return
    try {
      setLoadingAssign(true)
      const res = await assignmentsAPI.list({ courseId: selectedCourse.id })
      if (res.success || res.assignments) {
        const list = res.assignments || []
        setAssignmentsList(list)
        if (list.length > 0) {
          setSelectedAssignment(list[0])
        } else {
          setSelectedAssignment(null)
          setSubmissionsList([])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAssign(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [selectedCourse])

  const fetchSubmissions = async () => {
    if (!selectedAssignment) return
    try {
      setLoadingSub(true)
      const res = await submissionsAPI.list({ assignmentId: selectedAssignment.id })
      if (res.success || res.submissions) {
        setSubmissionsList(res.submissions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSub(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [selectedAssignment])

  const handleDelAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return
    try {
      const res = await assignmentsAPI.remove(id)
      if (res.success) {
        toast.success('Assignment deleted successfully!')
        fetchAssignments()
      } else {
        toast.error(res.message || 'Failed to delete assignment')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  const filters = ['All', 'Graded', 'Pending', 'Late']

  const filtered = submissionsList.filter(s => {
    const name = s.student ? `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim() : ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || s.status.toLowerCase() === activeFilter.toLowerCase()
    return matchSearch && matchFilter
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
      {/* Left — Course list */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Courses</p>
        {coursesList.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold px-2">No courses linked yet</p>
        ) : (
          coursesList.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCourse?.id === course.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-md ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                {course.name[0]}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${selectedCourse?.id === course.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                  {course.name}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">{course.duration || 'N/A'}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Right — Assignment details */}
      <div className="flex-1 min-w-0">
        {selectedCourse ? (
          <div className="space-y-4">
            {/* Header / Select Assignment */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Assignments for {selectedCourse.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Select an assignment to view and grade student submissions</p>
              </div>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                <Plus size={14} /> Create Assignment
              </button>
            </div>

            {loadingAssign ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : assignmentsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-white">
                <Award className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold">No assignments created for this course yet.</p>
                <button onClick={() => setShowCreate(true)} className="text-[11px] text-[#2563EB] font-black hover:underline mt-2">Create First Assignment</button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Horizontal Assignments list */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {assignmentsList.map(assign => (
                    <div
                      key={assign.id}
                      onClick={() => setSelectedAssignment(assign)}
                      className={`flex-shrink-0 border rounded-xl p-3 w-52 cursor-pointer transition-all relative group ${
                        selectedAssignment?.id === assign.id ? 'border-[#2563EB] bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <button onClick={(e) => { e.stopPropagation(); handleDelAssignment(assign.id) }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={13} />
                      </button>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{assign.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 min-h-[28px]">{assign.description || 'No description provided'}</p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold mt-2 pt-2 border-t border-gray-100/50">
                        <span className="flex items-center gap-0.5"><Calendar size={10} /> {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No Due Date'}</span>
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black">{assign.total_points}pts</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submissions for selected assignment */}
                {selectedAssignment && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {filters.map(f => (
                          <button key={f} onClick={() => setActiveFilter(f)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              activeFilter === f ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {f}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 w-48">
                        <Search size={13} className="text-gray-400 flex-shrink-0" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                          placeholder="Search student..."
                          className="flex-1 text-[11px] bg-transparent outline-none text-gray-600 placeholder-gray-400 font-semibold" />
                      </div>
                    </div>

                    {loadingSub ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-10 bg-white border border-gray-100 rounded-xl">
                        <p className="text-xs text-gray-400 font-semibold">No student submissions matching active filter</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Student', 'Submitted At', 'Link/File', 'Grade', 'Status', ''].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {filtered.map((s, idx) => {
                              const sName = s.student ? `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim() : 'Anonymous Student'
                              return (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => setSelectedSub(s)}>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                                        {sName[0]}
                                      </div>
                                      <p className="text-xs font-bold text-gray-800">{sName}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-gray-500 font-semibold">
                                    {new Date(s.submitted_at).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="text-xs text-[#2563EB] font-bold hover:underline truncate max-w-[150px] inline-block">{s.file_url}</span>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs font-extrabold text-gray-700">
                                    {s.grade !== null ? `${s.grade}/${selectedAssignment.total_points}` : '--'}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${statusStyles[s.status.toLowerCase()] || 'bg-gray-100 text-gray-500'}`}>
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 relative" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                                      className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {openMenu === s.id && (
                                      <div className="absolute right-4 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-32 font-[Manrope]" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => { setSelectedSub(s); setOpenMenu(null) }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                          <Eye size={12} className="text-gray-400" /> Grade Submission
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-400 font-bold">Please select a course on the left to see assignments</p>
          </div>
        )}
      </div>

      {showCreate && <CreateAssignmentModal courseId={selectedCourse?.id} onClose={() => setShowCreate(false)} onSuccess={fetchAssignments} />}
      {selectedSub && <GradeModal submission={selectedSub} onClose={() => setSelectedSub(null)} onGraded={fetchSubmissions} />}
    </div>
  )
}