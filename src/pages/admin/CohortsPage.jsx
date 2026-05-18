import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import CreateCohortModal from '../../components/admin/modals/CreateCohortModal'
import { Plus, Filter, MoreHorizontal, Pencil, Trash2, PauseCircle, Check, Play } from 'lucide-react'
import { cohortsAPI } from '../../services'
import toast from 'react-hot-toast'

const statusMapping = {
  active: 'Ongoing',
  completed: 'Complete',
  upcoming: 'Upcoming',
  draft: 'Draft',
  paused: 'Paused'
}

const statusStyles = {
  Ongoing: 'bg-green-100 text-green-700',
  Complete: 'bg-blue-100 text-blue-700',
  Upcoming: 'bg-purple-100 text-purple-700',
  Draft: 'bg-gray-100 text-gray-600',
  Paused: 'bg-amber-100 text-amber-700'
}

const filterOptions = ['All', 'Ongoing', 'Complete', 'Upcoming', 'Draft', 'Paused']

const gradients = [
  { bgFrom: '#f97316', bgTo: '#ec4899' },
  { bgFrom: '#60a5fa', bgTo: '#6366f1' },
  { bgFrom: '#34d399', bgTo: '#14b8a6' },
  { bgFrom: '#f59e0b', bgTo: '#ef4444' },
  { bgFrom: '#a855f7', bgTo: '#ec4899' }
]

function CardMenu({ cohort, onClose, onDelete, onUpdateStatus }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-8 right-2 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-1 z-30 font-[Manrope]" onClick={(e) => e.stopPropagation()}>
      {cohort.status !== 'active' && (
        <button 
          onClick={() => { onUpdateStatus(cohort.id, 'active'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <Play size={13} className="text-green-500" /> Start Cohort
        </button>
      )}
      {cohort.status === 'active' && (
        <button 
          onClick={() => { onUpdateStatus(cohort.id, 'paused'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <PauseCircle size={13} className="text-amber-500" /> Pause Cohort
        </button>
      )}
      {cohort.status !== 'completed' && (
        <button 
          onClick={() => { onUpdateStatus(cohort.id, 'completed'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <Check size={13} className="text-blue-500" /> Mark Complete
        </button>
      )}
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button 
        onClick={() => { onDelete(cohort.id); onClose() }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 text-left"
      >
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
  const [cohortsList, setCohortsList] = useState([])
  const [loading, setLoading] = useState(true)
  const filterRef = useRef()
  const navigate = useNavigate()

  const fetchCohorts = async () => {
    try {
      setLoading(true)
      const res = await cohortsAPI.list()
      if (res.success) {
        setCohortsList(res.cohorts || [])
      } else {
        toast.error(res.message || 'Failed to load cohorts')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while fetching cohorts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCohorts()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cohort? This action is permanent.')) return
    try {
      const res = await cohortsAPI.remove(id)
      if (res.success) {
        toast.success('Cohort deleted successfully!')
        fetchCohorts()
      } else {
        toast.error(res.message || 'Failed to delete cohort')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete cohort')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await cohortsAPI.update(id, { status })
      if (res.success) {
        toast.success(`Cohort status updated to ${statusMapping[status] || status}`)
        fetchCohorts()
      } else {
        toast.error(res.message || 'Failed to update cohort status')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const getGradient = (index) => gradients[index % gradients.length]

  const filtered = cohortsList.filter(c => {
    const uiStatus = statusMapping[c.status] || c.status
    if (activeFilter === 'All') return true
    return uiStatus.toLowerCase() === activeFilter.toLowerCase()
  })

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
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <p className="text-gray-500 text-sm font-medium mb-3">No cohorts found</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="text-xs text-[#2563EB] font-bold hover:underline"
              >
                Create your first cohort now &rarr;
              </button>
            </div>
          ) : (
            /* Cohorts grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {filtered.map((cohort, index) => {
                const grad = getGradient(index)
                const uiStatus = statusMapping[cohort.status] || cohort.status
                return (
                  <div
                    key={cohort.id}
                    onClick={() => navigate(`/admin/cohorts/${cohort.id}`)}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full justify-between"
                  >
                    {/* Banner */}
                    <div style={{
                      background: `linear-gradient(135deg, ${grad.bgFrom}, ${grad.bgTo})`,
                      height: '112px', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                      <span style={{ color: 'white', fontSize: '28px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', padding: '0 12px' }}>
                        {cohort.name}
                      </span>
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyles[uiStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {uiStatus}
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
                          <CardMenu 
                            cohort={cohort} 
                            onClose={() => setOpenMenu(null)} 
                            onDelete={handleDelete}
                            onUpdateStatus={handleUpdateStatus}
                          />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{cohort.name}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-3"
                          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {cohort.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-1 pt-3 border-t border-gray-100 mt-auto">
                        {[
                          { label: 'Students', value: cohort.max_students || 0 }, // We can fall back to max_students or dynamic counts later
                          { label: 'Start Date', value: cohort.start_date ? new Date(cohort.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A' },
                          { label: 'End Date', value: cohort.end_date ? new Date(cohort.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A' },
                          { label: 'Capacity', value: cohort.max_students || 250 },
                        ].map(({ label, value }) => (
                          <div key={label} className="text-center">
                            <p className="text-xs font-bold text-gray-800 truncate" title={value}>{value}</p>
                            <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <CreateCohortModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={fetchCohorts} />
    </div>
  )
}