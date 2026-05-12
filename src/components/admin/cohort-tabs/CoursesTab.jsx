import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, MoreHorizontal, Eye, Pencil, Trash2, UserPlus, X } from 'lucide-react'

const courses = [
  { id: 'CRS-001', name: 'Data Analytics', trainer: 'Abdulhameed O.', trainerColor: 'bg-orange-400', progress: 90, sessions: '42/48', students: 52, status: 'Ongoing', startDate: 'Jan 1, 2026', endDate: 'Mar 31, 2026' },
  { id: 'CRS-002', name: 'Project Management', trainer: 'Oyindamola O.', trainerColor: 'bg-red-400', progress: 70, sessions: '30/48', students: 18, status: 'Ongoing', startDate: 'Jan 1, 2026', endDate: 'Mar 31, 2026' },
  { id: 'CRS-003', name: 'UX Design', trainer: 'Michael K.', trainerColor: 'bg-blue-500', progress: 50, sessions: '24/48', students: 47, status: 'Ongoing', startDate: 'Jan 1, 2026', endDate: 'Mar 31, 2026' },
  { id: 'CRS-004', name: 'DevOps', trainer: 'Victor O.', trainerColor: 'bg-green-500', progress: 20, sessions: '10/48', students: 26, status: 'Paused', startDate: 'Jan 1, 2026', endDate: 'Mar 31, 2026' },
  { id: 'CRS-005', name: 'Full Stack Dev', trainer: 'Bewaji O.', trainerColor: 'bg-purple-500', progress: 80, sessions: '38/48', students: 61, status: 'Ongoing', startDate: 'Jan 1, 2026', endDate: 'Mar 31, 2026' },
]

const statusStyles = {
  Ongoing: 'bg-green-50 text-green-700 border border-green-200',
  Paused: 'bg-amber-50 text-amber-600 border border-amber-200',
  Stopped: 'bg-red-50 text-red-600 border border-red-200',
}

function CourseModal({ course, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold text-gray-800">{course.name}</p>
            <p className="text-xs text-gray-400">{course.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Course Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'Trainer', value: course.trainer },
            { label: 'Status', value: course.status },
            { label: 'Students', value: course.students },
            { label: 'Sessions', value: course.sessions },
            { label: 'Start Date', value: course.startDate },
            { label: 'End Date', value: course.endDate },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Progress</p>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${course.progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            Edit Course
          </button>
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
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Details
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Pencil size={13} className="text-blue-400" /> Edit Course
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <UserPlus size={13} className="text-green-500" /> Assign Trainer
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Remove Course
      </button>
    </div>
  )
}

export default function CoursesTab() {
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

  const filtered = courses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.trainer.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses or trainers..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
        </div>

        <div className="relative" ref={filterRef}>
          <button onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filter !== 'All' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            Filter {filter !== 'All' && `· ${filter}`} <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
              {['All', 'Ongoing', 'Paused', 'Stopped'].map(opt => (
                <button key={opt} onClick={() => { setFilter(opt); setShowFilter(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
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
      <div className="overflow-x-auto">
<table className="w-full min-w-[650px]">
  <thead>
    <tr className="bg-gray-50">
      {['Course', 'Trainer', 'Progress', 'Sessions', 'Students', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelected(course)}>
              <td className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-800">{course.name}</p>
                <p className="text-[10px] text-gray-400">{course.id}</p>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${course.trainerColor} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                    {course.trainer[0]}
                  </div>
                  <span className="text-xs text-gray-600">{course.trainer}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{course.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{course.sessions}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{course.students}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[course.status]}`}>
                  {course.status}
                </span>
              </td>
              <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={15} />
                </button>
                {openMenu === course.id && (
                  <ActionMenu
                    onClose={() => setOpenMenu(null)}
                    onView={() => { setSelected(course); setOpenMenu(null) }}
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
          <p className="text-sm text-gray-400">No courses match your search</p>
        </div>
      )}

      {selected && <CourseModal course={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}