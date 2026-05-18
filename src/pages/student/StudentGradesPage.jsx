import { useState, useEffect } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { Star, TrendingUp, Award, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { coursesAPI, assignmentsAPI, submissionsAPI } from '../../services'
import toast from 'react-hot-toast'

function getLetterGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'text-green-600' }
  if (score >= 80) return { grade: 'B', color: 'text-blue-600' }
  if (score >= 70) return { grade: 'C', color: 'text-amber-600' }
  if (score >= 60) return { grade: 'D', color: 'text-orange-500' }
  return { grade: 'F', color: 'text-red-500' }
}

function FeedbackModal({ submission, onClose }) {
  const score = parseFloat(submission.grade) || 0
  const maxPoints = submission.assignment?.total_points || 100
  const percentScore = Math.round((score / maxPoints) * 100)
  const { grade: letter, color } = getLetterGrade(percentScore)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Grade Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Grade display */}
        <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
          <p className={`text-5xl font-black ${color}`}>{letter}</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{score} / {maxPoints}</p>
          <p className="text-xs text-gray-400 mt-1">{submission.assignment?.title || 'Course Task'}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs">
          {[
            { label: 'Evaluation Type', value: 'Assignment Task' },
            { label: 'Date Evaluated', value: submission.updated_at ? new Date(submission.updated_at).toLocaleDateString() : 'N/A' },
            { label: 'Percentage Score', value: `${percentScore}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-gray-400">{label}</p>
              <p className="font-bold text-gray-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Trainer Feedback</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800 leading-relaxed font-semibold">
              {submission.feedback ? `"${submission.feedback}"` : 'No written comments or feedback registered yet.'}
            </p>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition">
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
  
  const [gradedSubmissions, setGradedSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchGrades = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [coursesRes, submissionsRes] = await Promise.all([
        coursesAPI.list(),
        submissionsAPI.list({ studentId: user.id })
      ])

      const activeCourses = coursesRes.courses || coursesRes || []
      const subs = submissionsRes.submissions || []

      // Preload all assignments from all courses to map
      let allAssignments = []
      for (const course of activeCourses) {
        const asnRes = await assignmentsAPI.list({ courseId: course.id })
        if (asnRes.success || asnRes.assignments) {
          allAssignments.push(...(asnRes.assignments || []))
        }
      }

      // Map graded submissions to their assignments
      const graded = subs
        .filter(s => s.grade !== null)
        .map(s => {
          const matchAsn = allAssignments.find(a => a.id === s.assignment_id)
          const score = parseFloat(s.grade) || 0
          const maxPoints = matchAsn?.total_points || 100
          const percentScore = Math.round((score / maxPoints) * 100)
          return {
            ...s,
            percentScore,
            assignment: matchAsn
          }
        })

      setGradedSubmissions(graded)
    } catch (err) {
      toast.error('Failed to load graded evaluations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrades()
  }, [user])

  const filters = ['All', 'Evaluations']

  const filtered = gradedSubmissions

  // Calculations
  const scores = gradedSubmissions.map(g => g.percentScore)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highest = scores.length > 0 ? Math.max(...scores) : 0
  const lowest = scores.length > 0 ? Math.min(...scores) : 0
  const { grade: avgLetter, color: avgColor } = getLetterGrade(avgScore)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Performance Grades</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track your overall academic evaluations</p>
          </div>

          {/* Overall grade card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-xs text-gray-400 font-bold mb-1">Cumulative Score</p>
                <div className="flex items-end gap-3">
                  <p className={`text-5xl font-black ${avgColor}`}>{avgLetter}</p>
                  <p className="text-2xl font-bold text-gray-700 mb-1">{avgScore}%</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Based on {gradedSubmissions.length} graded items</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                {[
                  { label: 'Highest Grade', value: `${highest}%`, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Lowest Grade', value: `${lowest}%`, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'Graded Tasks', value: gradedSubmissions.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Average Score', value: `${avgScore}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center border border-white shadow-xs`}>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-bold">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500 font-bold">Grade Target Meter</span>
                <span className={`font-bold ${avgColor}`}>{avgScore}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#2563EB] h-3 rounded-full transition-all" style={{ width: `${avgScore}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-450 mt-1 font-semibold">
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Evaluation Registry</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12 font-bold">No graded items found yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {['Task Title', 'Submission Date', 'Score Rate', 'Grade', 'Action'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map(g => {
                      const { grade: letter, color } = getLetterGrade(g.percentScore)
                      return (
                        <tr key={g.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(g)}>
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-bold text-gray-800">{g.assignment?.title || 'Course Assignment'}</p>
                            <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[250px]">{g.assignment?.description}</p>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-600 font-semibold">
                            {g.updated_at ? new Date(g.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                                <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${g.percentScore}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{g.grade} pts</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-black ${color}`}>{letter}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button className="text-xs text-[#2563EB] font-bold hover:underline">
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && <FeedbackModal submission={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}