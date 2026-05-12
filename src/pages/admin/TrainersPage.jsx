import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { LayoutGrid, List, Filter, UserPlus, MoreHorizontal, Eye, Pencil, Trash2, X, ChevronDown } from 'lucide-react'

const trainers = [
  { id: 'TR-973', name: 'Abdulhameed Olamilekan', course: 'Data Analytics', assignedCourses: 'WEB DEVELOPMENT', students: 52, sessions: 12, attendance: 94, lastActive: 'Yesterday', status: 'Active', color: 'bg-orange-400', gender: 'Male', email: 'abdulhameedalabi@gmail.com', phone: '+234 9176265241', cohort: 'Cohort 1' },
  { id: 'TR-112', name: 'Michael Kaine', course: 'UX Design', assignedCourses: 'DATA ANALYTICS', students: 20, sessions: 9, attendance: 48, lastActive: 'Yesterday', status: 'Active', color: 'bg-blue-500', gender: 'Male', email: 'michael@gmail.com', phone: '+234 9176265242', cohort: 'Cohort 1' },
  { id: 'TR-860', name: 'Oyindamola Omotosho', course: 'Digital Marketing', assignedCourses: 'UI/UX DESIGN', students: 30, sessions: 10, attendance: 96, lastActive: 'Yesterday', status: 'Active', color: 'bg-red-400', gender: 'Female', email: 'oyindamola@gmail.com', phone: '+234 9176265243', cohort: 'Cohort 1' },
  { id: 'TR-662', name: 'Mojoyinola Rahman', course: 'Project Management', assignedCourses: 'VIRTUAL ASSISTANT', students: 120, sessions: 11, attendance: 54, lastActive: 'Yesterday', status: 'Active', color: 'bg-purple-500', gender: 'Female', email: 'mojoyinola@gmail.com', phone: '+234 9176265244', cohort: 'Cohort 1' },
  { id: 'TR-762', name: 'Bewaji Daniels', course: 'Frontend Dev', assignedCourses: 'DIGITAL MARKETING', students: 120, sessions: 11, attendance: 94, lastActive: 'Yesterday', status: 'Active', color: 'bg-teal-500', gender: 'Female', email: 'bewaji@gmail.com', phone: '+234 9176265245', cohort: 'Cohort 1' },
  { id: 'TR-024', name: 'Victor Osupala', course: 'Backend Dev', assignedCourses: 'WEB DEVELOPMENT', students: 120, sessions: 11, attendance: 94, lastActive: 'Yesterday', status: 'Active', color: 'bg-green-500', gender: 'Male', email: 'victor@gmail.com', phone: '+234 9176265246', cohort: 'Cohort 1' },
  { id: 'TR-185', name: 'Alabi Pelumi', course: 'QA Testing', assignedCourses: 'WEB DEVELOPMENT', students: 120, sessions: 11, attendance: 94, lastActive: 'Yesterday', status: 'Pending', color: 'bg-amber-500', gender: 'Male', email: 'alabi@gmail.com', phone: '+234 9176265247', cohort: 'Cohort 2' },
  { id: 'TR-201', name: 'Fatima Aliyu', course: 'Data Science', assignedCourses: 'DATA ANALYTICS', students: 80, sessions: 8, attendance: 72, lastActive: '2 days ago', status: 'Inactive', color: 'bg-pink-500', gender: 'Female', email: 'fatima@gmail.com', phone: '+234 9176265248', cohort: 'Cohort 2' },
]

const activities = [
  { name: 'Abdulhameed', action: 'uploaded a course material to', target: 'Data Analytics', time: '12 Apr 2026 · 10 mins' },
  { name: 'Michael Kaine', action: 'started a live class on', target: 'UX Design', time: '12 Apr 2026 · 2 days ago' },
]

const statusStyles = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-200',
  Inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
}

function TrainerModal({ trainer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${trainer.color} flex items-center justify-center text-white text-base font-bold`}>
              {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{trainer.name}</p>
              <p className="text-xs text-gray-400">{trainer.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trainers Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'ID Number', value: trainer.id },
            { label: 'Gender', value: trainer.gender },
            { label: 'Email Address', value: trainer.email },
            { label: 'Phone', value: trainer.phone },
            { label: 'Cohort', value: trainer.cohort },
            { label: 'Course', value: trainer.course },
            { label: 'Last available', value: trainer.lastActive },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Activities */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activities</p>
        <div className="space-y-3 mb-5">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-2">
              <div className={`w-6 h-6 rounded-full ${trainer.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                {a.name[0]}
              </div>
              <div>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">{a.name}</span> {a.action}{' '}
                  <span className="text-[#2563EB] font-medium">{a.target}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-semibold rounded-lg py-2.5 hover:bg-red-100 transition-colors">
          Revoke Access
        </button>
      </div>
    </div>
  )
}

function ActionMenu({ onClose, onView }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> View Profile
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Pencil size={13} className="text-blue-400" /> Edit Trainer
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Remove
      </button>
    </div>
  )
}

function InviteTrainerModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', course: '', cohort: '', role: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Invite Trainer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">FULL NAME <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handle} placeholder="Enter trainer name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">EMAIL ADDRESS <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="Enter email address"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">COURSE</label>
              <select name="course" value={form.course} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
                <option value="">Select</option>
                <option>Data Analytics</option>
                <option>UX Design</option>
                <option>DevOps</option>
                <option>Full Stack Dev</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT</label>
              <select name="cohort" value={form.cohort} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
                <option value="">Select</option>
                <option>Cohort 1</option>
                <option>Cohort 2</option>
                <option>Cohort 3</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ROLE</label>
            <select name="role" value={form.role} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
              <option value="">Select role</option>
              <option>Lead Trainer</option>
              <option>Co-Trainer</option>
              <option>Guest Trainer</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700 font-medium">An invitation email will be sent to the trainer to join the platform.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">Send Invite</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainersPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [sortBy, setSortBy] = useState('Name')
  const [showSort, setShowSort] = useState(false)
  const sortRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = trainers.filter(t => {
    const matchTab = activeTab === 'All' || t.status === activeTab
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900">Trainers</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} /> Filter
              </button>
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                <UserPlus size={14} /> Invite Trainer
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Trainers', value: '8', sub: 'View all →', iconBg: 'bg-orange-50', icon: '👨‍🏫' },
              { label: 'Avg. Attendance rate', value: '87%', sub: 'View all →', iconBg: 'bg-green-50', icon: '📊' },
              { label: 'Sessions this month', value: '156', sub: 'View all →', iconBg: 'bg-blue-50', icon: '🎥' },
            ].map(({ label, value, sub, iconBg, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-xs text-[#2563EB] font-medium cursor-pointer hover:underline">{sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Sort + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {['All', 'Pending', 'Inactive'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={sortRef}>
                <button onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                  Sort: {sortBy} <ChevronDown size={12} />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                    {['Name', 'Attendance', 'Students', 'Sessions'].map(opt => (
                      <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false) }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                          sortBy === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-44">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trainer..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
<table className="w-full min-w-[700px]">
  <thead>
    <tr className="bg-gray-50">
      {['Trainers', 'Assigned Courses', 'No. of Students', 'No. of Sessions', 'Avg. class Attendance', 'Last Active', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(trainer => (
                  <tr key={trainer.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(trainer)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${trainer.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{trainer.name}</p>
                          <p className="text-[10px] text-gray-400">{trainer.id} · {trainer.course}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {trainer.assignedCourses}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{trainer.students}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{trainer.sessions}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${trainer.attendance >= 80 ? 'text-green-600' : trainer.attendance >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {trainer.attendance}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{trainer.lastActive}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[trainer.status]}`}>
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setOpenMenu(openMenu === trainer.id ? null : trainer.id)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === trainer.id && (
                        <ActionMenu
                          onClose={() => setOpenMenu(null)}
                          onView={() => { setSelected(trainer); setOpenMenu(null) }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {selected && <TrainerModal trainer={selected} onClose={() => setSelected(null)} />}
      {showInvite && <InviteTrainerModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}