import { useState, useRef, useEffect } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Search, ChevronDown, MoreHorizontal, Eye, Mail, X, TrendingUp, Users, AlertTriangle } from 'lucide-react'

const students = [
  { id: 'STU-001', name: 'Abdulhameed Olamilekan', email: 'abdulhameed@gmail.com', phone: '+234 913 634 5555', attendance: 94, assignments: '10/12', grade: 'A', status: 'On track', color: 'bg-orange-400', joined: 'Jan 5, 2026', lastActive: 'Today' },
  { id: 'STU-002', name: 'Michael Kaine', email: 'michael@gmail.com', phone: '+234 913 634 5556', attendance: 48, assignments: '4/12', grade: 'D', status: 'At Risk', color: 'bg-blue-500', joined: 'Jan 5, 2026', lastActive: 'Yesterday' },
  { id: 'STU-003', name: 'Oyindamola', email: 'oyindamola@gmail.com', phone: '+234 913 634 5557', attendance: 76, assignments: '9/12', grade: 'B', status: 'On track', color: 'bg-red-400', joined: 'Jan 5, 2026', lastActive: 'Today' },
  { id: 'STU-004', name: 'Bewaji Daniels', email: 'bewaji@gmail.com', phone: '+234 913 634 5558', attendance: 54, assignments: '7/12', grade: 'C', status: 'At Risk', color: 'bg-teal-500', joined: 'Jan 6, 2026', lastActive: '3 days ago' },
  { id: 'STU-005', name: 'Mojoyinola Rahman', email: 'mojoyinola@gmail.com', phone: '+234 913 634 5559', attendance: 90, assignments: '12/12', grade: 'A', status: 'On track', color: 'bg-purple-500', joined: 'Jan 5, 2026', lastActive: 'Today' },
  { id: 'STU-006', name: 'David Adamawa', email: 'david@gmail.com', phone: '+234 913 634 5560', attendance: 82, assignments: '8/12', grade: 'B', status: 'On track', color: 'bg-amber-500', joined: 'Jan 7, 2026', lastActive: 'Yesterday' },
  { id: 'STU-007', name: 'James Taroro', email: 'james@gmail.com', phone: '+234 913 634 5561', attendance: 45, assignments: '3/12', grade: 'F', status: 'At Risk', color: 'bg-red-500', joined: 'Jan 5, 2026', lastActive: '5 days ago' },
  { id: 'STU-008', name: 'Rebecca Eliza', email: 'rebecca@gmail.com', phone: '+234 913 634 5562', attendance: 88, assignments: '11/12', grade: 'A', status: 'On track', color: 'bg-pink-500', joined: 'Jan 5, 2026', lastActive: 'Today' },
]

const statusStyles = {
  'On track': 'bg-green-50 text-green-700 border border-green-200',
  'At Risk': 'bg-red-50 text-red-600 border border-red-200',
}

function StudentModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${student.color} flex items-center justify-center text-white text-base font-bold`}>
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Student Information</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Email', value: student.email },
            { label: 'Phone', value: student.phone },
            { label: 'Joined', value: student.joined },
            { label: 'Last Active', value: student.lastActive },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-gray-800">{student.attendance}%</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Attendance</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-gray-800">{student.assignments}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Assignments</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-base font-bold ${
              student.grade === 'A' ? 'text-green-600' :
              student.grade === 'B' ? 'text-blue-600' :
              student.grade === 'C' ? 'text-amber-600' : 'text-red-500'
            }`}>{student.grade}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Grade</p>
          </div>
        </div>

        {/* Attendance bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Attendance Rate</span>
            <span className={`font-bold ${student.attendance >= 70 ? 'text-green-600' : 'text-red-500'}`}>
              {student.attendance}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${student.attendance >= 70 ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${student.attendance}%` }} />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">
            <Mail size={13} /> Send Email
          </button>
          {student.status === 'At Risk' && (
            <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-amber-600">
              <AlertTriangle size={13} /> Flag Student
            </button>
          )}
        </div>
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
        <Mail size={13} className="text-blue-400" /> Send Email
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-amber-500 hover:bg-amber-50">
        <AlertTriangle size={13} /> Flag At Risk
      </button>
    </div>
  )
}

export default function TrainerStudentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const filterRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter
    return matchSearch && matchFilter
  })

  const atRisk = students.filter(s => s.status === 'At Risk').length

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Students</h1>
              <p className="text-xs text-gray-400 mt-0.5">Students enrolled in your course</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Students', value: students.length, icon: Users, bg: 'bg-blue-50', color: 'text-[#2563EB]', sub: 'In your course' },
              { label: 'On Track', value: students.filter(s => s.status === 'On track').length, icon: TrendingUp, bg: 'bg-green-50', color: 'text-green-600', sub: 'Performing well' },
              { label: 'At Risk', value: atRisk, icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-500', sub: 'Need attention' },
            ].map(({ label, value, icon: Icon, bg, color, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* At risk alert */}
          {atRisk > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {atRisk} students are at risk due to low attendance or poor assignment completion.
                </p>
              </div>
              <button className="text-xs text-red-600 font-bold hover:underline flex-shrink-0">
                View At Risk →
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
              </div>
              <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    filter !== 'All' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {filter === 'All' ? 'All Students' : filter} <ChevronDown size={13} />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                    {['All', 'On track', 'At Risk'].map(opt => (
                      <button key={opt} onClick={() => { setFilter(opt); setShowFilter(false) }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium ${filter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
  <thead>
    <tr className="bg-gray-50">
      {['Student', 'Attendance', 'Last Active', 'Assignments', 'Grade', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student, i) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(student)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400">{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${student.attendance >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{student.lastActive}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{student.assignments}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${
                        student.grade === 'A' ? 'text-green-600' :
                        student.grade === 'B' ? 'text-blue-600' :
                        student.grade === 'C' ? 'text-amber-600' : 'text-red-500'
                      }`}>{student.grade}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[student.status]}`}>
                        {student.status}
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
          </div>
        </div>
      </div>

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}