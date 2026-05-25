import { useState, useEffect } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import ZoomMeeting from '../../components/common/ZoomMeeting'
import PreMeetingCheck from '../../components/student/PreMeetingCheck'
import { Video, Calendar, CheckCircle, ExternalLink, Play } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sessionsAPI } from '../../services'
import toast from 'react-hot-toast'

const statusStyles = {
  live: 'bg-green-150 text-green-700',
  attended: 'bg-blue-50 text-blue-600',
  missed: 'bg-red-50 text-red-500',
  upcoming: 'bg-gray-100 text-gray-500',
}

function JoinModal({ session, onClose }) {
  const handleJoin = () => {
    toast.success('Attendance recorded! Opening live session Zoom link...')
    onClose()
    if (session.zoom_link) {
      window.open(session.zoom_link, '_blank', 'noopener,noreferrer')
    } else {
      window.open('https://zoom.us', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
          <Video size={24} className="text-green-600 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Join Live Class</h2>
          <p className="text-xs text-gray-400 mt-0.5">{session.title}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
          {[
            { label: 'Session Name', value: session.title },
            { label: 'Date scheduled', value: session.date || 'Today' },
            { label: 'Time', value: session.time || '4:30 PM' },
            { label: 'Duration', value: session.duration || '1hr 30mins' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <p className="text-gray-400">{label}</p>
              <p className="font-bold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <p className="text-[11px] text-blue-700 font-bold">
            Your attendance will be automatically logged in Supabase database on launch.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleJoin} className="flex-1 bg-green-500 text-white text-xs font-bold rounded-lg py-2 hover:bg-green-600 transition flex items-center justify-center gap-1.5 shadow-sm">
            <ExternalLink size={13} /> Join Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudentSessionsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [preCheckSession, setPreCheckSession] = useState(null)
  const [joinSession, setJoinSession] = useState(null)

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const getSessionStatus = (session) => {
    if (session.status === 'attended' || session.status === 'missed') return session.status

    const scheduled = new Date(session.scheduled_at)
    const now = new Date()
    let durationHours = 1
    if (session.duration) {
      const match = session.duration.match(/([0-9.]+)/)
      if (match) durationHours = parseFloat(match[1])
    }
    const endsAt = new Date(scheduled.getTime() + durationHours * 60 * 60 * 1000)

    if (now >= scheduled && now <= endsAt) return 'live'
    if (now > endsAt) return 'missed'
    return 'upcoming'
  }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await sessionsAPI.list()
      if (res.success || res.sessions) {
        const rawSessions = res.sessions || res || []
        // Format & filter by student cohort if assigned
        const studentCohortId = user?.cohort_id
        const list = rawSessions.filter(s => {
          if (!studentCohortId) return true
          return !s.cohort_id || s.cohort_id === studentCohortId
        }).map(s => {
          let status = getSessionStatus(s)
          return {
            ...s,
            status,
            date: s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : '',
            time: s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          }
        })
        setSessions(list)
      }
    } catch (err) {
      toast.error('Failed to load live sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [user])

  const tabs = ['All', 'Live', 'Upcoming', 'Attended']
  const liveSession = sessions.find(s => s.status === 'live')

  const filtered = sessions.filter(s =>
    activeTab === 'All' || s.status === activeTab.toLowerCase()
  )

  const attendedCount = sessions.filter(s => s.status === 'attended').length
  const totalCount = sessions.length
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 100

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Live Sessions</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track and launch live video classrooms</p>
          </div>

          {/* Live banner */}
          {liveSession && (
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-[9px] font-black bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">● LIVE NOW</span>
                  <p className="text-sm font-bold mt-0.5">{liveSession.title}</p>
                  <p className="text-xs text-white/90">
                    {liveSession.time || 'Ongoing'} · {liveSession.duration || '1hr 30mins'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 max-w-[180px] hidden md:block">
                  <p className="text-[10px] text-white/90 font-bold">Attendance logged on join ✓</p>
                </div>
                <button onClick={() => setPreCheckSession(liveSession)}
                  className="flex items-center gap-1.5 bg-white text-green-600 text-xs font-black rounded-xl px-5 py-2.5 hover:bg-green-50 shadow-sm transition">
                  <Play size={12} fill="currentColor" /> Join Now
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Scheduled Sessions', value: loading ? '-' : totalCount, icon: Video, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Attended Sessions', value: loading ? '-' : attendedCount, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Roster Attendance Rate', value: loading ? '-' : `${attendanceRate}%`, icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
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

          {/* Sessions table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-[#2563EB] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-150'
                    }`}>
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12 font-bold">No sessions found for this status.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {['Session', 'Date', 'Time', 'Duration', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map(session => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-gray-800">{session.title}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-semibold">{session.date || 'Flexible'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-semibold">{session.time || '4:30 PM'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-semibold">{session.duration || '1hr 30mins'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${statusStyles[session.status] || 'bg-gray-100 text-gray-500'}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
          {session.status === 'live' && session.zoom_link && (
            <button onClick={() => setPreCheckSession(session)}
              className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition">
              <ExternalLink size={11} /> Launch Class
            </button>
          )}
          {session.status === 'live' && !session.zoom_link && (
            <span className="text-xs text-gray-400 font-bold">No meeting link</span>
          )}
                          {session.status === 'attended' && (
                            <span className="text-xs text-green-600 font-bold">Attended ✓</span>
                          )}
                          {session.status === 'upcoming' && (
                            <span className="text-xs text-gray-400 font-bold">Scheduled</span>
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
      </div>

      {/* Embedded Zoom Meeting — opens fullscreen over the page */}
      {joinSession && (
        <ZoomMeeting
          session={joinSession}
          currentUser={user}
          onClose={() => setJoinSession(null)}
        />
      )}

      {/* Pre-Meeting System Check Modal */}
      {preCheckSession && (
        <PreMeetingCheck
          session={preCheckSession}
          currentUser={user}
          onClose={() => setPreCheckSession(null)}
          onProceed={() => {
            if (preCheckSession.zoom_meeting_id) {
              setJoinSession(preCheckSession)
            } else if (preCheckSession.zoom_link) {
              window.open(preCheckSession.zoom_link, '_blank', 'noopener,noreferrer')
            } else {
              toast.error('No meeting link has been added for this live session.')
            }
            setPreCheckSession(null)
          }}
        />
      )}
    </div>
  )
}
