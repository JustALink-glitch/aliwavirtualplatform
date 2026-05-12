import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import OnboardStudentModal from '../../components/admin/modals/OnboardStudentModal'
import { Filter, MoreHorizontal, Eye, Mail, Trash2, X, ChevronDown } from 'lucide-react'

const students = [
  { id: 'STU-973', name: 'Abdulhameed Olamilekan', course: 'Data Analytics', attendance: 94, lastActive: 'Yesterday', assignments: '12/12', status: 'On track', color: 'bg-orange-400', gender: 'Male', email: 'abdulhameed@gmail.com', phone: '+234 9176245241', joined: '11/02/2026' },
  { id: 'STU-973', name: 'Michael Kaine', course: 'UX Design', attendance: 48, lastActive: 'Yesterday', assignments: '4/12', status: 'At Risk', color: 'bg-blue-500', gender: 'Male', email: 'kainemichael2025@gmail.com', phone: '+234 9176245241', joined: '11/02/2026' },
  { id: 'STU-975', name: 'Oyindamola', course: 'Data Analytics', attendance: 94, lastActive: 'Yesterday', assignments: '9/12', status: 'On track', color: 'bg-red-400', gender: 'Female', email: 'oyindamola@gmail.com', phone: '+234 9176245242', joined: '11/02/2026' },
  { id: 'STU-972', name: 'Bewaji Daniels', course: 'Web Development', attendance: 54, lastActive: 'Yesterday', assignments: '10/12', status: 'At Risk', color: 'bg-teal-500', gender: 'Female', email: 'bewaji@gmail.com', phone: '+234 9176245243', joined: '12/02/2026' },
  { id: 'STU-971', name: 'Mojoyinola Rahman', course: 'Data Analytics', attendance: 94, lastActive: '225 days ago', assignments: '8/12', status: 'On track', color: 'bg-purple-500', gender: 'Female', email: 'mojoyinola@gmail.com', phone: '+234 9176245244', joined: '11/02/2026' },
  { id: 'STU-975', name: 'Abdulhameed Olamilekan', course: 'Data Analytics', attendance: 94, lastActive: 'Yesterday', assignments: '12/12', status: 'On track', color: 'bg-green-500', gender: 'Male', email: 'abdulhameed2@gmail.com', phone: '+234 9176245245', joined: '11/02/2026' },
  { id: 'STU-973', name: 'Michael Kaine', course: 'UX Design', attendance: 48, lastActive: 'Yesterday', assignments: '4/12', status: 'At Risk', color: 'bg-indigo-500', gender: 'Male', email: 'michael2@gmail.com', phone: '+234 9176245246', joined: '13/02/2026' },
  { id: 'STU-975', name: 'Oyindamola', course: 'Data Analytics', attendance: 94, lastActive: 'Yesterday', assignments: '9/12', status: 'On track', color: 'bg-pink-500', gender: 'Female', email: 'oyindamola2@gmail.com', phone: '+234 9176245247', joined: '11/02/2026' },
]

const statusStyles = {
  'On track': 'bg-green-50 text-green-700 border border-green-200',
  'At Risk': 'bg-red-50 text-red-600 border border-red-200',
  'Pending': 'bg-amber-50 text-amber-600 border border-amber-200',
  'Inactive': 'bg-gray-100 text-gray-500 border border-gray-200',
}

function StudentModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6">
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
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'ID Number', value: student.id },
            { label: 'Gender', value: student.gender },
            { label: 'Email Address', value: student.email },
            { label: 'Phone', value: student.phone },
            { label: 'Course', value: student.course },
            { label: 'Last available', value: student.lastActive },
            { label: 'Joined', value: student.joined },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400 mb-1">Status</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[student.status]}`}>
              {student.status}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400 mb-1">Attendance</p>
            <p className={`text-sm font-bold ${student.attendance >= 70 ? 'text-green-600' : 'text-red-500'}`}>
              {student.attendance}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400 mb-1">Assignments</p>
            <p className="text-sm font-bold text-gray-800">{student.assignments}</p>
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
        <Eye size={13} className="text-gray-400" /> View Student
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Mail size={13} className="text-blue-400" /> Mail Student
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Remove Student
      </button>
    </div>
  )
}

export default function StudentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showOnboard, setShowOnboard] = useState(false)
  const [sortBy, setSortBy] = useState('Name')
  const [showSort, setShowSort] = useState(false)
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [showCourseFilter, setShowCourseFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Status')
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const sortRef = useRef()
  const courseRef = useRef()
  const statusRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false)
      if (courseRef.current && !courseRef.current.contains(e.target)) setShowCourseFilter(false)
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusFilter(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCourse = courseFilter === 'All courses' || s.course === courseFilter
    const matchStatus = statusFilter === 'Status' || s.status === statusFilter
    return matchSearch && matchCourse && matchStatus
  })

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900">Students</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} /> Filter
              </button>
              <button onClick={() => setShowOnboard(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                Onboard Students
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Students', value: '252', sub: 'View all →', iconBg: 'bg-orange-50', icon: '🎓' },
              { label: 'Avg. Attendance rate', value: '87%', sub: 'View all →', iconBg: 'bg-green-50', icon: '📊' },
              { label: 'Sessions this month', value: '156', sub: 'View all →', iconBg: 'bg-blue-50', icon: '🎥' },
            ].map(({ label, value, sub, iconBg, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-xs text-[#2563EB] font-medium cursor-pointer hover:underline">{sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4">
            {['All', 'Pending', 'Inactive'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-48">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find Student..."
                className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 bg-white">
                Sort: {sortBy} <ChevronDown size={12} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                  {['Name', 'Attendance', 'Assignments'].map(opt => (
                    <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Course filter */}
            <div className="relative" ref={courseRef}>
              <button onClick={() => setShowCourseFilter(!showCourseFilter)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 bg-white">
                {courseFilter} <ChevronDown size={12} />
              </button>
              {showCourseFilter && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-1 z-20">
                  {['All courses', 'Data Analytics', 'UX Design', 'Web Development', 'Project Management'].map(opt => (
                    <button key={opt} onClick={() => { setCourseFilter(opt); setShowCourseFilter(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium ${courseFilter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="relative" ref={statusRef}>
              <button onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 bg-white">
                {statusFilter} <ChevronDown size={12} />
              </button>
              {showStatusFilter && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                  {['Status', 'On track', 'At Risk', 'Pending', 'Inactive'].map(opt => (
                    <button key={opt} onClick={() => { setStatusFilter(opt); setShowStatusFilter(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium ${statusFilter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
  <thead>
    <tr className="bg-gray-50">
      {['Student', 'Attendance', 'Last Active', 'Assignments', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(student)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400">{student.course} · {student.id}</p>
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
          </div>
        </div>
      </div>

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
      {showOnboard && <OnboardStudentModal isOpen={showOnboard} onClose={() => setShowOnboard(false)} />}
    </div>
  )
}