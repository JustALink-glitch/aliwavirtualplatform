import { useState, useRef } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { Upload, X, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'

const assignments = [
  { id: 1, title: 'Hero Section Design', due: 'Apr 15, 2026', submitted: 'Apr 12, 2026', grade: '85/100', feedback: 'Great work! Clean design and good use of spacing. Could improve mobile responsiveness.', status: 'Graded' },
  { id: 2, title: 'Navigation Bar Component', due: 'Apr 20, 2026', submitted: null, grade: null, feedback: null, status: 'Pending' },
  { id: 3, title: 'Responsive Layout', due: 'Apr 25, 2026', submitted: null, grade: null, feedback: null, status: 'Pending' },
  { id: 4, title: 'Data Dashboard Design', due: 'Apr 10, 2026', submitted: null, grade: null, feedback: null, status: 'Overdue' },
  { id: 5, title: 'Python Data Analysis', due: 'Apr 5, 2026', submitted: 'Apr 4, 2026', grade: '92/100', feedback: 'Excellent analysis! Very well structured code and clear visualizations.', status: 'Graded' },
]

const statusStyles = {
  Graded: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
  Overdue: 'bg-red-50 text-red-600 border border-red-200',
  Submitted: 'bg-amber-50 text-amber-600 border border-amber-200',
}

const statusIcons = {
  Graded: CheckCircle,
  Pending: Clock,
  Overdue: AlertTriangle,
}

function SubmitModal({ assignment, onClose }) {
  const [file, setFile] = useState(null)
  const [note, setNote] = useState('')
  const fileRef = useRef()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Submit Assignment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Assignment info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800">{assignment.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Due: {assignment.due}</p>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              UPLOAD FILE <span className="text-red-500">*</span>
            </label>
            {file ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  <p className="text-xs font-semibold text-blue-700">{file.name}</p>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#2563EB] cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Upload size={18} className="text-[#2563EB]" />
                </div>
                <p className="text-xs font-semibold text-gray-700">Click to upload your file</p>
                <p className="text-[11px] text-gray-400">PDF, ZIP, DOCX up to 50MB</p>
                <input ref={fileRef} type="file" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">NOTE TO TRAINER (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Add any notes or comments for your trainer..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={onClose}
              className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 flex items-center justify-center gap-2">
              <Upload size={14} /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedbackModal({ assignment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-800">Assignment Feedback</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-gray-800 mb-1">{assignment.title}</p>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Submitted: {assignment.submitted}</p>
            <span className="text-lg font-bold text-green-600">{assignment.grade}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trainer Feedback</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800 leading-relaxed">"{assignment.feedback}"</p>
            <p className="text-[10px] text-blue-500 mt-2">— Abdulhameed Olamilekan</p>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full mt-4 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
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

  const filters = ['All', 'Pending', 'Graded', 'Overdue']

  const filtered = assignments.filter(a =>
    activeFilter === 'All' || a.status === activeFilter
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
            <p className="text-xs text-gray-400 mt-0.5">Submit and track your assignments</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Graded', value: stats.graded, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pending', value: stats.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Overdue', value: stats.overdue, color: 'text-red-500', bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Overdue alert */}
          {stats.overdue > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                You have {stats.overdue} overdue assignment{stats.overdue > 1 ? 's' : ''}. Submit as soon as possible!
              </p>
            </div>
          )}

          {/* Assignments list */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100">
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === f ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map(assignment => {
                const StatusIcon = statusIcons[assignment.status] || Clock
                return (
                  <div key={assignment.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        assignment.status === 'Graded' ? 'bg-green-50' :
                        assignment.status === 'Overdue' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        <StatusIcon size={15} className={
                          assignment.status === 'Graded' ? 'text-green-600' :
                          assignment.status === 'Overdue' ? 'text-red-500' : 'text-blue-500'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{assignment.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-gray-400">Due: {assignment.due}</p>
                          {assignment.submitted && (
                            <p className="text-xs text-green-500">Submitted: {assignment.submitted}</p>
                          )}
                        </div>
                        {assignment.grade && (
                          <p className="text-xs font-bold text-green-600 mt-0.5">Grade: {assignment.grade}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[assignment.status]}`}>
                        {assignment.status}
                      </span>
                      {(assignment.status === 'Pending' || assignment.status === 'Overdue') && (
                        <button onClick={() => setSubmitModal(assignment)}
                          className="flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-blue-700">
                          <Upload size={12} /> Submit
                        </button>
                      )}
                      {assignment.status === 'Graded' && (
                        <button onClick={() => setFeedbackModal(assignment)}
                          className="text-xs text-[#2563EB] font-semibold hover:underline">
                          View Feedback
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {submitModal && <SubmitModal assignment={submitModal} onClose={() => setSubmitModal(null)} />}
      {feedbackModal && <FeedbackModal assignment={feedbackModal} onClose={() => setFeedbackModal(null)} />}
    </div>
  )
}