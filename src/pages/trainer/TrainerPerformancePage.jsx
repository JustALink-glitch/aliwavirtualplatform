import { useState } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { TrendingUp, Users, Star, Video, ChevronDown, Award } from 'lucide-react'

const weeklyData = [
  { week: 'Week 8', attendance: 82, engagement: 75, submissions: 88 },
  { week: 'Week 9', attendance: 85, engagement: 80, submissions: 90 },
  { week: 'Week 10', attendance: 79, engagement: 72, submissions: 85 },
  { week: 'Week 11', attendance: 91, engagement: 88, submissions: 94 },
  { week: 'Week 12', attendance: 94, engagement: 92, submissions: 96 },
]

const studentPerformance = [
  { name: 'Abdulhameed Olamilekan', attendance: 94, grade: 'A', assignments: '10/12', trend: 'up', color: 'bg-orange-400' },
  { name: 'Michael Kaine', attendance: 48, grade: 'D', assignments: '4/12', trend: 'down', color: 'bg-blue-500' },
  { name: 'Oyindamola', attendance: 76, grade: 'B', assignments: '9/12', trend: 'up', color: 'bg-red-400' },
  { name: 'Bewaji Daniels', attendance: 54, grade: 'C', assignments: '7/12', trend: 'down', color: 'bg-teal-500' },
  { name: 'Mojoyinola Rahman', attendance: 90, grade: 'A', assignments: '12/12', trend: 'up', color: 'bg-purple-500' },
]

const feedback = [
  { rating: 5, comment: 'Excellent teaching style, very clear explanations!', student: 'Abdulhameed O.', date: 'Apr 18, 2026' },
  { rating: 4, comment: 'Good class, would love more practical examples.', student: 'Rebecca E.', date: 'Apr 18, 2026' },
  { rating: 5, comment: 'Best instructor! Very patient and knowledgeable.', student: 'Mojoyinola R.', date: 'Apr 15, 2026' },
  { rating: 3, comment: 'Class was okay but pace was a bit fast.', student: 'Bewaji D.', date: 'Apr 15, 2026' },
]

function MiniBar({ value, color = 'bg-[#2563EB]' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}%</span>
    </div>
  )
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          style={{ color: i <= value ? '#f59e0b' : '#e5e7eb', fill: i <= value ? '#f59e0b' : '#e5e7eb' }} />
      ))}
    </div>
  )
}

export default function TrainerPerformancePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [period, setPeriod] = useState('This Month')
  const [showPeriod, setShowPeriod] = useState(false)

  const avgAttendance = Math.round(weeklyData.reduce((a, b) => a + b.attendance, 0) / weeklyData.length)
  const avgEngagement = Math.round(weeklyData.reduce((a, b) => a + b.engagement, 0) / weeklyData.length)
  const avgSubmissions = Math.round(weeklyData.reduce((a, b) => a + b.submissions, 0) / weeklyData.length)
  const avgRating = (feedback.reduce((a, b) => a + b.rating, 0) / feedback.length).toFixed(1)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Performance</h1>
              <p className="text-xs text-gray-400 mt-0.5">Your teaching metrics and student outcomes</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowPeriod(!showPeriod)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 bg-white">
                {period} <ChevronDown size={13} />
              </button>
              {showPeriod && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1 z-20">
                  {['This Week', 'This Month', 'This Cohort', 'All Time'].map(opt => (
                    <button key={opt} onClick={() => { setPeriod(opt); setShowPeriod(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium ${period === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: Users, bg: 'bg-blue-50', color: 'text-[#2563EB]', sub: 'Across all sessions' },
              { label: 'Avg Engagement', value: `${avgEngagement}%`, icon: TrendingUp, bg: 'bg-green-50', color: 'text-green-600', sub: 'Student participation' },
              { label: 'Submission Rate', value: `${avgSubmissions}%`, icon: Award, bg: 'bg-purple-50', color: 'text-purple-600', sub: 'Assignments submitted' },
              { label: 'Student Rating', value: `${avgRating}/5`, icon: Star, bg: 'bg-amber-50', color: 'text-amber-500', sub: 'From feedback forms' },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Weekly trend */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Weekly Trend</h2>
              <div className="space-y-4">
                {weeklyData.map(({ week, attendance, engagement, submissions }) => (
                  <div key={week}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">{week}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block" /> Attendance</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Engagement</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Submissions</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <MiniBar value={attendance} color="bg-[#2563EB]" />
                      <MiniBar value={engagement} color="bg-green-500" />
                      <MiniBar value={submissions} color="bg-purple-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student performance */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Student Performance</h2>
              <div className="space-y-3">
                {studentPerformance.map(({ name, attendance, grade, assignments, trend, color }) => (
                  <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${attendance >= 70 ? 'bg-green-500' : 'bg-red-400'}`}
                            style={{ width: `${attendance}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${attendance >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                          {attendance}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        grade === 'A' ? 'text-green-600' :
                        grade === 'B' ? 'text-blue-600' :
                        grade === 'C' ? 'text-amber-600' : 'text-red-500'
                      }`}>{grade}</p>
                      <p className="text-[9px] text-gray-400">{assignments}</p>
                    </div>
                    <div className={`flex-shrink-0 ${trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
                      <TrendingUp size={14} style={{ transform: trend === 'down' ? 'scaleY(-1)' : 'none' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student feedback */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Student Feedback</h2>
                <p className="text-xs text-gray-400 mt-0.5">From post-class feedback forms</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                <StarRating value={Math.round(parseFloat(avgRating))} />
                <span className="text-sm font-bold text-amber-700">{avgRating}</span>
                <span className="text-xs text-amber-600">avg rating</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {feedback.map(({ rating, comment, student, date }, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating value={rating} />
                    <span className="text-[10px] text-gray-400">{date}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">"{comment}"</p>
                  <p className="text-[10px] font-semibold text-gray-500">— {student}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}