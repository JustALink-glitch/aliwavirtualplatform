import { useState, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, MoreHorizontal, X, ChevronDown, Eye, Pencil, UserCheck, Trash2 } from 'lucide-react'
import { studentsAPI } from '../../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-teal-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-amber-500',
]

const statusStyles = {
  active: 'bg-green-50 text-green-700 border border-green-200 font-semibold',
  pending: 'bg-amber-50 text-amber-600 border border-amber-200 font-semibold',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200 font-semibold',
}

function StudentModal({ student, onClose, onRemove }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${student.color} flex items-center justify-center text-white text-sm font-bold`}>
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

        {/* Info */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Student Information</p>
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
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => { onRemove(student.id); onClose() }}
          className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-bold rounded-lg py-2.5 hover:bg-red-100 transition-colors"
        >
          Remove Student
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
        <Eye size={13} className="text-gray-400" /> View Profile
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 text-left">
        <Trash2 size={13} /> Remove Student
      </button>
    </div>
  )
}

export default function StudentsTab({ cohortId }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [studentsList, setStudentsList] = useState([])
  const [loading, setLoading] = useState(true)
  const filterRef = useRef()

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await studentsAPI.list({ cohort_id: cohortId })
      if (res.success) {
        setStudentsList(res.users || res.students || [])
      } else {
        toast.error(res.message || 'Failed to load cohort students')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while loading students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cohortId) fetchStudents()
  }, [cohortId])

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRemove = async (id) => {
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
      toast.error(err.message || 'Error occurred')
    }
  }

  const mappedStudents = studentsList.map((s, idx) => ({
    id: s.id,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'No Name',
    email: s.email,
    phone: s.phone_number || s.phone || 'N/A',
    gender: s.gender || 'N/A',
    status: (s.status || 'pending').toLowerCase(),
    color: cardColors[idx % cardColors.length],
    course: 'General Curriculum',
    joined: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A',
    attendance: 87, // Mock metrics for UI
    assignments: 'N/A'
  }))

  const filtered = mappedStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  return (
    <div className="font-[Manrope]">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Filter */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              filter !== 'All' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            {filter !== 'All' ? filter : 'Filter'}
            <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
              {['All', 'Active', 'Pending', 'Inactive'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setShowFilter(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
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
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold">No students in this cohort match search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Student', 'Email', 'Joined', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
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
                      <div className={`w-8 h-8 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{student.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{student.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-semibold">{student.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[student.status] || 'bg-gray-100 text-gray-500'}`}>
                      {student.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {openMenu === student.id && (
                      <ActionMenu
                        onClose={() => setOpenMenu(null)}
                        onView={() => { setSelected(student); setOpenMenu(null) }}
                        onDelete={() => handleRemove(student.id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} onRemove={handleRemove} />}
    </div>
  )
}