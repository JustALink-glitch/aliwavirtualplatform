import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { BookOpen, Video, ClipboardList, Star, ChevronRight, ExternalLink } from 'lucide-react'

const recentAssignments = [
  { id: 1, title: 'Hero Section Design', due: 'Apr 15, 2026', status: 'Submitted', grade: '85/100', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 2, title: 'Navigation Bar Component', due: 'Apr 20, 2026', status: 'Pending', grade: '--', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 3, title: 'Responsive Layout', due: 'Apr 25, 2026', status: 'Not submitted', grade: '--', color: 'bg-gray-100 text-gray-500 border-gray-200' },
]

const upcomingSessions = [
  { time: '4:30 PM', course: 'Data Analytics', lesson: 'Lesson 4 · Module 2', status: 'Today', isLive: true },
  { time: '4:30 PM', course: 'Data Analytics', lesson: 'Lesson 5 · Module 2', status: 'Tomorrow', isLive: false },
  { time: '4:30 PM', course: 'Data Analytics', lesson: 'Lesson 6 · Module 2', status: 'Apr 22', isLive: false },
]

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg, #2563EB, #6366f1)' }} className="rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold mb-1">Good Morning, Michael! 👋</h1>
              <p className="text-sm text-white/80">You have a live class today at 4:30 PM — don't miss it!</p>
              <p className="text-xs text-white/60 mt-1">Data Analytics · Cohort 1</p>
            </div>
            <button onClick={() => navigate('/student/sessions')}
              className="flex items-center gap-2 bg-white text-[#2563EB] text-sm font-bold rounded-xl px-5 py-2.5 hover:bg-blue-50 transition flex-shrink-0">
              <ExternalLink size={15} /> Join Class
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Course Progress', value: '48%', icon: BookOpen, bg: 'bg-blue-50', color: 'text-[#2563EB]', sub: 'Keep going!' },
              { label: 'Sessions Attended', value: '22/48', icon: Video, bg: 'bg-green-50', color: 'text-green-600', sub: 'This cohort' },
              { label: 'Assignments', value: '8/12', icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-600', sub: '4 pending' },
              { label: 'Current Grade', value: 'B+', icon: Star, bg: 'bg-purple-50', color: 'text-purple-600', sub: 'Above average' },
            ].map(({ label, value, icon: Icon, bg, color, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Course progress bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Data Analytics</h2>
                <p className="text-xs text-gray-400 mt-0.5">Cohort 1 · Abdulhameed Olamilekan</p>
              </div>
              <button onClick={() => navigate('/student/course')}
                className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                View Course <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="bg-[#2563EB] h-3 rounded-full transition-all" style={{ width: '48%' }} />
              </div>
              <span className="text-sm font-bold text-gray-700">48%</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Lessons Completed', value: '22/48' },
                { label: 'Assignments Done', value: '8/12' },
                { label: 'Avg Score', value: '82%' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Recent Assignments */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Recent Assignments</h2>
                <button onClick={() => navigate('/student/assignments')}
                  className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAssignments.map(({ id, title, due, status, grade, color }) => (
                  <div key={id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Due: {due}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-700">{grade}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="w-full lg:w-[280px] lg:flex-shrink-0 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Upcoming Sessions</h2>
                <button onClick={() => navigate('/student/sessions')}
                  className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {upcomingSessions.map(({ time, course, lesson, status, isLive }, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800">{time}</p>
                        {isLive && (
                          <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">LIVE</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{course}</p>
                      <p className="text-[10px] text-gray-400">{lesson}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{status}</p>
                  </div>
                ))}
              </div>
              {upcomingSessions.some(s => s.isLive) && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <button className="w-full bg-green-500 text-white text-xs font-bold rounded-lg py-2 hover:bg-green-600 flex items-center justify-center gap-2">
                    <ExternalLink size={13} /> Join Live Class Now
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}