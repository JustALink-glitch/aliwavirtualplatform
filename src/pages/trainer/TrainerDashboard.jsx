import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Users, ClipboardList, TrendingUp, Video, ChevronRight } from 'lucide-react'

const gradingQueue = [
  { id: 1, name: 'Abdulhameed Olamilekan', assignment: 'Hero Section Design', studentId: 'STU-123', time: '20 minutes ago', color: 'bg-teal-500' },
  { id: 2, name: 'Michael Kaine', assignment: 'Hero Section Design', studentId: 'STU-123', time: '25 minutes ago', color: 'bg-blue-500' },
  { id: 3, name: 'David Adamawa', assignment: 'Hero Section Design', studentId: 'STU-123', time: '30 minutes ago', color: 'bg-orange-400' },
  { id: 4, name: 'James Taroro', assignment: 'Hero Section Design', studentId: 'STU-123', time: '1 hour ago', color: 'bg-red-400' },
  { id: 5, name: 'Talabi Tabitha', assignment: 'Hero Section Design', studentId: 'STU-123', time: '2 hours ago', color: 'bg-teal-400' },
  { id: 6, name: 'Rebecca Eliza', assignment: 'Hero Section Design', studentId: 'STU-123', time: '3 hours ago', color: 'bg-blue-400' },
  { id: 7, name: 'Leonard Parker', assignment: 'Hero Section Design', studentId: 'STU-123', time: '4 hours ago', color: 'bg-purple-500' },
]

const sessions = [
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 1, Module 2', status: 'Live', day: 'Today' },
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 2, Module 2', status: 'Upcoming', day: 'Today' },
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 2, Module 2', status: 'Upcoming', day: 'Today' },
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 2, Module 2', status: 'Upcoming', day: 'Today' },
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 2, Module 2', status: 'Upcoming', day: 'Today' },
  { time: '4:30 PM', course: 'Data & Data Analytics', lesson: 'Lesson 2, Module 2', status: 'Upcoming', day: 'Today' },
]

export default function TrainerDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Welcome banner */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Good Morning, Abdulhameed 👋</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                You have an upcoming session on 11th of April, 2026 by 3pm and 18 assignments to be graded
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/trainer/assignments')}
                className="bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition">
                Start grading
              </button>
              <button
                onClick={() => navigate('/trainer/sessions')}
                className="border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                View session
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: '248', sub: '21 At Risk Students', subColor: 'text-red-500', icon: '🎓', bg: 'bg-blue-50' },
              { label: 'Pending Grades', value: '5', sub: '3 overdue', subColor: 'text-red-500', icon: '📋', bg: 'bg-green-50' },
              { label: 'Avg Attendance', value: '94%', sub: 'View all →', subColor: 'text-[#2563EB]', icon: '👥', bg: 'bg-orange-50' },
              { label: 'Sessions this month', value: '15', sub: 'View all →', subColor: 'text-[#2563EB]', icon: '🎥', bg: 'bg-purple-50' },
            ].map(({ label, value, sub, subColor, icon, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className={`text-xs font-medium cursor-pointer hover:underline ${subColor}`}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Grading Queue */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Grading Queue</h2>
                  <p className="text-xs text-gray-400 mt-0.5">18 Assignments waiting</p>
                </div>
                <button onClick={() => navigate('/trainer/assignments')}
                  className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {gradingQueue.map(({ id, name, assignment, studentId, time, color }) => (
                  <div key={id} className="flex items-center justify-between px-5 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {name} <span className="text-gray-400 font-normal">· {assignment}</span>
                        </p>
                        <p className="text-[10px] text-gray-400">{studentId}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">{time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="w-full lg:w-[260px] lg:flex-shrink-0 bg-white rounded-xl border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Upcoming Sessions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Next 7 scheduled sessions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {sessions.map(({ time, course, lesson, status, day }, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800">{time}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{status}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 truncate mt-0.5">{course}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{lesson}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100">
                <button onClick={() => navigate('/trainer/sessions')}
                  className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                  Full Calendar <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}