import { useState, useRef, useEffect } from 'react'
import { Search, MoreHorizontal, Eye, CheckCircle, Trash2, X, ChevronDown } from 'lucide-react'

const courses = [
  { id: 1, name: 'Data Analytics', assignments: 50, graded: 42, color: 'bg-orange-400' },
  { id: 2, name: 'Project Management', assignments: 40, graded: 35, color: 'bg-red-400' },
  { id: 3, name: 'UX Design', assignments: 45, graded: 38, color: 'bg-blue-500' },
  { id: 4, name: 'DevOps', assignments: 30, graded: 20, color: 'bg-green-500' },
  { id: 5, name: 'Full Stack Dev', assignments: 48, graded: 40, color: 'bg-purple-500' },
]

const assignments = [
  { id: 'ASN-001', student: 'Abdulhameed Olamilekan', color: 'bg-orange-400', submittedDate: 'Apr 12, 10:32 AM', file: 'data_analysis.pdf', grade: '85/100', status: 'Graded' },
  { id: 'ASN-002', student: 'Thelma James', color: 'bg-blue-400', submittedDate: 'Apr 12, 11:14 AM', file: 'task_report.pdf', grade: '72/100', status: 'Graded' },
  { id: 'ASN-003', student: 'Oyindamola Onatuara', color: 'bg-red-400', submittedDate: 'Apr 13, 9:05 AM', file: 'assignment.pdf', grade: '--', status: 'Pending' },
  { id: 'ASN-004', student: 'Victor Okpara', color: 'bg-green-500', submittedDate: 'Apr 13, 2:00 PM', file: 'victor_task.pdf', grade: '--', status: 'Pending' },
  { id: 'ASN-005', student: 'Dawey Jones', color: 'bg-teal-500', submittedDate: 'Apr 10, 8:00 AM', file: 'dawey_work.pdf', grade: '60/100', status: 'Late' },
  { id: 'ASN-006', student: 'Muhydeen Ayanwale', color: 'bg-amber-500', submittedDate: '--', file: '--', grade: '--', status: 'Missing' },
]

const statusStyles = {
  Graded: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
  Late: 'bg-amber-50 text-amber-600 border border-amber-200',
  Missing: 'bg-red-50 text-red-600 border border-red-200',
}

function ActionMenu({ onClose, onView }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Submission
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <CheckCircle size={13} className="text-green-500" /> Mark as Graded
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Delete
      </button>
    </div>
  )
}

function GradeModal({ assignment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${assignment.color} flex items-center justify-center text-white text-xs font-bold`}>
              {assignment.student[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{assignment.student}</p>
              <p className="text-xs text-gray-400">{assignment.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { label: 'Submitted', value: assignment.submittedDate },
            { label: 'File', value: assignment.file },
            { label: 'Current Grade', value: assignment.grade },
            { label: 'Status', value: assignment.status },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        {assignment.status === 'Pending' || assignment.status === 'Late' ? (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">ENTER GRADE</label>
              <input placeholder="e.g. 85" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">FEEDBACK (optional)</label>
              <textarea rows={2} placeholder="Add feedback for student..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
            </div>
          </>
        ) : null}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">
            Close
          </button>
          {(assignment.status === 'Pending' || assignment.status === 'Late') && (
            <button className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
              Submit Grade
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AssignmentsTab() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)

  const filters = ['All', 'Graded', 'Pending', 'Late', 'Missing']

  const filtered = assignments.filter(a => {
    const matchSearch = a.student.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || a.status === activeFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="flex gap-4">

      {/* Left — Course list */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Courses</p>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              selectedCourse.id === course.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-md ${course.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
              {course.name[0]}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate ${selectedCourse.id === course.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                {course.name}
              </p>
              <p className="text-[10px] text-gray-400">{course.assignments} assignments</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right — Assignment details */}
      <div className="flex-1 min-w-0">

        {/* Course header */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">{selectedCourse.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Assignment submissions for this cohort</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Submitted', value: `${selectedCourse.assignments}/50`, color: 'text-gray-800' },
              { label: 'Graded', value: `${selectedCourse.graded}/${selectedCourse.assignments}`, color: 'text-gray-800' },
              { label: 'Avg Score', value: '64%', color: 'text-green-600' },
              { label: 'Completion', value: '78%', color: 'text-blue-600' },
              { label: 'Overdue', value: '6', color: 'text-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                <p className={`text-base font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
              className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
  <thead>
    <tr className="bg-gray-50">
      {['Student', 'Submitted', 'File', 'Grade', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelected(a)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {a.student[0]}
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{a.student}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{a.submittedDate}</td>
                <td className="px-4 py-3">
                  {a.file !== '--' ? (
                    <span className="text-xs text-[#2563EB] font-medium hover:underline cursor-pointer">{a.file}</span>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-700">{a.grade}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                    <MoreHorizontal size={15} />
                  </button>
                  {openMenu === a.id && (
                    <ActionMenu
                      onClose={() => setOpenMenu(null)}
                      onView={() => { setSelected(a); setOpenMenu(null) }}
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

      {selected && <GradeModal assignment={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}