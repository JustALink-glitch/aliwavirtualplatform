import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { ChevronRight, Plus, Edit2, Users, BookOpen, UserCheck, Archive, MoreHorizontal, Video, FileText, X } from 'lucide-react'

const lessons = []

const stats = [
  { label: 'Lessons', value: '-', icon: BookOpen },
  { label: 'Live classes', value: '-', icon: Video },
  { label: 'Assignments', value: '-', icon: FileText },
  { label: 'Students', value: '120', icon: Users },
  { label: 'At Risk', value: '-', icon: UserCheck },
]

function AddLessonModal({ onClose }) {
  const [form, setForm] = useState({ title: '', type: 'Lesson', duration: '', description: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Add Lesson</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">LESSON TITLE <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. Introduction to Python"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">TYPE</label>
            <select name="type" value={form.type} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
              <option>Lesson</option>
              <option>Live Class</option>
              <option>Assignment</option>
              <option>Quiz</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DURATION</label>
            <input name="duration" value={form.duration} onChange={handle} placeholder="e.g. 45 mins"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
            <textarea name="description" value={form.description} onChange={handle} rows={2}
              placeholder="Brief description..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">Add Lesson</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CourseDetail() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [courseName, setCourseName] = useState('Introduction to Data Analysis')
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonList, setLessonList] = useState(lessons)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} activePath="/admin/courses" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto">

          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <button onClick={() => navigate('/admin/courses')} className="hover:text-[#2563EB] transition-colors">
                Courses
              </button>
              <ChevronRight size={13} />
              <span className="text-gray-800 font-semibold">{courseName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                <Archive size={14} /> Archive Course
              </button>
              <button className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Users size={14} /> Edit Group
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-0 h-full">

            {/* Main content */}
            <div className="flex-1 p-6 space-y-5 min-w-0">

              {/* Course banner */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div style={{ background: 'linear-gradient(135deg, #60a5fa, #6366f1)', height: '120px' }} />
                <div className="bg-white p-5">
                  {/* Course name */}
                  <div className="flex items-center gap-2 mb-2">
                    {editingName ? (
                      <input
                        value={courseName}
                        onChange={e => setCourseName(e.target.value)}
                        onBlur={() => setEditingName(false)}
                        autoFocus
                        className="text-xl font-bold text-gray-900 border-b border-[#2563EB] outline-none bg-transparent"
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-gray-900">{courseName}</h1>
                    )}
                    <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-200">
                      Active
                    </span>
                    <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-[#2563EB] transition-colors ml-1">
                      <Edit2 size={13} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Data analysis fundamentals with Python, Pandas, SQL and Visualization.
                  </p>

                  {/* Course meta */}
                  <div className="flex items-center gap-5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      <span>120 Students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-gray-400" />
                      <span>7 Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-gray-400" />
                      <span>Abdulhameed Olamilekan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Icon size={15} className="text-[#2563EB]" />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {lessonList.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen size={32} className="text-gray-300" />
                  </div>
                  <p className="text-base font-bold text-gray-700 mb-1">Create your first module</p>
                  <p className="text-sm text-gray-400 mb-5">Start building your course by adding lessons</p>
                  <button onClick={() => setShowAddLesson(true)}
                    className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Plus size={15} /> Create Module
                  </button>
                </div>
              )}

              {/* Lesson list if exists */}
              {lessonList.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800">Lessons ({lessonList.length})</h2>
                    <button onClick={() => setShowAddLesson(true)}
                      className="flex items-center gap-1.5 text-xs text-[#2563EB] font-semibold hover:underline">
                      <Plus size={13} /> Add Lesson
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {lessonList.map((lesson, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563EB]">
                            <BookOpen size={13} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{lesson.title}</p>
                            <p className="text-[10px] text-gray-400">{lesson.type} · {lesson.duration}</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel — Lessons */}
            <div className="w-full lg:w-[240px] lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Lessons ({lessonList.length})</h3>
                <button onClick={() => setShowAddLesson(true)}
                  className="flex items-center gap-1 text-xs text-[#2563EB] font-semibold hover:underline">
                  <Plus size={12} /> Add
                </button>
              </div>

              {lessonList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">No lessons yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">Add your first lesson to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessonList.map((lesson, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen size={11} className="text-[#2563EB]" />
                      </div>
                      <p className="text-xs font-medium text-gray-700 truncate">{lesson.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {showAddLesson && <AddLessonModal onClose={() => setShowAddLesson(false)} />}
    </div>
  )
}