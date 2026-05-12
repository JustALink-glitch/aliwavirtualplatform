import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import CreateCohortModal from '../../components/admin/modals/CreateCohortModal'
import { Plus, Filter, MoreHorizontal, Pencil, Trash2, PauseCircle, Check } from 'lucide-react'

const cohorts = [
  {
    id: 1, name: 'Cohort 1', status: 'Ongoing',
    description: 'An 8-week intensive program with hands-on projects, live mentorship and introduction to virtual assistants, UX design, data analysis, project management and cybersecurity for beginners.',
    students: 248, courses: 5, trainers: 7, sessions: 48,
    bgFrom: '#f97316', bgTo: '#ec4899',
  },
  {
    id: 2, name: 'Cohort 2', status: 'Ongoing',
    description: 'An intensive program with hands-on projects, live mentorship and introduction to UX design, data analysis, project management and cybersecurity for beginners.',
    students: 200, courses: 4, trainers: 6, sessions: 40,
    bgFrom: '#60a5fa', bgTo: '#6366f1',
  },
  {
    id: 3, name: 'Cohort 3', status: 'Complete',
    description: 'An 8-week intensive program with hands-on projects, live mentorship and introduction to virtual assistants, UX design, data analysis, project management and cybersecurity.',
    students: 180, courses: 5, trainers: 5, sessions: 48,
    bgFrom: '#34d399', bgTo: '#14b8a6',
  },
  {
    id: 4, name: '8 Weeks Bootcamp', status: 'Draft',
    description: 'An 8-week intensive program with hands-on projects, live mentorship and introduction to virtual assistants, UX design, data analysis, project management and cybersecurity.',
    students: 0, courses: 3, trainers: 3, sessions: 0,
    bgFrom: '#9ca3af', bgTo: '#6b7280',
  },
]

const statusStyles = {
  Ongoing: 'bg-green-100 text-green-700',
  Complete: 'bg-blue-100 text-blue-700',
  Draft: 'bg-gray-100 text-gray-600',
}

const filterOptions = ['All', 'Ongoing', 'Complete', 'Draft']

function CardMenu({ onClose }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-8 right-2 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1 z-30">
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Pencil size={13} className="text-blue-400" /> Edit Cohort
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <PauseCircle size={13} className="text-amber-400" /> Pause Cohort
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Check size={13} className="text-green-500" /> Mark Complete
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Delete Cohort
      </button>
    </div>
  )
}

export default function CohortsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const filterRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = activeFilter === 'All' ? cohorts : cohorts.filter(c => c.status === activeFilter)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Cohorts</h1>
            <div className="flex items-center gap-3">

              {/* Filter */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeFilter !== 'All'
                      ? 'border-[#2563EB] text-[#2563EB] bg-blue-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={15} />
                  Filter {activeFilter !== 'All' && `· ${activeFilter}`}
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1 z-30">
                    {filterOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setActiveFilter(opt); setShowFilter(false) }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                          activeFilter === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                        {activeFilter === opt && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} /> Create a new cohort
              </button>
            </div>
          </div>

          {/* Cohorts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {filtered.map((cohort) => (
              <div
                key={cohort.id}
                onClick={() => navigate(`/admin/cohorts/${cohort.id}`)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Banner */}
                <div style={{
                  background: `linear-gradient(135deg, ${cohort.bgFrom}, ${cohort.bgTo})`,
                  height: '112px', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  <span style={{ color: 'white', fontSize: '28px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', padding: '0 12px' }}>
                    {cohort.name}
                  </span>
                  <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[cohort.status]}`}>
                    {cohort.status}
                  </span>
                  <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenu(openMenu === cohort.id ? null : cohort.id)}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                      style={{ color: 'white' }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openMenu === cohort.id && (
                      <CardMenu onClose={() => setOpenMenu(null)} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{cohort.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3"
                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cohort.description}
                  </p>
                  <div className="grid grid-cols-4 gap-1 pt-3 border-t border-gray-100">
                    {[
                      { label: 'Students', value: cohort.students },
                      { label: 'Courses', value: cohort.courses },
                      { label: 'Trainers', value: cohort.trainers },
                      { label: 'Sessions', value: cohort.sessions },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-sm font-bold text-gray-800">{value}</p>
                        <p className="text-[9px] text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateCohortModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}