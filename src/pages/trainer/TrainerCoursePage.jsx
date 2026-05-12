import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { Users, Video, ClipboardList, BookOpen, Plus, MoreHorizontal, Upload, X, FileText, Link as LinkIcon } from 'lucide-react'

const tabs = ['Overview', 'Students', 'Assignments', 'Resources', 'Sessions']

const students = [
  { id: 'STU-001', name: 'Abdulhameed Olamilekan', attendance: 94, assignments: '10/12', grade: 'A', status: 'On track', color: 'bg-orange-400' },
  { id: 'STU-002', name: 'Michael Kaine', attendance: 48, assignments: '4/12', grade: 'D', status: 'At Risk', color: 'bg-blue-500' },
  { id: 'STU-003', name: 'Oyindamola', attendance: 76, assignments: '9/12', grade: 'B', status: 'On track', color: 'bg-red-400' },
  { id: 'STU-004', name: 'Bewaji Daniels', attendance: 54, assignments: '7/12', grade: 'C', status: 'At Risk', color: 'bg-teal-500' },
  { id: 'STU-005', name: 'Mojoyinola Rahman', attendance: 90, assignments: '12/12', grade: 'A', status: 'On track', color: 'bg-purple-500' },
]

const assignments = [
  { id: 'ASN-001', title: 'Hero Section Design', due: 'Apr 15, 2026', submitted: 45, total: 52, status: 'Active' },
  { id: 'ASN-002', title: 'Navigation Bar Component', due: 'Apr 20, 2026', submitted: 30, total: 52, status: 'Active' },
  { id: 'ASN-003', title: 'Responsive Layout', due: 'Apr 10, 2026', submitted: 52, total: 52, status: 'Closed' },
]

const resources = [
  { id: 'RES-001', name: 'Week 1 Lecture Slides', type: 'PDF', size: '2.4 MB', date: 'Apr 1, 2026' },
  { id: 'RES-002', name: 'Week 1 Recording', type: 'Video', size: '245 MB', date: 'Apr 2, 2026' },
  { id: 'RES-003', name: 'Figma Design Kit', type: 'Link', size: '--', date: 'Apr 3, 2026' },
]

const sessions = [
  { id: 1, title: 'Lesson 1 - Introduction', date: 'Apr 1, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Completed', attendance: 48 },
  { id: 2, title: 'Lesson 2 - Core Concepts', date: 'Apr 8, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Completed', attendance: 45 },
  { id: 3, title: 'Lesson 3 - Practical', date: 'Apr 15, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Live', attendance: 50 },
  { id: 4, title: 'Lesson 4 - Advanced', date: 'Apr 22, 2026', time: '4:30 PM', duration: '1hr 30mins', status: 'Upcoming', attendance: 0 },
]

const statusStyles = {
  'On track': 'bg-green-50 text-green-700 border border-green-200',
  'At Risk': 'bg-red-50 text-red-600 border border-red-200',
}

const assignmentStatusStyles = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Closed: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const sessionStatusStyles = {
  Live: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-50 text-blue-600',
  Upcoming: 'bg-gray-100 text-gray-500',
}

function AddAssignmentModal({ onClose }) {
  const [form, setForm] = useState({ title: '', due: '', description: '', points: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Add Assignment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">TITLE <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. Hero Section Design"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">DUE DATE</label>
              <input type="date" name="due" value={form.due} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">TOTAL POINTS</label>
              <input name="points" value={form.points} onChange={handle} placeholder="e.g. 100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              placeholder="Assignment instructions..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">Add Assignment</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadResourceModal({ onClose }) {
  const [tab, setTab] = useState('file')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Upload Resource</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['file', 'link'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all capitalize ${
                  tab === t ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500'
                }`}>
                {t === 'file' ? 'Upload File' : 'Add Link'}
              </button>
            ))}
          </div>
          {tab === 'file' ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#2563EB] cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload size={18} className="text-[#2563EB]" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Click to upload file</p>
              <p className="text-[11px] text-gray-400">PDF, MP4, DOCX up to 500MB</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">RESOURCE NAME</label>
                <input placeholder="e.g. Figma Design Kit"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL</label>
                <input placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
              {tab === 'file' ? 'Upload' : 'Add Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainerCoursePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [showUploadResource, setShowUploadResource] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} activePath="/trainer/course" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

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
                    <span>👥 52 Students</span>
                    <span>📚 Cohort 1</span>
                    <span>📅 Jan 1 → Mar 31, 2026</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowUploadResource(true)}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2 hover:bg-gray-50">
                    <Upload size={13} /> Upload Resource
                  </button>
                  <button onClick={() => setShowAddAssignment(true)}
                    className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-blue-700">
                    <Plus size={13} /> Add Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: '52', icon: Users, bg: 'bg-blue-50', color: 'text-[#2563EB]' },
              { label: 'Sessions', value: '42/48', icon: Video, bg: 'bg-purple-50', color: 'text-purple-600' },
              { label: 'Assignments', value: '12', icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Avg Attendance', value: '87%', icon: BookOpen, bg: 'bg-green-50', color: 'text-green-600' },
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
            <div className="flex items-center border-b border-gray-100 px-4 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-3">Course Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div className="bg-[#2563EB] h-2.5 rounded-full" style={{ width: '90%' }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">90%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">At Risk Students</p>
                      <p className="text-2xl font-bold text-red-500">5</p>
                      <p className="text-xs text-red-400 mt-0.5">Below 60% attendance</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Pending Grades</p>
                      <p className="text-2xl font-bold text-amber-500">18</p>
                      <p className="text-xs text-amber-400 mt-0.5">Assignments to grade</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Next Session</p>
                      <p className="text-sm font-bold text-gray-800">Today, 4:30 PM</p>
                      <p className="text-xs text-gray-400 mt-0.5">Lesson 3 · Module 2</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Avg Student Grade</p>
                      <p className="text-2xl font-bold text-green-600">B+</p>
                      <p className="text-xs text-green-400 mt-0.5">Above cohort average</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'Students' && (
                <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Student', 'Attendance', 'Assignments', 'Grade', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                              <p className="text-[10px] text-gray-400">{s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${s.attendance >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                            {s.attendance}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{s.assignments}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-700">{s.grade}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              {/* ASSIGNMENTS TAB */}
              {activeTab === 'Assignments' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => setShowAddAssignment(true)}
                      className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-blue-700">
                      <Plus size={13} /> Add Assignment
                    </button>
                  </div>
                  <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Assignment', 'Due Date', 'Submissions', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {assignments.map(a => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-800">{a.title}</p>
                            <p className="text-[10px] text-gray-400">{a.id}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{a.due}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-[#2563EB] h-1.5 rounded-full"
                                  style={{ width: `${(a.submitted / a.total) * 100}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{a.submitted}/{a.total}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${assignmentStatusStyles[a.status]}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-xs text-[#2563EB] font-semibold hover:underline">Grade</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}

              {/* RESOURCES TAB */}
              {activeTab === 'Resources' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => setShowUploadResource(true)}
                      className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-blue-700">
                      <Upload size={13} /> Upload Resource
                    </button>
                  </div>
                  <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Resource', 'Type', 'Size', 'Date', 'Action'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {resources.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                r.type === 'PDF' ? 'bg-red-50' : r.type === 'Video' ? 'bg-purple-50' : 'bg-blue-50'
                              }`}>
                                {r.type === 'PDF' ? <FileText size={13} className="text-red-500" /> :
                                 r.type === 'Video' ? <Video size={13} className="text-purple-500" /> :
                                 <LinkIcon size={13} className="text-blue-500" />}
                              </div>
                              <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              r.type === 'PDF' ? 'bg-red-50 text-red-600' :
                              r.type === 'Video' ? 'bg-purple-50 text-purple-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>{r.type}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.size}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                          <td className="px-4 py-3">
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                              <MoreHorizontal size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}

              {/* SESSIONS TAB */}
              {activeTab === 'Sessions' && (
                <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Session', 'Date', 'Time', 'Duration', 'Attendance', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-800">{s.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{s.date}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{s.time}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{s.duration}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {s.status === 'Upcoming' ? '--' : `${s.attendance} students`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sessionStatusStyles[s.status]}`}>
                            {s.status}
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

      {showAddAssignment && <AddAssignmentModal onClose={() => setShowAddAssignment(false)} />}
      {showUploadResource && <UploadResourceModal onClose={() => setShowUploadResource(false)} />}
    </div>
  )
}