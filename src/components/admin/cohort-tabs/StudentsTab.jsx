import { useState, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, MoreHorizontal, X, ChevronDown, Eye, Pencil, UserCheck, Trash2 } from 'lucide-react'

const students = [
  { id: 'STD-001', name: 'Abdulhameed Olamilekan', course: 'Data Analytics', attendance: 54, lastActive: 'Active Now', assignments: '8/10', status: 'Active', color: 'bg-orange-400' },
  { id: 'STD-002', name: 'Michael Kaine', course: 'UX Design', attendance: 48, lastActive: 'Active Now', assignments: '6/10', status: 'Inactive', color: 'bg-blue-500' },
  { id: 'STD-003', name: 'Oyindamola', course: 'Project Management', attendance: 56, lastActive: 'Active Now', assignments: '9/10', status: 'Active', color: 'bg-red-400' },
  { id: 'STD-004', name: 'Dawey Jones', course: 'Full Stack Dev', attendance: 34, lastActive: 'Yesterday', assignments: '4/10', status: 'At Risk', color: 'bg-teal-500' },
  { id: 'STD-005', name: 'Abdulhameed Olamilekan', course: 'DevOps', attendance: 90, lastActive: '2 days ago', assignments: '10/10', status: 'Active', color: 'bg-purple-500' },
  { id: 'STD-006', name: 'Michael Kaine', course: 'UX Design', attendance: 48, lastActive: 'Active Now', assignments: '5/10', status: 'Inactive', color: 'bg-green-500' },
  { id: 'STD-007', name: 'Oyindamola', course: 'Data Analytics', attendance: 76, lastActive: '3 days ago', assignments: '7/10', status: 'Active', color: 'bg-pink-500' },
  { id: 'STD-008', name: 'Muhydeen Ayanwale', course: 'Full Stack Dev', attendance: 56, lastActive: 'Active Now', assignments: '8/10', status: 'Active', color: 'bg-amber-500' },
  { id: 'STD-009', name: 'Abdulhameed Olamilekan', course: 'DevOps', attendance: 90, lastActive: 'Active Now', assignments: '9/10', status: 'Active', color: 'bg-cyan-500' },
  { id: 'STD-010', name: 'Michael Kaine', course: 'UX Design', attendance: 48, lastActive: '1 week ago', assignments: '3/10', status: 'At Risk', color: 'bg-indigo-500' },
]

const statusStyles = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  'At Risk': 'bg-red-50 text-red-600 border border-red-200',
}

function StudentModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${student.color} flex items-center justify-center text-white text-sm font-bold`}>
              {student.name[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-400">{student.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Student Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'Age', value: '24' },
            { label: 'Gender', value: 'Male' },
            { label: 'Email Address', value: 'student@gmail.com' },
            { label: 'Phone', value: '+234 913 634 5555' },
            { label: 'Course', value: student.course },
            { label: 'Join Date', value: 'Jan 5, 2026' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Performance */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance</p>
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Attendance</span>
            <span className="font-bold text-gray-800">{student.attendance}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${student.attendance}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs mt-3">
            <span className="text-gray-600">Assignments</span>
            <span className="font-bold text-gray-800">{student.assignments}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(parseInt(student.assignments) / 10) * 100}%` }} />
          </div>
        </div>

        <button className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-semibold rounded-lg py-2.5 hover:bg-red-100 transition-colors">
          Remove Student
        </button>
      </div>
    </div>
  )
}

function ActionMenu({ onClose, onView }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Profile
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Pencil size={13} className="text-blue-400" /> Edit Student
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <UserCheck size={13} className="text-green-500" /> Mark Attendance
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Remove Student
      </button>
    </div>
  )
}
export default function StudentsTab() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const filterRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Filter */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filter !== 'All' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={14} />
            {filter !== 'All' ? filter : 'Filter'}
            <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
              {['All', 'Active', 'Inactive', 'At Risk'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setShowFilter(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    filter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
  <thead>
    <tr className="bg-gray-50">
      {['Student', 'Attendance', 'Last Active', 'Assignments', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelected(student)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                    {student.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{student.name}</p>
                    <p className="text-[10px] text-gray-400">{student.course} · {student.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-bold ${student.attendance >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                  {student.attendance}%
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{student.lastActive}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{student.assignments}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[student.status]}`}>
                  {student.status}
                </span>
              </td>
              <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
  <button
    onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)}
    className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
  >
    <MoreHorizontal size={15} />
  </button>
  {openMenu === student.id && (
    <ActionMenu
      onClose={() => setOpenMenu(null)}
      onView={() => { setSelected(student); setOpenMenu(null) }}
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
          <p className="text-sm text-gray-400">No students match your search</p>
        </div>
      )}

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}