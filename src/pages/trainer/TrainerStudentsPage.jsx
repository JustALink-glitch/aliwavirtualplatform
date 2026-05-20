import { useState, useEffect } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Search, ChevronDown, X, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { studentsAPI } from '../../services'
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

function StudentModal({ student, color, onClose }) {
  const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Anonymous'
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white text-base font-bold`}>
              {studentName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{studentName}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.status || 'Active'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">Student Information</p>
        <div className="space-y-3 mb-5 text-xs text-gray-600 font-semibold">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Email</p>
            <p className="text-gray-800 break-all">{student.email}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Phone</p>
            <p className="text-gray-800">{student.phone_number || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Cohort ID</p>
            <p className="text-gray-800">{student.cohort_id || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Joined At</p>
            <p className="text-gray-800">{new Date(student.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <a href={`mailto:${student.email}`} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
            Send Email
          </a>
          <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrainerStudentsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await studentsAPI.list()
      if (res.success || res.students || res.users) {
        setStudents(res.students || res.users || [])
      }
    } catch (err) {
      toast.error('Failed to load student roster')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filtered = students.filter(s => {
    const sName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
    const matchSearch = sName.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status?.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  const suspendedStudents = students.filter(s => s.status?.toLowerCase() === 'suspended').length
  const activeStudents = students.filter(s => s.status?.toLowerCase() === 'active' || !s.status).length

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Directory</h1>
              <p className="text-xs text-gray-400 mt-0.5">Enrolled student rosters and profiles</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Students', value: loading ? '-' : students.length, icon: Users, bg: 'bg-blue-50', color: 'text-[#2563EB]', sub: 'Registered' },
              { label: 'Active Students', value: loading ? '-' : activeStudents, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', sub: 'In good standing' },
              { label: 'Suspended Students', value: loading ? '-' : suspendedStudents, icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-500', sub: 'Access suspended' },
            ].map(({ label, value, icon: Icon, bg, color, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-bold">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">{sub}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-48">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400 font-semibold" />
              </div>
              <div className="relative">
                <button onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-bold transition-colors border-gray-200 text-gray-600 hover:bg-gray-50`}>
                  Filter: {filter} <ChevronDown size={13} />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20 font-semibold">
                    {['All', 'Active', 'Suspended'].map(opt => (
                      <button key={opt} onClick={() => { setFilter(opt); setShowFilter(false) }}
                        className={`w-full text-left px-4 py-2 text-xs ${filter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <Users className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold">No students found matching your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Student Details', 'Email', 'Phone Number', 'Joined Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map((student, idx) => {
                      const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Anonymous Student'
                      const color = cardColors[idx % cardColors.length]
                      const statusLabel = student.status || 'Active'

                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {studentName[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800">{studentName}</p>
                                <p className="text-[9px] text-gray-400 font-semibold">{student.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">{student.email}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">{student.phone_number || 'N/A'}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              statusLabel.toLowerCase() === 'suspended' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setSelected({ student, color })} className="text-xs font-bold text-[#2563EB] hover:underline">
                              View Profile
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

      {selected && (
        <StudentModal
          student={selected.student}
          color={selected.color}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
