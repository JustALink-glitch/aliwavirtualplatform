import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import CreateCourseModal from '../../components/admin/modals/CreateCourseModal'
import { Plus, Filter, LayoutGrid, List, MoreHorizontal, Eye, Archive, Trash2, Upload } from 'lucide-react'

const courses = [
  { id: 1, name: 'Data Analytics', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Active', modules: 5, students: 120, trainer: 'Abdulhameed O.' },
  { id: 2, name: 'UX Design', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Active', modules: 7, students: 200, trainer: 'Michael K.' },
  { id: 3, name: 'Data Analysis', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Active', modules: 5, students: 356, trainer: 'Oyindamola O.' },
  { id: 4, name: 'Data Analysis', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Active', modules: 5, students: 220, trainer: 'Victor O.' },
  { id: 5, name: 'Data Analysis', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Active', modules: 5, students: 218, trainer: 'Bewaji O.' },
  { id: 6, name: 'Data Analysis', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Archive', modules: 5, students: 280, trainer: 'Abdulhameed O.' },
  { id: 7, name: 'Data Analysis', description: 'Data analysis fundamentals with Python, Pandas, SQL and Visualization.', status: 'Draft', modules: 5, students: 220, trainer: 'Michael K.' },
]

const statusStyles = {
  Active: 'bg-green-50 text-green-700',
  Archive: 'bg-gray-100 text-gray-500',
  Draft: 'bg-amber-50 text-amber-600',
}

const cardColors = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-red-400',
  'from-cyan-400 to-blue-500',
  'from-gray-400 to-gray-500',
  'from-amber-400 to-orange-400',
]

function CardMenu({ status, onClose, onView }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-2 top-8 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 z-30">
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Course
      </button>
      {status === 'Draft' ? (
        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          <Upload size={13} className="text-blue-400" /> Publish Course
        </button>
      ) : status === 'Archive' ? (
        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          <Archive size={13} className="text-amber-400" /> Unarchive Course
        </button>
      ) : (
        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          <Archive size={13} className="text-amber-400" /> Archive Course
        </button>
      )}
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Delete Course
      </button>
    </div>
  )
}

export default function CoursesPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState('grid')
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const tabs = [
    { label: 'All', count: courses.length },
    { label: 'Active', count: courses.filter(c => c.status === 'Active').length },
    { label: 'Archive', count: courses.filter(c => c.status === 'Archive').length },
    { label: 'Draft', count: courses.filter(c => c.status === 'Draft').length },
  ]

  const filtered = courses.filter(c => {
    const matchTab = activeTab === 'All' || c.status === activeTab
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-xl font-bold text-gray-900">Courses</h1>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setView('grid')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
                  <LayoutGrid size={15} />
                </button>
                <button onClick={() => setView('list')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
                  <List size={15} />
                </button>
              </div>
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} /> Filter
              </button>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={14} /> Create a new course
              </button>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1">
              {tabs.map(({ label, count }) => (
                <button key={label} onClick={() => setActiveTab(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === label ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-52">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course..."
                className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
            </div>
          </div>

          {/* GRID VIEW */}
          {view === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {filtered.map((course, i) => (
                <div key={course.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/courses/${course.id}`)}>

                  {/* Card banner */}
                  <div style={{ height: '80px', position: 'relative', background: [
  'linear-gradient(135deg, #60a5fa, #6366f1)',
  'linear-gradient(135deg, #c084fc, #ec4899)',
  'linear-gradient(135deg, #34d399, #14b8a6)',
  'linear-gradient(135deg, #fb923c, #f87171)',
  'linear-gradient(135deg, #22d3ee, #60a5fa)',
  'linear-gradient(135deg, #9ca3af, #6b7280)',
  'linear-gradient(135deg, #fbbf24, #fb923c)',
][i % 7] }}>
                    <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[course.status]}`}>
                      {course.status}
                    </span>
                    <div className="absolute top-1.5 right-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                        className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                      {openMenu === course.id && (
                        <CardMenu
                          status={course.status}
                          onClose={() => setOpenMenu(null)}
                          onView={() => { navigate(`/admin/courses/${course.id}`); setOpenMenu(null) }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{course.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">{course.modules} modules</span>
                      <span className="text-[10px] text-gray-400">{course.students} students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="bg-white rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['Course', 'Trainer', 'Modules', 'Students', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((course, i) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/courses/${course.id}`)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cardColors[i % cardColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {course.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{course.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{course.trainer}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{course.modules}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{course.students}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[course.status]}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                          className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal size={15} />
                        </button>
                        {openMenu === course.id && (
                          <CardMenu
                            status={course.status}
                            onClose={() => setOpenMenu(null)}
                            onView={() => { navigate(`/admin/courses/${course.id}`); setOpenMenu(null) }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
      <CreateCourseModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}