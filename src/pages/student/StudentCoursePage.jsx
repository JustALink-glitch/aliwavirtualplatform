import { useState } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { BookOpen, Video, FileText, Link as LinkIcon, CheckCircle, Lock, Play } from 'lucide-react'

const tabs = ['Overview', 'Lessons', 'Resources', 'Assignments']

const lessons = [
  { id: 1, title: 'Introduction to Data Analytics', duration: '45 mins', type: 'Lesson', completed: true },
  { id: 2, title: 'Setting up Python Environment', duration: '30 mins', type: 'Lesson', completed: true },
  { id: 3, title: 'Data Types and Variables', duration: '50 mins', type: 'Lesson', completed: true },
  { id: 4, title: 'Introduction to Pandas', duration: '1hr', type: 'Live Class', completed: false, current: true },
  { id: 5, title: 'Data Cleaning Techniques', duration: '45 mins', type: 'Lesson', completed: false },
  { id: 6, title: 'SQL Fundamentals', duration: '1hr 30mins', type: 'Live Class', completed: false },
  { id: 7, title: 'Data Visualization Basics', duration: '50 mins', type: 'Lesson', completed: false },
]

const resources = [
  { id: 1, name: 'Week 1 Lecture Slides', type: 'PDF', size: '2.4 MB', date: 'Apr 1, 2026' },
  { id: 2, name: 'Week 1 Recording', type: 'Video', size: '245 MB', date: 'Apr 2, 2026' },
  { id: 3, name: 'Python Cheat Sheet', type: 'PDF', size: '1.1 MB', date: 'Apr 3, 2026' },
  { id: 4, name: 'Kaggle Dataset Link', type: 'Link', size: '--', date: 'Apr 5, 2026' },
  { id: 5, name: 'Week 2 Recording', type: 'Video', size: '312 MB', date: 'Apr 8, 2026' },
]

const assignments = [
  { id: 1, title: 'Hero Section Design', due: 'Apr 15, 2026', status: 'Submitted', grade: '85/100' },
  { id: 2, title: 'Navigation Bar Component', due: 'Apr 20, 2026', status: 'Pending', grade: '--' },
  { id: 3, title: 'Responsive Layout', due: 'Apr 25, 2026', status: 'Not Submitted', grade: '--' },
]

const typeStyles = {
  PDF: { bg: 'bg-red-50', color: 'text-red-500', icon: FileText },
  Video: { bg: 'bg-purple-50', color: 'text-purple-500', icon: Video },
  Link: { bg: 'bg-blue-50', color: 'text-blue-500', icon: LinkIcon },
}

const assignmentStyles = {
  'Submitted': 'bg-green-50 text-green-700 border border-green-200',
  'Pending': 'bg-blue-50 text-blue-600 border border-blue-200',
  'Not Submitted': 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function StudentCoursePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  const completed = lessons.filter(l => l.completed).length
  const progress = Math.round((completed / lessons.length) * 100)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Course banner */}
          <div className="rounded-2xl overflow-hidden border border-gray-100">
            <div style={{ background: 'linear-gradient(135deg, #60a5fa, #6366f1)', height: '110px' }} />
            <div className="bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-gray-900">Data Analytics</h1>
                    <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-200">Active</span>
                  </div>
                  <p className="text-xs text-gray-500">Data analysis fundamentals with Python, Pandas, SQL and Visualization.</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>👨‍🏫 Abdulhameed Olamilekan</span>
                    <span>📚 Cohort 1</span>
                    <span>📅 Jan 1 → Mar 31, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Progress', value: `${progress}%`, icon: BookOpen, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Lessons Done', value: `${completed}/${lessons.length}`, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Assignments', value: '8/12', icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Avg Score', value: '82%', icon: Video, bg: 'bg-purple-50', color: 'text-purple-600' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={15} className={color} />
                </div>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center border-b border-gray-100 px-4">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* OVERVIEW */}
              {activeTab === 'Overview' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700">Course Progress</p>
                      <span className="text-xs font-bold text-[#2563EB]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-[#2563EB] h-3 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Next Lesson</p>
                      <p className="text-sm font-bold text-gray-800">Introduction to Pandas</p>
                      <p className="text-xs text-gray-400 mt-0.5">Lesson 4 · Live Class · Today 4:30 PM</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Trainer</p>
                      <p className="text-sm font-bold text-gray-800">Abdulhameed Olamilekan</p>
                      <p className="text-xs text-gray-400 mt-0.5">Data Analytics Expert</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Pending Assignments</p>
                      <p className="text-2xl font-bold text-amber-500">4</p>
                      <p className="text-xs text-amber-400 mt-0.5">Due this week</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Attendance Rate</p>
                      <p className="text-2xl font-bold text-green-600">76%</p>
                      <p className="text-xs text-green-400 mt-0.5">22 of 29 sessions</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LESSONS */}
              {activeTab === 'Lessons' && (
                <div className="space-y-2">
                  {lessons.map((lesson, i) => (
                    <div key={lesson.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        lesson.current ? 'border-[#2563EB] bg-blue-50' :
                        lesson.completed ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white'
                      }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        lesson.completed ? 'bg-green-100' :
                        lesson.current ? 'bg-[#2563EB]' : 'bg-gray-100'
                      }`}>
                        {lesson.completed ? <CheckCircle size={16} className="text-green-600" /> :
                         lesson.current ? <Play size={14} className="text-white" /> :
                         <Lock size={14} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${lesson.current ? 'text-[#2563EB]' : 'text-gray-800'}`}>
                          Lesson {lesson.id} · {lesson.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{lesson.type} · {lesson.duration}</p>
                      </div>
                      {lesson.current && (
                        <span className="text-[10px] font-bold bg-[#2563EB] text-white px-2 py-0.5 rounded-full">Current</span>
                      )}
                      {lesson.completed && (
                        <span className="text-[10px] font-semibold text-green-600">Completed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* RESOURCES */}
              {activeTab === 'Resources' && (
                <div className="overflow-x-auto">
<table className="w-full min-w-[400px]">
  <thead>
    <tr className="bg-gray-50">
      {['Resource', 'Type', 'Size', 'Date'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resources.map(r => {
                      const TypeIcon = typeStyles[r.type]?.icon || FileText
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg ${typeStyles[r.type]?.bg} flex items-center justify-center`}>
                                <TypeIcon size={13} className={typeStyles[r.type]?.color} />
                              </div>
                              <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[r.type]?.bg} ${typeStyles[r.type]?.color}`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.size}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                </div>
              )}

              {/* ASSIGNMENTS */}
              {activeTab === 'Assignments' && (
                <div className="overflow-x-auto">
<table className="w-full min-w-[400px]">
  <thead>
    <tr className="bg-gray-50">
      {['Assignment', 'Due date', 'Grade', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {assignments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-800">{a.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{a.due}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-700">{a.grade}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${assignmentStyles[a.status]}`}>
                            {a.status}
                          </span>
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
      </div>
    </div>
  )
}