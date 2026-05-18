import { useState, useRef, useEffect } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Search, MoreHorizontal, Eye, CheckCircle, X, Star, Download, ChevronDown, ClipboardList } from 'lucide-react'
import { submissionsAPI } from '../../services'
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

const statusStyles = {
  pending: 'bg-blue-50 text-blue-600 border border-blue-200 font-bold',
  graded: 'bg-green-50 text-green-700 border border-green-200 font-bold',
  late: 'bg-amber-50 text-amber-600 border border-amber-200 font-bold',
}

function GradeModal({ submission, onClose, onGraded }) {
  const [grade, setGrade] = useState(submission.grade || '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!grade) return toast.error('Please enter a grade')
    try {
      setSubmitting(true)
      const res = await submissionsAPI.grade(submission.id, grade, feedback)
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
  const assignmentTitle = submission.assignment ? submission.assignment.title : 'General Assignment'
  const maxPoints = submission.assignment ? submission.assignment.total_points : 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Grade Assignment</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Student info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {studentName[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{studentName}</p>
            <p className="text-[11px] text-gray-400 font-semibold">{assignmentTitle}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400 mb-0.5">Submitted At</p>
            <p className="text-gray-800">{new Date(submission.submitted_at).toLocaleDateString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
            <span className="capitalize text-[#2563EB] font-bold">{submission.status}</span>
          </div>
        </div>

        {/* Link */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3">
          <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline break-all">
            {submission.file_url}
          </a>
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            ENTER SCORE / GRADE * <span className="text-gray-400 font-normal">(Max: {maxPoints})</span>
          </label>
          <input type="number" required placeholder="e.g. 85" value={grade} onChange={e => setGrade(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-bold text-gray-700" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">FEEDBACK (optional)</label>
          <textarea rows={3} placeholder="Write feedback..." value={feedback} onChange={e => setFeedback(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none font-semibold text-gray-700" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2.5 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            {submitting ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TrainerAssignmentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const res = await submissionsAPI.list()
      if (res.success || res.submissions) {
        setSubmissions(res.submissions || [])
      }
    } catch (err) {
      toast.error('Failed to load student submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filtered = submissions.filter(s => {
    const sName = s.student ? `${s.student.first_name || ''} ${s.student.last_name || ''}`.toLowerCase() : ''
    const assignTitle = s.assignment ? s.assignment.title.toLowerCase() : ''
    const matchSearch = sName.includes(search.toLowerCase()) || assignTitle.includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || s.status.toLowerCase() === activeFilter.toLowerCase()
    return matchSearch && matchFilter
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status.toLowerCase() === 'pending').length,
    graded: submissions.filter(s => s.status.toLowerCase() === 'graded').length,
    late: submissions.filter(s => s.status.toLowerCase() === 'late').length,
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Grade Student Submissions</h1>
              <p className="text-xs text-gray-400 mt-0.5">{stats.pending} assignments waiting in grading queue</p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Submissions', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Pending Grade', value: stats.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Graded', value: stats.graded, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Late', value: stats.late, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white shadow-sm`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">{label}</p>
              </div>
            ))}
          </div>

          {/* Controls & Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {['All', 'Pending', 'Graded', 'Late'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === f ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-48">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400 font-semibold" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <ClipboardList className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold">No submissions match active filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Student', 'Assignment', 'Submitted', 'File Link', 'Grade', 'Status', ''].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map((s, idx) => {
                      const studentName = s.student ? `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim() : 'Anonymous Student'
                      const assignTitle = s.assignment ? s.assignment.title : 'General Assignment'
                      const maxPoints = s.assignment ? s.assignment.total_points : 100

                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {studentName[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800">{studentName}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{s.student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-bold text-gray-700">{assignTitle}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-500 font-semibold">{new Date(s.submitted_at).toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] font-bold hover:underline truncate max-w-[150px] inline-block">
                              {s.file_url}
                            </a>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-extrabold text-gray-700">
                            {s.grade !== null ? `${s.grade}/${maxPoints}` : '--'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusStyles[s.status.toLowerCase()] || 'bg-gray-100 text-gray-500'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setSelectedSub(s)} className="text-xs font-bold text-[#2563EB] border border-blue-100 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                              Grade
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSub && (
        <GradeModal
          submission={selectedSub}
          onClose={() => setSelectedSub(null)}
          onGraded={fetchSubmissions}
        />
      )}
    </div>
  )
}