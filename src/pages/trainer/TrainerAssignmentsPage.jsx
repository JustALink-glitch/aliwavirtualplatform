import { useState, useRef, useEffect } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Search, MoreHorizontal, Eye, CheckCircle, X, Star, Download, ChevronDown } from 'lucide-react'

const assignments = [
  { id: 'ASN-001', student: 'Abdulhameed Olamilekan', studentId: 'STU-001', title: 'Hero Section Design', submitted: 'Apr 12, 10:32 AM', file: 'hero_section.pdf', grade: null, status: 'Pending', color: 'bg-orange-400' },
  { id: 'ASN-002', student: 'Michael Kaine', studentId: 'STU-002', title: 'Hero Section Design', submitted: 'Apr 12, 11:14 AM', file: 'michael_hero.pdf', grade: null, status: 'Pending', color: 'bg-blue-500' },
  { id: 'ASN-003', student: 'Oyindamola', studentId: 'STU-003', title: 'Hero Section Design', submitted: 'Apr 12, 9:05 AM', file: 'oyin_design.pdf', grade: 85, status: 'Graded', color: 'bg-red-400' },
  { id: 'ASN-004', student: 'Bewaji Daniels', studentId: 'STU-004', title: 'Navigation Bar', submitted: 'Apr 10, 8:00 AM', file: 'bewaji_nav.pdf', grade: null, status: 'Late', color: 'bg-teal-500' },
  { id: 'ASN-005', student: 'Mojoyinola Rahman', studentId: 'STU-005', title: 'Navigation Bar', submitted: 'Apr 11, 3:00 PM', file: 'mojo_nav.pdf', grade: 92, status: 'Graded', color: 'bg-purple-500' },
  { id: 'ASN-006', student: 'David Adamawa', studentId: 'STU-006', title: 'Navigation Bar', submitted: '--', file: '--', grade: null, status: 'Missing', color: 'bg-amber-500' },
  { id: 'ASN-007', student: 'James Taroro', studentId: 'STU-007', title: 'Hero Section Design', submitted: 'Apr 13, 2:00 PM', file: 'james_hero.pdf', grade: null, status: 'Pending', color: 'bg-red-500' },
  { id: 'ASN-008', student: 'Rebecca Eliza', studentId: 'STU-008', title: 'Responsive Layout', submitted: 'Apr 14, 10:00 AM', file: 'rebecca_layout.pdf', grade: 78, status: 'Graded', color: 'bg-pink-500' },
]

const statusStyles = {
  Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
  Graded: 'bg-green-50 text-green-700 border border-green-200',
  Late: 'bg-amber-50 text-amber-600 border border-amber-200',
  Missing: 'bg-red-50 text-red-600 border border-red-200',
}

function GradeModal({ assignment, onClose }) {
  const [grade, setGrade] = useState(assignment.grade || '')
  const [feedback, setFeedback] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Grade Assignment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Student info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className={`w-9 h-9 rounded-full ${assignment.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {assignment.student.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{assignment.student}</p>
              <p className="text-[11px] text-gray-400">{assignment.title} · {assignment.studentId}</p>
            </div>
          </div>

          {/* Submission details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">Submitted</p>
              <p className="text-xs font-semibold text-gray-700">{assignment.submitted}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[assignment.status]}`}>
                {assignment.status}
              </span>
            </div>
          </div>

          {/* File */}
          {assignment.file !== '--' && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-blue-100">
                  <Eye size={14} className="text-blue-500" />
                </div>
                <p className="text-xs font-semibold text-blue-700">{assignment.file}</p>
              </div>
              <button className="text-[#2563EB] hover:text-blue-700">
                <Download size={15} />
              </button>
            </div>
          )}

          {/* Grade input */}
          {assignment.status !== 'Missing' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  GRADE <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(out of 100)</span>
                </label>
                <input
                  type="number" min="0" max="100"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="Enter score e.g. 85"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Star rating preview */}
              {grade && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14}
                        style={{ color: i <= Math.round((grade / 100) * 5) ? '#f59e0b' : '#e5e7eb',
                          fill: i <= Math.round((grade / 100) * 5) ? '#f59e0b' : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-xs text-amber-700 font-medium">
                    {grade >= 90 ? 'Excellent' : grade >= 75 ? 'Good' : grade >= 60 ? 'Average' : 'Needs Improvement'}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">FEEDBACK</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Write feedback for the student..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">
              Cancel
            </button>
            {assignment.status !== 'Missing' && (
              <button onClick={onClose}
                className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Submit Grade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionMenu({ onClose, onGrade }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
      <button onClick={onGrade} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <CheckCircle size={13} className="text-green-500" /> Grade
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Submission
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Download size={13} className="text-blue-400" /> Download
      </button>
    </div>
  )
}

export default function TrainerAssignmentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy] = useState('Latest')
  const [showSort, setShowSort] = useState(false)
  const sortRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filters = ['All', 'Pending', 'Graded', 'Late', 'Missing']

  const filtered = assignments.filter(a => {
    const matchSearch = a.student.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || a.status === activeFilter
    return matchSearch && matchFilter
  })

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'Pending').length,
    graded: assignments.filter(a => a.status === 'Graded').length,
    late: assignments.filter(a => a.status === 'Late').length,
    missing: assignments.filter(a => a.status === 'Missing').length,
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
              <h1 className="text-xl font-bold text-gray-900">Grade Assignments</h1>
              <p className="text-xs text-gray-400 mt-0.5">{stats.pending} assignments waiting to be graded</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Pending', value: stats.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Graded', value: stats.graded, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Late', value: stats.late, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Missing', value: stats.missing, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">

            {/* Controls */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-1">
                {filters.map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === f ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-44">
                  <Search size={13} className="text-gray-400 flex-shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
                </div>
                <div className="relative" ref={sortRef}>
                  <button onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                    Sort: {sortBy} <ChevronDown size={12} />
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                      {['Latest', 'Oldest', 'Name A-Z'].map(opt => (
                        <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false) }}
                          className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
<table className="w-full min-w-[700px]">
  <thead>
    <tr className="bg-gray-50">
      {['Student', 'Assignment', 'Submitted', 'File', 'Grade', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a, i) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(a)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {a.student.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{a.student}</p>
                          <p className="text-[10px] text-gray-400">{a.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-700">{a.title}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{a.submitted}</td>
                    <td className="px-5 py-3.5">
                      {a.file !== '--' ? (
                        <span className="text-xs text-[#2563EB] font-medium hover:underline">{a.file}</span>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-700">
                      {a.grade !== null ? `${a.grade}/100` : '--'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setOpenMenu(openMenu === i ? null : i)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === i && (
                        <ActionMenu
                          onClose={() => setOpenMenu(null)}
                          onGrade={() => { setSelected(a); setOpenMenu(null) }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No assignments match your filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && <GradeModal assignment={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}