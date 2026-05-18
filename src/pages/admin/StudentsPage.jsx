import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import OnboardStudentModal from '../../components/admin/modals/OnboardStudentModal'
import { Filter, MoreHorizontal, Eye, Mail, Trash2, X, ChevronDown, Check } from 'lucide-react'
import { studentsAPI } from '../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-purple-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-pink-500',
]

const statusStyles = {
  active: 'bg-green-50 text-green-700 border border-green-200 font-semibold',
  pending: 'bg-amber-50 text-amber-600 border border-amber-200 font-semibold',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200 font-semibold',
}

function StudentModal({ student, onClose, onRevoke }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${student.color || 'bg-[#2563EB]'} flex items-center justify-center text-white text-base font-bold`}>
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-400">ID: {student.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Student Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'Full Name', value: student.name },
            { label: 'Gender', value: student.gender || 'N/A' },
            { label: 'Email Address', value: student.email },
            { label: 'Phone', value: student.phone || 'N/A' },
            { label: 'Course', value: student.course || 'General Curriculum' },
            { label: 'Joined', value: student.joined || 'N/A' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-bold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => { onRevoke(student.id); onClose() }}
          className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-bold rounded-lg py-2.5 hover:bg-red-100 transition-colors"
        >
          Revoke Access / Suspend Student
        </button>
      </div>
    </div>
  )
}

function ActionMenu({ onClose, onView, onDelete }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40 font-[Manrope]" onClick={e => e.stopPropagation()}>
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left">
        <Eye size={13} className="text-gray-400" /> View Student
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 text-left">
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
  const [studentsList, setStudentsList] = useState([])
  const [loading, setLoading] = useState(true)
  const sortRef = useRef()

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await studentsAPI.list()
      if (res.success) {
        setStudentsList(res.users || res.students || [])
      } else {
        toast.error(res.message || 'Failed to load students')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while fetching students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student? All associated submissions and grades will be deleted.')) return
    try {
      const res = await studentsAPI.remove(id)
      if (res.success) {
        toast.success('Student removed successfully!')
        fetchStudents()
      } else {
        toast.error(res.message || 'Failed to remove student')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove student')
    }
  }

  const handleRevoke = async (id) => {
    try {
      const res = await studentsAPI.revoke(id)
      if (res.success) {
        toast.success('Student access suspended successfully!')
        fetchStudents()
      } else {
        toast.error(res.message || 'Failed to suspend student access')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to suspend student')
    }
  }

  const mappedStudents = studentsList.map((s, idx) => ({
    id: s.id,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'No Name',
    email: s.email,
    phone: s.phone_number || 'N/A',
    gender: s.gender || 'N/A',
    status: (s.status || 'pending').toLowerCase(),
    color: cardColors[idx % cardColors.length],
    course: 'General Curriculum',
    joined: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'
  }))

  const sorted = [...mappedStudents].sort((a, b) => {
    if (sortBy === 'Name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  const filtered = sorted.filter(s => {
    const matchTab = activeTab === 'All' || s.status === activeTab.toLowerCase()
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
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
              <button onClick={() => setShowOnboard(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                Onboard Students
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Students', value: studentsList.length.toString(), iconBg: 'bg-orange-50', icon: '🎓' },
              { label: 'Active Students', value: studentsList.filter(s => s.status === 'active').length.toString(), iconBg: 'bg-green-50', icon: '📊' },
              { label: 'Pending Access', value: studentsList.filter(s => s.status === 'pending').length.toString(), iconBg: 'bg-blue-50', icon: '📩' },
            ].map(({ label, value, iconBg, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Sort + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {['All', 'Active', 'Pending', 'Inactive'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={sortRef}>
                <button onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 font-semibold bg-white">
                  Sort: {sortBy} <ChevronDown size={12} />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                    {['Name'].map(opt => (
                      <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false) }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                          sortBy === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-44">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <p className="text-gray-500 text-sm font-medium mb-3">No students found</p>
              <button 
                onClick={() => setShowOnboard(true)}
                className="text-xs text-[#2563EB] font-bold hover:underline"
              >
                Onboard a student now &rarr;
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Student', 'Email', 'Phone', 'Gender', 'Joined', 'Status', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelected(student)}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1E293B]">{student.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold">{student.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{student.email}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{student.phone}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{student.gender}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">{student.joined}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[student.status] || 'bg-gray-100 text-gray-600'}`}>
                            {student.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenu === idx && (
                            <ActionMenu
                              onClose={() => setOpenMenu(null)}
                              onView={() => { setSelected(student); setOpenMenu(null) }}
                              onDelete={() => handleDelete(student.id)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} onRevoke={handleRevoke} />}
      <OnboardStudentModal isOpen={showOnboard} onClose={() => setShowOnboard(false)} onSuccess={fetchStudents} />
    </div>
  )
}