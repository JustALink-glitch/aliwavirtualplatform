import { useState } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Video, Calendar, Clock, Users, Plus, X, ExternalLink } from 'lucide-react'

const sessions = [
  { id: 1, title: 'Introduction to Python', course: 'Data Analytics', date: 'Apr 1, 2026', time: '4:30 PM', duration: '1hr 30mins', students: 48, status: 'Completed', recording: true },
  { id: 2, title: 'Data Cleaning with Pandas', course: 'Data Analytics', date: 'Apr 8, 2026', time: '4:30 PM', duration: '1hr 30mins', students: 45, status: 'Completed', recording: true },
  { id: 3, title: 'SQL Fundamentals', course: 'Data Analytics', date: 'Apr 15, 2026', time: '4:30 PM', duration: '1hr 30mins', students: 50, status: 'Live', recording: false },
  { id: 4, title: 'Data Visualization', course: 'Data Analytics', date: 'Apr 22, 2026', time: '4:30 PM', duration: '1hr 30mins', students: 0, status: 'Upcoming', recording: false },
  { id: 5, title: 'Advanced Analytics', course: 'Data Analytics', date: 'Apr 29, 2026', time: '4:30 PM', duration: '1hr 30mins', students: 0, status: 'Upcoming', recording: false },
  { id: 6, title: 'Final Project Review', course: 'Data Analytics', date: 'May 6, 2026', time: '4:30 PM', duration: '2hrs', students: 0, status: 'Upcoming', recording: false },
]

const statusStyles = {
  Live: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-50 text-blue-600',
  Upcoming: 'bg-gray-100 text-gray-500',
}

function ScheduleSessionModal({ onClose }) {
  const [form, setForm] = useState({
    title: '', date: '', time: '', duration: '', description: '',
    recurring: false, frequency: 'weekly', repeatOn: [], endType: 'date', endDate: '', occurrences: '8'
  })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      repeatOn: prev.repeatOn.includes(day)
        ? prev.repeatOn.filter(d => d !== day)
        : [...prev.repeatOn, day]
    }))
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-bold text-gray-800">Schedule a Session</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SESSION TITLE <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. Introduction to Python"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">DATE <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={form.date} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">TIME <span className="text-red-500">*</span></label>
              <input type="time" name="time" value={form.time} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DURATION</label>
            <select name="duration" value={form.duration} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
              <option value="">Select duration</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>1hr 30mins</option>
              <option>2 hours</option>
            </select>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-2 border border-gray-100 rounded-xl px-4">
            <div>
              <p className="text-xs font-semibold text-gray-700">Recurring Session</p>
              <p className="text-[11px] text-gray-400">Repeat this session automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.recurring}
                onChange={() => setForm(prev => ({ ...prev, recurring: !prev.recurring }))}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>

          {/* Recurring options */}
          {form.recurring && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">FREQUENCY</label>
                <select name="frequency" value={form.frequency} onChange={handle}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] text-gray-600 bg-white">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Repeat on days */}
              {(form.frequency === 'weekly' || form.frequency === 'biweekly') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">REPEAT ON</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {days.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                          form.repeatOn.includes(day)
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* End condition */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">ENDS</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="endType" value="date" checked={form.endType === 'date'}
                      onChange={handle} className="accent-[#2563EB]" />
                    <span className="text-xs text-gray-600">On a specific date</span>
                  </label>
                  {form.endType === 'date' && (
                    <input type="date" name="endDate" value={form.endDate} onChange={handle}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] text-gray-600 bg-white ml-5" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="endType" value="occurrences" checked={form.endType === 'occurrences'}
                      onChange={handle} className="accent-[#2563EB]" />
                    <span className="text-xs text-gray-600">After number of sessions</span>
                  </label>
                  {form.endType === 'occurrences' && (
                    <div className="flex items-center gap-2 ml-5">
                      <input type="number" name="occurrences" value={form.occurrences} onChange={handle}
                        className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] bg-white" />
                      <span className="text-xs text-gray-500">sessions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
            <textarea name="description" value={form.description} onChange={handle} rows={2}
              placeholder="What will be covered in this session..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>

          {/* Zoom note */}
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
            <p className="text-xs text-green-700 font-medium">
              🎥 A Zoom meeting link will be automatically generated and shared with all enrolled students.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
              {form.recurring ? 'Schedule Recurring' : 'Schedule Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StartClassModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-green-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-800 mb-1">Start Live Class</h2>
        <p className="text-xs text-gray-500 mb-2">SQL Fundamentals · Data Analytics</p>
        <p className="text-xs text-gray-400 mb-5">
          This will start your Zoom session and notify all 52 enrolled students to join.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Session</p>
            <p className="text-xs font-semibold text-gray-700">SQL Fundamentals</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-xs font-semibold text-gray-700">4:30 PM Today</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Students</p>
            <p className="text-xs font-semibold text-gray-700">52 enrolled</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Zoom Link</p>
            <p className="text-xs font-semibold text-[#2563EB]">Auto-generated</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
          <button onClick={onClose}
            className="flex-1 bg-green-500 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-green-600 flex items-center justify-center gap-2">
            <ExternalLink size={14} /> Launch Zoom
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrainerSessionsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [showSchedule, setShowSchedule] = useState(false)
  const [showStartClass, setShowStartClass] = useState(false)

  const tabs = ['All', 'Live', 'Upcoming', 'Completed']

  const filtered = sessions.filter(s =>
    activeTab === 'All' || s.status === activeTab
  )

  const liveSession = sessions.find(s => s.status === 'Live')

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage and track all your live classes</p>
            </div>
            <button onClick={() => setShowSchedule(true)}
              className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition">
              <Plus size={14} /> Schedule Session
            </button>
          </div>

          {/* Live class banner */}
          {liveSession && (
            <div className="bg-green-500 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">● LIVE NOW</span>
                  </div>
                  <p className="text-sm font-bold">{liveSession.title}</p>
                  <p className="text-xs text-white/80">{liveSession.course} · {liveSession.time} · {liveSession.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-white/70">Students joined</p>
                  <p className="text-xl font-bold">{liveSession.students}</p>
                </div>
                <button onClick={() => setShowStartClass(true)}
                  className="flex items-center gap-2 bg-white text-green-600 text-sm font-bold rounded-xl px-5 py-2.5 hover:bg-green-50 transition">
                  <ExternalLink size={15} /> Join Class
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: '48', icon: Video, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Completed', value: '42', icon: Calendar, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Upcoming', value: '3', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Avg Attendance', value: '87%', icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-1">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Session', 'Date', 'Time', 'Duration', 'Attendance', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-gray-800">{session.title}</p>
                      <p className="text-[10px] text-gray-400">{session.course}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.date}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.time}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{session.duration}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {session.status === 'Upcoming' ? '--' : `${session.students} students`}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[session.status]}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {session.status === 'Live' && (
                        <button onClick={() => setShowStartClass(true)}
                          className="text-xs bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
                          <ExternalLink size={11} /> Join
                        </button>
                      )}
                      {session.status === 'Upcoming' && (
                        <button className="text-xs text-[#2563EB] font-semibold hover:underline">
                          Edit
                        </button>
                      )}
                      {session.status === 'Completed' && session.recording && (
                        <button className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                          <Video size={11} /> Recording
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSchedule && <ScheduleSessionModal onClose={() => setShowSchedule(false)} />}
      {showStartClass && <StartClassModal onClose={() => setShowStartClass(false)} />}
    </div>
  )
}