import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import CreateCourseModal from '../../components/admin/modals/CreateCourseModal'
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Archive, Trash2, Upload, BookOpen } from 'lucide-react'
import { coursesAPI } from '../../services'
import toast from 'react-hot-toast'

const statusStyles = {
  active: 'bg-green-100 text-green-700 font-semibold',
  archive: 'bg-gray-100 text-gray-500 font-semibold',
  draft: 'bg-amber-100 text-amber-600 font-semibold',
  Ongoing: 'bg-green-100 text-green-700 font-semibold',
  Paused: 'bg-amber-100 text-amber-700 font-semibold',
  Stopped: 'bg-red-100 text-red-700 font-semibold'
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

const cardGradients = [
  'linear-gradient(135deg, #60a5fa, #6366f1)',
  'linear-gradient(135deg, #c084fc, #ec4899)',
  'linear-gradient(135deg, #34d399, #14b8a6)',
  'linear-gradient(135deg, #fb923c, #f87171)',
  'linear-gradient(135deg, #22d3ee, #60a5fa)',
  'linear-gradient(135deg, #9ca3af, #6b7280)',
  'linear-gradient(135deg, #fbbf24, #fb923c)',
]

function CardMenu({ status, onClose, onView, onUpdateStatus, onDelete }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const formattedStatus = (status || '').toLowerCase()

  return (
    <div ref={ref} className="absolute right-2 top-8 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 z-30 font-[Manrope]" onClick={(e) => e.stopPropagation()}>
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left">
        <Eye size={13} className="text-gray-400" /> View Course
      </button>

      {formattedStatus === 'draft' || formattedStatus === 'paused' || formattedStatus === 'stopped' ? (
        <button 
          onClick={() => { onUpdateStatus('active'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <Upload size={13} className="text-blue-500" /> Publish Course
        </button>
      ) : formattedStatus === 'archive' ? (
        <button 
          onClick={() => { onUpdateStatus('active'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <Archive size={13} className="text-amber-500" /> Unarchive Course
        </button>
      ) : (
        <button 
          onClick={() => { onUpdateStatus('archive'); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left"
        >
          <Archive size={13} className="text-amber-500" /> Archive Course
        </button>
      )}

      <div className="mx-3 my-1 border-t border-gray-100" />
      <button 
        onClick={() => { onDelete(); onClose() }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 text-left"
      >
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
  const [coursesList, setCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await coursesAPI.list()
      if (res.success) {
        setCoursesList(res.courses || [])
      } else {
        toast.error(res.message || 'Failed to load courses')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while fetching courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated assignments and cohorts relationships will be broken.')) return
    try {
      const res = await coursesAPI.remove(id)
      if (res.success) {
        toast.success('Course deleted successfully!')
        fetchCourses()
      } else {
        toast.error(res.message || 'Failed to delete course')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete course')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await coursesAPI.update(id, { status })
      if (res.success) {
        toast.success(`Course updated to ${status}`)
        fetchCourses()
      } else {
        toast.error(res.message || 'Failed to update course')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update course')
    }
  }

  const tabs = [
    { label: 'All', count: coursesList.length },
    { label: 'Active', count: coursesList.filter(c => (c.status || '').toLowerCase() === 'active' || (c.status || '').toLowerCase() === 'ongoing').length },
    { label: 'Archive', count: coursesList.filter(c => (c.status || '').toLowerCase() === 'archive').length },
    { label: 'Draft', count: coursesList.filter(c => (c.status || '').toLowerCase() === 'draft').length },
  ]

  const filtered = coursesList.filter(c => {
    const statusLower = (c.status || '').toLowerCase()
    let matchTab = true
    if (activeTab === 'Active') {
      matchTab = statusLower === 'active' || statusLower === 'ongoing'
    } else if (activeTab === 'Archive') {
      matchTab = statusLower === 'archive'
    } else if (activeTab === 'Draft') {
      matchTab = statusLower === 'draft'
    }

    const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase())
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === label ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <p className="text-gray-500 text-sm font-medium mb-3">No courses found</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="text-xs text-[#2563EB] font-bold hover:underline"
              >
                Create your first course now &rarr;
              </button>
            </div>
          ) : (
            <>
              {/* GRID VIEW */}
              {view === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {filtered.map((course, i) => (
                    <div key={course.id}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
                      onClick={() => navigate(`/admin/courses/${course.id}`)}>

                      {/* Card banner */}
                      <div style={{ height: '80px', position: 'relative', background: cardGradients[i % cardGradients.length] }}>
                        <span className={`absolute top-2 left-2 text-[10px] px-2.5 py-0.5 rounded-full ${statusStyles[course.status] || 'bg-gray-100 text-gray-600'}`}>
                          {course.status || 'Draft'}
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
                              onUpdateStatus={(status) => handleUpdateStatus(course.id, status)}
                              onDelete={() => handleDelete(course.id)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 mb-1">{course.name}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed mb-3"
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {course.description || 'No description provided.'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{course.duration || 'Flexible duration'}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{course.category || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LIST VIEW */}
              {view === 'list' && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Course', 'Duration', 'Category', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">{h}</th>
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
                                {course.name ? course.name[0] : <BookOpen size={14} />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800">{course.name}</p>
                                <p className="text-[10px] text-gray-400 truncate max-w-[240px] font-medium">{course.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{course.duration || 'N/A'}</td>
                          <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{course.category || 'N/A'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[course.status] || 'bg-gray-100 text-gray-600'}`}>
                              {course.status || 'Draft'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal size={15} />
                            </button>
                            {openMenu === course.id && (
                              <CardMenu
                                status={course.status}
                                onClose={() => setOpenMenu(null)}
                                onView={() => { navigate(`/admin/courses/${course.id}`); setOpenMenu(null) }}
                                onUpdateStatus={(status) => handleUpdateStatus(course.id, status)}
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
            </>
          )}
        </div>
      </div>
      <CreateCourseModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={fetchCourses} />
    </div>
  )
}