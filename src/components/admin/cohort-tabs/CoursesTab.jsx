import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, MoreHorizontal, Eye, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import { coursesAPI, trainersAPI } from '../../../services'
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
  paused: 'bg-amber-50 text-amber-600 border border-amber-200 font-semibold',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
}

function CourseModal({ course, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold text-gray-800">{course.name}</p>
            <p className="text-xs text-gray-400">ID: {course.id.slice(0, 8)}...</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Course Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'Trainer Name', value: course.trainerName || 'Not Assigned' },
            { label: 'Status', value: course.status.toUpperCase() },
            { label: 'Duration', value: course.duration || 'N/A' },
            { label: 'Category', value: course.category || 'General' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-bold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="w-full bg-[#2563EB] text-white text-sm font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
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
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 font-[Manrope]" onClick={e => e.stopPropagation()}>
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left">
        <Eye size={13} className="text-gray-400" /> View Details
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 text-left">
        <Trash2 size={13} /> Remove Course
      </button>
    </div>
  )
}

export default function CoursesTab({ cohortId }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const [coursesList, setCoursesList] = useState([])
  const [trainersList, setTrainersList] = useState([])
  const [loading, setLoading] = useState(true)
  const filterRef = useRef()

  const fetchCoursesAndTrainers = async () => {
    try {
      setLoading(true)
      const [cRes, tRes] = await Promise.all([
        coursesAPI.list({ cohort_id: cohortId }),
        trainersAPI.list()
      ])
      if (cRes.success) {
        setCoursesList(cRes.courses || [])
      } else {
        toast.error(cRes.message || 'Failed to load cohort courses')
      }
      if (tRes.success) {
        setTrainersList(tRes.users || tRes.trainers || [])
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cohortId) fetchCoursesAndTrainers()
  }, [cohortId])

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this course? This is permanent.')) return
    try {
      const res = await coursesAPI.remove(id)
      if (res.success) {
        toast.success('Course removed successfully!')
        fetchCoursesAndTrainers()
      } else {
        toast.error(res.message || 'Failed to remove course')
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting course')
    }
  }

  const mapped = coursesList.map((c, idx) => {
    const matchedTrainer = trainersList.find(t => t.id === c.trainer_id)
    const trainerName = matchedTrainer ? `${matchedTrainer.first_name || ''} ${matchedTrainer.last_name || ''}`.trim() : 'Not Assigned'
    return {
      id: c.id,
      name: c.name,
      duration: c.duration,
      category: c.category,
      status: c.status || 'active',
      trainerName,
      trainerColor: cardColors[idx % cardColors.length],
      progress: 60, // Mock metric
      sessions: '12/16', // Mock metric
      students: 24 // Mock metric
    }
  })

  const filtered = mapped.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.trainerName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter.toLowerCase()
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
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses or trainers..."
            className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
        </div>

        <div className="relative" ref={filterRef}>
          <button onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              filter !== 'All' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
            }`}>
            Filter {filter !== 'All' && `· ${filter}`} <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
              {['All', 'Active', 'Paused', 'Completed'].map(opt => (
                <button key={opt} onClick={() => { setFilter(opt); setShowFilter(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                    filter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
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
          <p className="text-xs text-gray-400 font-semibold font-[Manrope]">No courses in this cohort match search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Course', 'Trainer', 'Duration', 'Category', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelected(course)}>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-gray-800">{course.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">ID: {course.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${course.trainerColor} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                        {course.trainerName[0]}
                      </div>
                      <span className="text-xs text-gray-600 font-semibold">{course.trainerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{course.duration || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-semibold">{course.category || 'General'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[course.status] || 'bg-gray-100 text-gray-600'}`}>
                      {course.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                    {openMenu === course.id && (
                      <ActionMenu
                        onClose={() => setOpenMenu(null)}
                        onView={() => { setSelected(course); setOpenMenu(null) }}
                        onDelete={() => handleDelete(course.id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <CourseModal course={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}