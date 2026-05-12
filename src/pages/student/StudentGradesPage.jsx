import { useState } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { Star, TrendingUp, Award, X } from 'lucide-react'

const grades = [
  { id: 1, title: 'Hero Section Design', type: 'Assignment', date: 'Apr 12, 2026', grade: 85, total: 100, feedback: 'Great work! Clean design and good use of spacing. Could improve mobile responsiveness.' },
  { id: 2, title: 'Python Data Analysis', type: 'Assignment', date: 'Apr 4, 2026', grade: 92, total: 100, feedback: 'Excellent analysis! Very well structured code and clear visualizations.' },
  { id: 3, title: 'Week 1 Quiz', type: 'Quiz', date: 'Apr 3, 2026', grade: 78, total: 100, feedback: 'Good effort! Review the data types section for better understanding.' },
  { id: 4, title: 'Midterm Project', type: 'Project', date: 'Apr 10, 2026', grade: 88, total: 100, feedback: 'Solid project! Great use of Pandas. The visualization could be more detailed.' },
  { id: 5, title: 'Week 2 Quiz', type: 'Quiz', date: 'Apr 10, 2026', grade: 72, total: 100, feedback: 'Keep practicing SQL queries. You are improving!' },
]

const typeStyles = {
  Assignment: 'bg-blue-50 text-blue-600',
  Quiz: 'bg-purple-50 text-purple-600',
  Project: 'bg-amber-50 text-amber-600',
}

function getLetterGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'text-green-600' }
  if (score >= 80) return { grade: 'B', color: 'text-blue-600' }
  if (score >= 70) return { grade: 'C', color: 'text-amber-600' }
  if (score >= 60) return { grade: 'D', color: 'text-orange-500' }
  return { grade: 'F', color: 'text-red-500' }
}

function FeedbackModal({ grade, onClose }) {
  const { grade: letter, color } = getLetterGrade(grade.grade)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-800">Grade Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        {/* Grade display */}
        <div className="bg-gray-50 rounded-2xl p-5 text-center mb-5">
          <p className={`text-5xl font-black ${color}`}>{letter}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{grade.grade}/{grade.total}</p>
          <p className="text-xs text-gray-400 mt-1">{grade.title}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-5">
          {[
            { label: 'Type', value: grade.type },
            { label: 'Submitted', value: grade.date },
            { label: 'Score', value: `${grade.grade}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trainer Feedback</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800 leading-relaxed">"{grade.feedback}"</p>
            <p className="text-[10px] text-blue-500 mt-2">— Abdulhameed Olamilekan</p>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full mt-4 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  )
}

export default function StudentGradesPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const filters = ['All', 'Assignment', 'Quiz', 'Project']

  const filtered = grades.filter(g =>
    activeFilter === 'All' || g.type === activeFilter
  )

  const avgScore = Math.round(grades.reduce((a, b) => a + b.grade, 0) / grades.length)
  const highest = Math.max(...grades.map(g => g.grade))
  const lowest = Math.min(...grades.map(g => g.grade))
  const { grade: avgLetter, color: avgColor } = getLetterGrade(avgScore)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Grades</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track your academic performance</p>
          </div>

          {/* Overall grade card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Overall Grade</p>
                <div className="flex items-end gap-3">
                  <p className={`text-5xl font-black ${avgColor}`}>{avgLetter}</p>
                  <p className="text-2xl font-bold text-gray-700 mb-1">{avgScore}%</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on {grades.length} graded items</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Highest Score', value: `${highest}%`, color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
                  { label: 'Lowest Score', value: `${lowest}%`, color: 'text-red-500', bg: 'bg-red-50', icon: Award },
                  { label: 'Total Graded', value: grades.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Star },
                  { label: 'Avg Score', value: `${avgScore}%`, color: 'text-purple-600', bg: 'bg-purple-50', icon: TrendingUp },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Grade Progress</span>
                <span className={`font-bold ${avgColor}`}>{avgScore}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#2563EB] h-3 rounded-full transition-all" style={{ width: `${avgScore}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span>F</span>
                <span>D</span>
                <span>C</span>
                <span>B</span>
                <span>A</span>
              </div>
            </div>
          </div>

          {/* Grades list */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100">
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === f ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
  <thead>
    <tr className="bg-gray-50">
      {['Title', 'Type', 'Date', 'Score', 'Grade', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(g => {
                  const { grade: letter, color } = getLetterGrade(g.grade)
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelected(g)}>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-800">{g.title}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[g.type]}`}>
                          {g.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{g.date}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-[#2563EB] h-1.5 rounded-full"
                              style={{ width: `${g.grade}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{g.grade}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${color}`}>{letter}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-xs text-[#2563EB] font-semibold hover:underline">
                          View Feedback
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {selected && <FeedbackModal grade={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}