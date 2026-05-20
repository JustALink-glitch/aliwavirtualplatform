import { useState, useEffect } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Video, Calendar, Clock, Plus, X, ExternalLink, Trash2 } from 'lucide-react'
import { sessionsAPI, coursesAPI } from '../../services'
import toast from 'react-hot-toast'

const statusStyles = {
  live: 'bg-green-100 text-green-700 font-bold uppercase text-[9px]',
  completed: 'bg-blue-50 text-blue-600 font-bold uppercase text-[9px]',
  upcoming: 'bg-gray-100 text-gray-500 font-bold uppercase text-[9px]',
}

function ScheduleSessionModal({ onClose, onCreated }) {
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [form, setForm] = useState({
    title: '',
    course_id: '',
    date: '',
    time: '',
    duration: '1 hour',
    zoom_link: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        const res = await coursesAPI.list()
        if (res.success || res.courses) {
          setCourses(res.courses || res || [])
        }
      } catch (err) {
        toast.error('Failed to load courses')
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.course_id || !form.date || !form.time) {
      return toast.error('Please fill in all required fields')
    }

    try {
      setSubmitting(true)
      const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString()
      const zoomLink = form.zoom_link.trim()
      const meetingId = zoomLink.match(/\/j\/(\d+)/)?.[1] || ''

      const payload = {
        title: form.title,
        course_id: form.course_id,
        scheduled_at,
        duration: form.duration,
        zoom_link: zoomLink,
        zoom_meeting_id: meetingId,
      }

      const res = await sessionsAPI.create(payload)
      if (res.success || res.session) {
        toast.success('Live session scheduled successfully!')
        if (onCreated) onCreated()
        onClose()
      } else {
        toast.error(res.message || 'Failed to schedule session')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Schedule a Session</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">SESSION TITLE *</label>
          <input name="title" required value={form.title} onChange={handle} placeholder="e.g. Introduction to Python"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>

        {/* Course Select */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">SELECT COURSE *</label>
          {loadingCourses ? (
            <div className="text-[10px] text-gray-400">Loading courses...</div>
          ) : (
            <select name="course_id" required value={form.course_id} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold bg-white">
              <option value="">-- Choose Course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">DATE *</label>
            <input type="date" required name="date" value={form.date} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">TIME *</label>
            <input type="time" required name="time" value={form.time} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">DURATION</label>
          <select name="duration" value={form.duration} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold bg-white">
            <option>30 minutes</option>
            <option>1 hour</option>
            <option>1.5 hours</option>
            <option>2 hours</option>
            <option>3 hours</option>
          </select>
        </div>

        {/* Zoom Link optional */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">ZOOM LINK (leave blank to auto-generate)</label>
          <input name="zoom_link" value={form.zoom_link} onChange={handle} placeholder="https://zoom.us/j/..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2 hover:bg-blue-700 transition-colors">
            {submitting ? 'Scheduling...' : 'Schedule Class'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TrainerSessionsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSchedule, setShowSchedule] = useState(false)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await sessionsAPI.list()
      if (res.success || res.sessions) {
        setSessions(res.sessions || res || [])
      }
    } catch (err) {
      toast.error('Failed to retrieve class sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this session?')) return
    try {
      const res = await sessionsAPI.remove(id)
      if (res.success) {
        toast.success('Session cancelled and deleted!')
        fetchSessions()
      } else {
        toast.error(res.message || 'Failed to delete session')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  // Determine status dynamically
  const getSessionStatus = (session) => {
    const scheduled = new Date(session.scheduled_at)
    const now = new Date()
    
    // Parse duration (default 1 hour if not matched)
    let durationHours = 1
    if (session.duration) {
      const match = session.duration.match(/([0-9.]+)/)
      if (match) durationHours = parseFloat(match[1])
    }
    const endsAt = new Date(scheduled.getTime() + durationHours * 60 * 60 * 1000)

    if (now >= scheduled && now <= endsAt) return 'live'
    if (now > endsAt) return 'completed'
    return 'upcoming'
  }

  const processedSessions = sessions.map(s => ({
    ...s,
    derivedStatus: getSessionStatus(s)
  }))

  const filtered = processedSessions.filter(s =>
    activeTab === 'All' || s.derivedStatus.toLowerCase() === activeTab.toLowerCase()
  )

  const liveSession = processedSessions.find(s => s.derivedStatus === 'live')

  const stats = {
    total: processedSessions.length,
    completed: processedSessions.filter(s => s.derivedStatus === 'completed').length,
    upcoming: processedSessions.filter(s => s.derivedStatus === 'upcoming').length,
    live: processedSessions.filter(s => s.derivedStatus === 'live').length,
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Live Sessions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Schedule classes, launch Zoom sessions, and view history</p>
            </div>
            <button onClick={() => setShowSchedule(true)}
              className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-4 py-2 hover:bg-blue-700 transition shadow-sm">
              <Plus size={14} /> Schedule Session
            </button>
          </div>

          {/* Live session header alert */}
          {liveSession && (
            <div className="bg-green-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black bg-white text-green-700 px-2 py-0.5 rounded-full">● LIVE NOW</span>
                  </div>
                  <p className="text-sm font-extrabold">{liveSession.title}</p>
                  <p className="text-xs text-white/80 font-semibold">{liveSession.course?.name} · Scheduled for {new Date(liveSession.scheduled_at).toLocaleTimeString()}</p>
                </div>
              </div>
              <a href={liveSession.zoom_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-green-700 text-xs font-black rounded-xl px-5 py-2.5 hover:bg-green-50 transition shadow-sm">
                <ExternalLink size={15} /> Join Zoom Class
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: stats.total, icon: Video, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Completed Classes', value: stats.completed, icon: Calendar, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Upcoming Classes', value: stats.upcoming, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Live Now', value: stats.live, icon: Video, bg: 'bg-purple-50', color: 'text-purple-600' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-bold">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Sessions grid/table */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {['All', 'Live', 'Upcoming', 'Completed'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <Video className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold">No sessions found for this category</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Session Details', 'Date', 'Time', 'Duration', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map(session => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-bold text-gray-800">{session.title}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{session.course?.name}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">
                          {new Date(session.scheduled_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">
                          {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">{session.duration || '1 hour'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusStyles[session.derivedStatus]}`}>
                            {session.derivedStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {session.derivedStatus === 'live' && session.zoom_link && (
                              <a href={session.zoom_link} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
                                <ExternalLink size={11} /> Start Class
                              </a>
                            )}
                            {session.derivedStatus === 'upcoming' && session.zoom_link && (
                              <a href={session.zoom_link} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] border border-blue-100 bg-blue-50 text-[#2563EB] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                                <ExternalLink size={11} /> Meeting Link
                              </a>
                            )}
                            {!session.zoom_link && (
                              <span className="text-[10px] text-gray-400 font-bold">No meeting link</span>
                            )}
                            <button onClick={() => handleDeleteSession(session.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSchedule && (
        <ScheduleSessionModal
          onClose={() => setShowSchedule(false)}
          onCreated={fetchSessions}
        />
      )}
    </div>
  )
}
