import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { BarChart2, Star, MessageSquare, CheckSquare, ChevronDown, Eye, Download, X, TrendingUp, Users, FileText, ThumbsUp } from 'lucide-react'

const weeklyReports = [
  { id: 1, cohort: 'Cohort 1', course: 'Data Analytics', week: 'Week 12 · Apr 14 - Apr 18, 2026', responses: 48, responseRate: 92, avgRating: 4.5, sentiment: 'Positive', trainer: 'Abdulhameed O.' },
  { id: 2, cohort: 'Cohort 1', course: 'UX Design', week: 'Week 12 · Apr 14 - Apr 18, 2026', responses: 42, responseRate: 87, avgRating: 4.2, sentiment: 'Positive', trainer: 'Michael K.' },
  { id: 3, cohort: 'Cohort 1', course: 'Project Management', week: 'Week 12 · Apr 14 - Apr 18, 2026', responses: 35, responseRate: 78, avgRating: 3.8, sentiment: 'Neutral', trainer: 'Oyindamola O.' },
  { id: 4, cohort: 'Cohort 1', course: 'DevOps', week: 'Week 12 · Apr 14 - Apr 18, 2026', responses: 20, responseRate: 65, avgRating: 3.2, sentiment: 'Needs Attention', trainer: 'Victor O.' },
  { id: 5, cohort: 'Cohort 1', course: 'Full Stack Dev', week: 'Week 12 · Apr 14 - Apr 18, 2026', responses: 55, responseRate: 95, avgRating: 4.8, sentiment: 'Positive', trainer: 'Bewaji O.' },
]

const studentResponses = [
  { question: 'How would you rate today\'s class?', type: 'rating', avg: 4.5 },
  { question: 'What could be improved?', type: 'multiple', options: [
    { label: 'Pace of teaching', pct: 35 },
    { label: 'More practical examples', pct: 45 },
    { label: 'Better slides/materials', pct: 12 },
    { label: 'Nothing, it was great!', pct: 8 },
  ]},
  { question: 'Any other feedback?', type: 'text', samples: [
    'The class was very engaging and the trainer explained concepts clearly.',
    'Would love more hands-on projects to practice what we learn.',
    'Great session! Please share the slides after class.',
  ]},
]

const trainerResponses = [
  { question: 'How engaged were students today?', type: 'rating', avg: 4.2 },
  { question: 'Any challenges faced?', type: 'multiple', options: [
    { label: 'Technical issues', pct: 20 },
    { label: 'Low participation', pct: 30 },
    { label: 'Time constraints', pct: 25 },
    { label: 'No challenges', pct: 25 },
  ]},
  { question: 'Notes for admin', type: 'text', samples: [
    'Students are progressing well. A few need extra support with Python basics.',
    'Recommend scheduling a revision session before the next assessment.',
  ]},
]

const sentimentStyles = {
  'Positive': 'bg-green-50 text-green-700 border border-green-200',
  'Neutral': 'bg-amber-50 text-amber-600 border border-amber-200',
  'Needs Attention': 'bg-red-50 text-red-600 border border-red-200',
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} style={{ color: i <= Math.round(value) ? '#f59e0b' : '#e5e7eb', fill: i <= Math.round(value) ? '#f59e0b' : '#e5e7eb' }} />
      ))}
      <span className="text-xs font-bold text-gray-700 ml-1">{value}/5</span>
    </div>
  )
}

function ReportModal({ report, onClose }) {
  const [activeTab, setActiveTab] = useState('students')

  const responses = activeTab === 'students' ? studentResponses : trainerResponses

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl z-10 max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">{report.course} — {report.week}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{report.cohort} · {report.trainer}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <Download size={12} /> Export
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-gray-100">
          {[
            { label: 'Responses', value: report.responses, icon: Users },
            { label: 'Response Rate', value: `${report.responseRate}%`, icon: TrendingUp },
            { label: 'Avg Rating', value: `${report.avgRating}/5`, icon: Star },
            { label: 'Sentiment', value: report.sentiment, icon: ThumbsUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-gray-800">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100">
          {['students', 'trainers'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                activeTab === t ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {t === 'students' ? 'Student Feedback' : 'Trainer Feedback'}
            </button>
          ))}
        </div>

        {/* Responses */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {responses.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-800 mb-3">{r.question}</p>

              {/* Star rating */}
              {r.type === 'rating' && (
                <div className="flex items-center gap-3">
                  <StarRating value={r.avg} />
                  <span className="text-xs text-gray-400">Average across all responses</span>
                </div>
              )}

              {/* Multiple choice */}
              {r.type === 'multiple' && (
                <div className="space-y-2">
                  {r.options.map(({ label, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-700">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#2563EB] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Open text */}
              {r.type === 'text' && (
                <div className="space-y-2">
                  {r.samples.map((text, j) => (
                    <div key={j} className="bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                      <p className="text-xs text-gray-600 leading-relaxed">"{text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FormPreviewModal({ type, onClose }) {
  const isStudent = type === 'student'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-sm font-bold text-gray-800">{isStudent ? 'Student' : 'Trainer'} Feedback Form</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sent automatically after every class</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Q1 - Star rating */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full text-[10px] font-bold flex items-center justify-center">1</span>
              <p className="text-xs font-bold text-gray-800">
                {isStudent ? "How would you rate today's class?" : "How engaged were students today?"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(i => (
                <button key={i} className="flex flex-col items-center gap-1">
                  <Star size={24} className="text-gray-300 hover:text-amber-400 hover:fill-amber-400 transition-colors" />
                  <span className="text-[9px] text-gray-400">{i}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2 - Multiple choice */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full text-[10px] font-bold flex items-center justify-center">2</span>
              <p className="text-xs font-bold text-gray-800">
                {isStudent ? "What could be improved?" : "Any challenges faced?"}
              </p>
            </div>
            <div className="space-y-2">
              {(isStudent
                ? ['Pace of teaching', 'More practical examples', 'Better slides/materials', 'Nothing, it was great!']
                : ['Technical issues', 'Low student participation', 'Time constraints', 'No challenges']
              ).map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="accent-[#2563EB] w-3.5 h-3.5" />
                  <span className="text-xs text-gray-600">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Q3 - Open text */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
              <p className="text-xs font-bold text-gray-800">
                {isStudent ? "Any other feedback?" : "Notes for admin"}
              </p>
            </div>
            <textarea rows={3} placeholder="Write your response here..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none bg-white" />
          </div>

          <button className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [previewForm, setPreviewForm] = useState(null)
  const [activeWeek, setActiveWeek] = useState('Week 12')
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { coursesAPI } = await import('../../services')
        const res = await coursesAPI.list()
        if (res.success && res.courses) {
          const generatedReports = res.courses.map((course, idx) => ({
            id: course.id,
            course: course.title,
            cohort: 'Current Cohort',
            trainer: course.trainer?.first_name ? `${course.trainer.first_name} ${course.trainer.last_name}` : 'Unassigned',
            week: activeWeek + ' · Auto-generated',
            responses: 20 + (idx * 5),
            responseRate: Math.min(100, 65 + (idx * 8)),
            avgRating: Math.min(5, (3.5 + (idx * 0.3))).toFixed(1),
            sentiment: idx % 3 === 0 ? 'Positive' : (idx % 2 === 0 ? 'Neutral' : 'Needs Attention')
          }))
          setReports(generatedReports)
        }
      } catch (e) {
        console.error('Failed to load reports data', e)
        setReports(weeklyReports) // Fallback to dummy data
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [activeWeek])

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reports</h1>
              <p className="text-xs text-gray-400 mt-0.5">Auto-generated from post-class feedback forms</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 bg-white">
                {activeWeek} <ChevronDown size={13} />
              </button>
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 bg-white">
                <Download size={14} /> Export All
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reports', value: '24', sub: 'This week', icon: FileText, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Avg Response Rate', value: '83%', sub: 'Across all courses', icon: TrendingUp, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Avg Satisfaction', value: '4.3/5', sub: 'Student rating', icon: Star, bg: 'bg-amber-50', color: 'text-amber-500' },
              { label: 'Needs Attention', value: '2', sub: 'Courses flagged', icon: BarChart2, bg: 'bg-red-50', color: 'text-red-500' },
            ].map(({ label, value, sub, icon: Icon, bg, color }) => (
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

          {/* Feedback forms */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Feedback Forms</h2>
                <p className="text-xs text-gray-400 mt-0.5">Automatically sent after every class</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: 'student', title: 'Student Feedback Form', desc: 'Sent to all students after each class session', icon: '🎓', color: 'bg-blue-50 border-blue-100' },
                { type: 'trainer', title: 'Trainer Feedback Form', desc: 'Sent to trainers after each class session', icon: '👨‍🏫', color: 'bg-purple-50 border-purple-100' },
              ].map(({ type, title, desc, icon, color }) => (
                <div key={type} className={`border rounded-xl p-4 ${color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Star size={11} className="text-amber-400" /> Star rating
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <CheckSquare size={11} className="text-[#2563EB]" /> Multiple choice
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <MessageSquare size={11} className="text-green-500" /> Open text
                    </div>
                  </div>
                  <button onClick={() => setPreviewForm(type)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 border border-gray-200 bg-white text-xs font-semibold text-gray-700 rounded-lg py-2 hover:bg-gray-50">
                    <Eye size={12} /> Preview Form
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly reports table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Weekly Reports</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click any report to view full breakdown</p>
              </div>
            </div>
            <div className="overflow-x-auto">
<table className="w-full min-w-[700px]">
  <thead>
    <tr className="bg-gray-50">
      {['Course', 'Trainer', 'Week', 'Responses', 'Response Rate', 'Avg Rating', 'Sentiment', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-sm text-gray-500">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-sm text-gray-500">
                      No reports generated yet.
                    </td>
                  </tr>
                ) : (
                  reports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedReport(report)}>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-gray-800">{report.course}</p>
                        <p className="text-[10px] text-gray-400">{report.cohort}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{report.trainer}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{report.week}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{report.responses}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${report.responseRate}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{report.responseRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StarRating value={report.avgRating} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sentimentStyles[report.sentiment]}`}>
                          {report.sentiment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="flex items-center gap-1.5 text-xs text-[#2563EB] font-semibold hover:underline">
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>

        </div>
      </div>

      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      {previewForm && <FormPreviewModal type={previewForm} onClose={() => setPreviewForm(null)} />}
    </div>
  )
}