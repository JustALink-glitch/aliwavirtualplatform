import { useState, useEffect, useRef } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { Upload, X, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { coursesAPI, assignmentsAPI, submissionsAPI } from '../../services'
import toast from 'react-hot-toast'

const statusStyles = {
  Graded: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
  Overdue: 'bg-red-50 text-red-600 border border-red-200',
  Submitted: 'bg-amber-50 text-amber-600 border border-amber-200',
}

function SubmitModal({ assignment, studentId, onClose, onSubmitted }) {
  const [fileUrl, setFileUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fileUrl) return toast.error('Please enter a submission URL or file link')
    try {
      setSubmitting(true)
      const res = await submissionsAPI.create({
        assignment_id: assignment.id,
        student_id: studentId,
        file_url: fileUrl,
        note: note
      })
      if (res.success || res.submission) {
        toast.success('Assignment submitted successfully!')
        if (onSubmitted) onSubmitted()
        onClose()
      } else {
        toast.error(res.message || 'Failed to submit assignment')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while submitting')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Submit Assignment</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-xs font-bold text-gray-800">{assignment.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Flexible timeline'}
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">
            SUBMISSION LINK / URL *
          </label>
          <input
            required
            type="url"
            value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="https://github.com/... or Google Drive Link"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-700 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">NOTE TO TRAINER</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Add any notes or comments for your trainer..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none text-gray-700 font-semibold"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
            <Upload size={13} /> {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FeedbackModal({ assignment, onClose }) {
  const submission = assignment.submission || {}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Assignment Feedback</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-800 mb-1">{assignment.title}</p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              Submitted: {new Date(submission.created_at).toLocaleDateString()}
            </p>
            <span className="text-lg font-bold text-green-600">{submission.grade} / {assignment.total_points}</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Trainer Feedback</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800 leading-relaxed font-semibold">
              {submission.feedback ? `"${submission.feedback}"` : 'No written feedback comments provided yet.'}
            </p>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition">
          Close
        </button>
      </div>
    </div>
  )
}

export default function StudentAssignmentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [submitModal, setSubmitModal] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState(null)
  
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchAssignmentsAndSubmissions = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [coursesRes, submissionsRes] = await Promise.all([
        coursesAPI.list(),
        submissionsAPI.list({ studentId: user.id })
      ])

      const activeCourses = coursesRes.courses || coursesRes || []
      const subs = submissionsRes.submissions || []

      // Gather assignments for each enrolled course
      let allAssignments = []
      for (const course of activeCourses) {
        const asnRes = await assignmentsAPI.list({ courseId: course.id })
        if (asnRes.success || asnRes.assignments) {
          const list = (asnRes.assignments || []).map(a => {
            const matchSub = subs.find(s => s.assignment_id === a.id)
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
          allAssignments.push(...list)
        }
      }
      setAssignments(allAssignments)
    } catch (err) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignmentsAndSubmissions()
  }, [user])

  const filters = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue']

  const filtered = assignments.filter(a =>
    activeFilter === 'All' || a.status.toLowerCase() === activeFilter.toLowerCase()
  )

  const stats = {
    total: assignments.length,
    graded: assignments.filter(a => a.status === 'Graded').length,
    pending: assignments.filter(a => a.status === 'Pending').length,
    overdue: assignments.filter(a => a.status === 'Overdue').length,
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-xs text-gray-400 mt-0.5">Submit work and view trainer feedback</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks', value: loading ? '-' : stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Graded Tasks', value: loading ? '-' : stats.graded, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pending Submission', value: loading ? '-' : stats.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Overdue Tasks', value: loading ? '-' : stats.overdue, color: 'text-red-500', bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white shadow-sm`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">{label}</p>
              </div>
            ))}
          </div>

          {/* Overdue alert */}
          {!loading && stats.overdue > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-sm animate-pulse">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 font-bold">
                You have {stats.overdue} overdue assignment{stats.overdue > 1 ? 's' : ''} requiring immediate attention.
              </p>
            </div>
          )}

          {/* Assignments list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeFilter === f ? 'bg-[#2563EB] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-150'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12 font-bold">No assignments found matching this status.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(assignment => {
                  return (
                    <div key={assignment.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors flex-wrap sm:flex-nowrap gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          assignment.status === 'Graded' ? 'bg-green-50' :
                          assignment.status === 'Submitted' ? 'bg-amber-50' :
                          assignment.status === 'Overdue' ? 'bg-red-50' : 'bg-blue-50'
                        }`}>
                          <FileText size={15} className={
                            assignment.status === 'Graded' ? 'text-green-600' :
                            assignment.status === 'Submitted' ? 'text-amber-600' :
                            assignment.status === 'Overdue' ? 'text-red-500' : 'text-blue-500'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800">{assignment.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <p className="text-[10px] text-gray-400 font-semibold">
                              Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Flexible'}
                            </p>
                            {assignment.submission && (
                              <p className="text-[10px] text-green-600 font-bold">
                                Submitted: {new Date(assignment.submission.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${statusStyles[assignment.status]}`}>
                          {assignment.status}
                        </span>
                        {(assignment.status === 'Pending' || assignment.status === 'Overdue') && (
                          <button onClick={() => setSubmitModal(assignment)}
                            className="flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-blue-700 transition">
                            <Upload size={12} /> Submit URL
                          </button>
                        )}
                        {assignment.status === 'Graded' && (
                          <button onClick={() => setFeedbackModal(assignment)}
                            className="text-xs text-[#2563EB] font-bold hover:underline">
                            View Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {submitModal && (
        <SubmitModal
          assignment={submitModal}
          studentId={user?.id}
          onClose={() => setSubmitModal(null)}
          onSubmitted={fetchAssignmentsAndSubmissions}
        />
      )}
      {feedbackModal && <FeedbackModal assignment={feedbackModal} onClose={() => setFeedbackModal(null)} />}
    </div>
  )
}