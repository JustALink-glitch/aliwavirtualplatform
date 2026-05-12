import { useState } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { Video, Calendar, Clock, CheckCircle, ExternalLink, X } from 'lucide-react'

const sessions = [
  { id: 1, title: 'Introduction to Python', date: 'Apr 1, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Attended', recording: true },
  { id: 2, title: 'Data Cleaning with Pandas', date: 'Apr 8, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Attended', recording: true },
  { id: 3, title: 'SQL Fundamentals', date: 'Apr 15, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Live', recording: false },
  { id: 4, title: 'Data Visualization', date: 'Apr 22, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Upcoming', recording: false },
  { id: 5, title: 'Advanced Analytics', date: 'Apr 29, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Upcoming', recording: false },
  { id: 6, title: 'Final Project Review', date: 'May 6, 2026', time: '4:30 PM', duration: '2hrs', status: 'Upcoming', recording: false },
]

const statusStyles = {
  Live: 'bg-green-100 text-green-700',
  Attended: 'bg-blue-50 text-blue-600',
  Missed: 'bg-red-50 text-red-500',
  Upcoming: 'bg-gray-100 text-gray-500',
}

function JoinModal({ session, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-green-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-800 mb-1">Join Live Class</h2>
        <p className="text-xs text-gray-500 mb-5">{session.title} · Data Analytics</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-2">
          {[
            { label: 'Session', value: session.title },
            { label: 'Date', value: session.date },
            { label: 'Time', value: session.time },
            { label: 'Duration', value: session.duration },
            { label: 'Trainer', value: 'Abdulhameed Olamilekan' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5">
          <p className="text-xs text-blue-700 font-medium">
            Your attendance will be automatically recorded when you join.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose}
            className="flex-1 bg-green-500 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-green-600 flex items-center justify-center gap-2">
            <ExternalLink size={14} /> Join Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudentSessionsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [joinSession, setJoinSession] = useState(null)

  const tabs = ['All', 'Live', 'Upcoming', 'Attended']
  const liveSession = sessions.find(s => s.status === 'Live')

  const filtered = sessions.filter(s =>
    activeTab === 'All' || s.status === activeTab
  )

  const attended = sessions.filter(s => s.status === 'Attended').length
  const total = sessions.length

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track and join your live classes</p>
          </div>

          {/* Live banner */}
          {liveSession && (
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">● LIVE NOW</span>
                  <p className="text-sm font-bold mt-0.5">{liveSession.title}</p>
                  <p className="text-xs text-white/80">Data Analytics · {liveSession.time} · {liveSession.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 max-w-[180px]">
                  <p className="text-[10px] text-blue-700 font-medium">Attendance auto-recorded on join ✓</p>
                </div>
                <button onClick={() => setJoinSession(liveSession)}
                  className="flex items-center gap-2 bg-white text-green-600 text-sm font-bold rounded-xl px-5 py-2.5 hover:bg-green-50">
                  <ExternalLink size={15} /> Join Class
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Sessions', value: total, icon: Video, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Attended', value: attended, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Attendance Rate', value: `${Math.round((attended/total)*100)}%`, icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Sessions table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  {['Session', 'Date', 'Time', 'Duration', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-gray-800">{session.title}</p>
                      <p className="text-[10px] text-gray-400">Data Analytics</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.date}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.time}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.duration}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[session.status]}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {session.status === 'Live' && (
                        <button onClick={() => setJoinSession(session)}
                          className="text-xs bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
                          <ExternalLink size={11} /> Join
                        </button>
                      )}
                      {session.status === 'Attended' && session.recording && (
                        <button className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                          <Video size={11} /> Recording
                        </button>
                      )}
                      {session.status === 'Upcoming' && (
                        <span className="text-xs text-gray-400">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {joinSession && <JoinModal session={joinSession} onClose={() => setJoinSession(null)} />}
    </div>
  )
}