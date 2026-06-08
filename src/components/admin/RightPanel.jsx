import { useState } from 'react'
import { Plus, UserPlus, GraduationCap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateCourseModal from './modals/CreateCourseModal'
import AssignTrainerModal from './modals/AssignTrainerModal'
import OnboardStudentModal from './modals/OnboardStudentModal'

const getSessionStatus = (session) => {
  if (session.status === 'completed') return 'Completed'
  if (session.status === 'live') return 'Live'

  const scheduled = new Date(session.scheduled_at)
  const durationStr = String(session.duration || '1 hour').toLowerCase()
  const match = durationStr.match(/([0-9.]+)/)
  const value = match ? parseFloat(match[1]) : 1
  const durationMs = durationStr.includes('minute') || durationStr.includes('min')
    ? value * 60 * 1000
    : value * 60 * 60 * 1000
  const endsAt = new Date(scheduled.getTime() + durationMs)
  const now = new Date()

  if (now >= scheduled && now <= endsAt) return 'Live'
  if (now > endsAt) return 'Completed'
  return 'Upcoming'
}

export default function RightPanel({ sessions: propSessions, students, trainers }) {
  const [modal, setModal] = useState(null)
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const navigate = useNavigate()

  const upcomingSessions = propSessions && propSessions.length > 0
    ? propSessions.slice(0, 5).map(s => {
        const date = new Date(s.scheduled_at)
        return {
          id: s.id,
          course: s.course?.name || s.title || 'Course Session',
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: date.toLocaleDateString(),
          status: getSessionStatus(s),
          trainerName: s.trainer ? `${s.trainer.first_name} ${s.trainer.last_name}` : 'Not assigned',
          zoomLink: s.zoom_link,
          zoomId: s.zoom_meeting_id,
          zoomPassword: s.zoom_password,
          duration: s.duration || '1 hour',
          description: s.description || 'No description provided.'
        }
      })
    : []

  // Combine active students and trainers to show in "Online Users"
  const onlineUsers = [
    ...(trainers || []).filter(t => t.status === 'active').slice(0, 2),
    ...(students || []).filter(s => s.status === 'active').slice(0, 3)
  ].map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    role: user.role === 'trainer' ? 'Trainer' : 'Student',
    course: user.course || 'General Curriculum',
    initials: `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase()
  }))

  return (
    <div className="w-full space-y-4">

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Quick actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => setModal('course')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Plus size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Create a Course</span>
          </button>

          <button
            onClick={() => setModal('trainer')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
              <UserPlus size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Assign Trainers</span>
          </button>

          <button
            onClick={() => setModal('student')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Onboard Students</span>
          </button>
        </div>
      </div>

      {/* Who is Online */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Who is Online</h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="space-y-3">
          {onlineUsers.length === 0 ? (
            <p className="text-xs text-gray-400 font-semibold py-4 text-center">No active users online.</p>
          ) : onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                <p className="text-[9px] text-[#2563EB] font-black uppercase tracking-wider">{user.role} · <span className="text-gray-400 capitalize font-medium">{user.course}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800">Upcoming Sessions</h3>
        <p className="text-[11px] text-gray-400 mb-3">Next 5 scheduled</p>
        <div className="space-y-2">
          {upcomingSessions.length === 0 ? (
            <p className="text-xs text-gray-400 font-semibold py-4">No scheduled sessions found on the server.</p>
          ) : upcomingSessions.map((session, i) => {
            const isExpanded = expandedSessionId === session.id
            return (
              <div key={session.id || i} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate uppercase leading-tight flex items-center gap-1">
                      {session.course}
                      {isExpanded ? <ChevronUp size={10} className="text-gray-400" /> : <ChevronDown size={10} className="text-gray-400" />}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{session.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-800">{session.time}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      session.status === 'Live'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2 text-[10px] text-gray-600 animate-fadeIn">
                    <p><strong className="text-gray-700">Host:</strong> {session.trainerName}</p>
                    <p><strong className="text-gray-700">Duration:</strong> {session.duration}</p>
                    {session.description && <p><strong className="text-gray-700">Description:</strong> {session.description}</p>}
                    {session.zoomId && <p><strong className="text-gray-700">Meeting ID:</strong> {session.zoomId}</p>}
                    {session.zoomPassword && <p><strong className="text-gray-700">Password:</strong> {session.zoomPassword}</p>}
                    {session.zoomLink ? (
                      <a
                        href={session.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline"
                      >
                        Join Class <ExternalLink size={10} />
                      </a>
                    ) : (
                      <p className="text-amber-600 font-semibold mt-1">No Zoom link generated yet.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/cohorts')}
            className="w-full text-xs text-[#2563EB] font-semibold hover:underline text-center">
            Full Calendar →
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateCourseModal isOpen={modal === 'course'} onClose={() => setModal(null)} />
      <AssignTrainerModal isOpen={modal === 'trainer'} onClose={() => setModal(null)} />
      <OnboardStudentModal isOpen={modal === 'student'} onClose={() => setModal(null)} />

    </div>
  )
}
