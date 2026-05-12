import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import OnboardStudentModal from '../../components/admin/modals/OnboardStudentModal'
import { ChevronRight, ChevronDown, UserPlus, X } from 'lucide-react'
import StudentsTab from '../../components/admin/cohort-tabs/StudentsTab'
import CoursesTab from '../../components/admin/cohort-tabs/CoursesTab'
import AssignmentsTab from '../../components/admin/cohort-tabs/AssignmentsTab'
import ResourcesTab from '../../components/admin/cohort-tabs/ResourcesTab'
import AttendanceTab from '../../components/admin/cohort-tabs/AttendanceTab'
import SettingsTab from '../../components/admin/cohort-tabs/SettingsTab'

const tabs = ['Overview', 'Students', 'Courses', 'Assignments', 'Resources', 'Attendance', 'Settings']

const trainers = [
  { initials: 'AO', name: 'Abdulhameed Olamilekan', role: 'Tr. 371', attendance: 54, students: 52, courses: 12, sessions: 16, color: 'bg-orange-400' },
  { initials: 'MK', name: 'Michael Kaine', role: 'Tr. 372', attendance: 48, students: 47, courses: 10, sessions: 16, color: 'bg-blue-500' },
  { initials: 'OO', name: 'Oyindamola Onatuara', role: 'Tr. 373', attendance: 56, students: 18, courses: 10, sessions: 16, color: 'bg-red-400' },
  { initials: 'MB', name: 'Adeyinka Babatunde', role: 'Tr. 374', attendance: 54, students: 129, courses: 11, sessions: 16, color: 'bg-teal-500' },
  { initials: 'BG', name: 'Bewaji Garuda', role: 'Tr. 375', attendance: 56, students: 61, courses: 12, sessions: 16, color: 'bg-purple-500' },
  { initials: 'VO', name: 'Victor Okpara', role: 'Tr. 376', attendance: 56, students: 26, courses: 12, sessions: 16, color: 'bg-green-500' },
  { initials: 'AM', name: 'Anafi Murani', role: 'Tr. 377', attendance: 56, students: 54, courses: 12, sessions: 16, color: 'bg-pink-500' },
]

const sessions = [
  { course: 'Web Development', time: '10:00 AM', day: 'Monday', status: 'Live' },
  { course: 'Digital Marketing', time: '1:00 PM', day: 'Tuesday', status: 'Live' },
  { course: 'Virtual Assistant', time: '12:00 PM', day: 'Wednesday', status: 'Upcoming' },
  { course: 'UX Design', time: '10:00 AM', day: 'Friday', status: 'Upcoming' },
  { course: 'Leadership Training', time: '9:18 AM', day: 'Friday', status: 'Upcoming' },
]

function TrainerModal({ trainer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${trainer.color} flex items-center justify-center text-white text-sm font-bold`}>
              {trainer.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{trainer.name}</p>
              <p className="text-xs text-gray-400">{trainer.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trainer Information</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'City, State', value: 'Lagos, State' },
            { label: 'Level', value: 'Intermediate' },
            { label: 'Email Address', value: 'abdulhameed@gmail.com' },
            { label: 'Phone', value: '+234 913 634 5555' },
            { label: 'Course', value: 'Data Analytics' },
            { label: 'Last Active', value: '3 days ago' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
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

// ── Placeholder tabs ──────────────────────────────────────
function ComingSoonTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <p className="text-sm font-bold text-gray-700">{label} tab</p>
      <p className="text-xs text-gray-400 mt-1">Coming up next — we're building this!</p>
    </div>
  )
}

export default function CohortDetail() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} activePath="/admin/cohorts" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto">

          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <button onClick={() => navigate('/admin/cohorts')} className="hover:text-[#2563EB] transition-colors">
                Cohorts
              </button>
              <ChevronRight size={13} />
              <span className="text-gray-800 font-semibold">Cohort 1</span>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="flex items-center bg-[#ffffff] border border-gray-100 text-gray rounded-lg px-2 py-2 hover:bg-black-700 transition-colors"
              >
                <ChevronDown size={15} />
              </button>
              {showEditMenu && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-44 z-30 py-1">
                  {['Edit Cohort', 'Add a Course', 'Pause Cohort'].map(item => (
                    <button key={item} className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              )}
               <button
                onClick={() => setShowOnboard(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={15} /> Onboard Student
              </button>
              
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-5 p-4 md:p-6">

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Banner */}
              <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: '72px', fontWeight: 900, opacity: 0.12, textTransform: 'uppercase', letterSpacing: '8px' }}>COHORT 1</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-black">Cohort 1</h1>
                    <span className="bg-green-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ongoing</span>
                  </div>
                  <p className="text-sm text-white/80 max-w-xl leading-relaxed mb-4">
                    An 8-week intensive program with hands-on projects, live mentorship and introduction to virtual assistants, UX design, data analysis, project management and cybersecurity for beginners.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/80 flex-wrap">
                    <span>👥 248 Students</span>
                    <span>📚 5 Courses</span>
                    <span>👨‍🏫 7 Trainers</span>
                    <span>📅 Jan 1, 2026 → Mar 31, 2026</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-100">
                {/* Tab bar */}
                <div className="flex items-center border-b border-gray-100 px-4 overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeTab === tab
                          ? 'border-[#2563EB] text-[#2563EB]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'Overview' && (
                  <>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 md:grid-cols-5 divide-x divide-gray-100 px-2 py-4">
                      {[
                        { label: 'Completion', value: '86%', color: 'text-green-600' },
                        { label: 'Attendance', value: '76%', color: 'text-blue-600' },
                        { label: 'Sessions', value: '42/48', color: 'text-gray-800' },
                        { label: 'Avg Grade (GPA)', value: '3.8', color: 'text-gray-800' },
                        { label: 'At Risk', value: '8', color: 'text-red-500' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center px-4">
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Trainers table */}
                    <div className="border-t border-gray-100">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800">Trainers</h2>
                        <button onClick={() => navigate('/admin/trainers')} className="text-xs text-[#2563EB] font-semibold hover:underline">View all →</button>
                      </div>
                      <div className="overflow-x-auto">
<table className="w-full min-w-[600px]">
  <thead>
    <tr className="bg-gray-50">
      {['Trainer', 'Avg. Attendance', 'No. of Students', 'No. of Courses', 'No. of Sessions'].map(h => (
                              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {trainers.map((trainer) => (
                            <tr key={trainer.name} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedTrainer(trainer)}>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-full ${trainer.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {trainer.initials}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-800">{trainer.name}</p>
                                    <p className="text-[10px] text-gray-400">{trainer.role}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-bold ${trainer.attendance >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                                  {trainer.attendance}%
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-gray-600">{trainer.students}</td>
                              <td className="px-5 py-3 text-xs text-gray-600">{trainer.courses}</td>
                              <td className="px-5 py-3 text-xs text-gray-600">{trainer.sessions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </>
                )}

                {/* ── OTHER TABS ── */}
                {activeTab !== 'Overview' && (
  <div className="p-4">
   {activeTab === 'Students' && <StudentsTab />}
{activeTab === 'Courses' && <CoursesTab />}
{activeTab === 'Assignments' && <AssignmentsTab />}
{activeTab === 'Resources' && <ResourcesTab />}
{activeTab === 'Attendance' && <AttendanceTab />}
{activeTab === 'Settings' && <SettingsTab />}
  </div>
)}

              </div>
            </div>

            {/* Right — Upcoming Sessions */}
            <div className="w-full xl:w-[220px] xl:flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-1">Upcoming Sessions</h3>
                <p className="text-[11px] text-gray-400 mb-3">Next 5 scheduled</p>
                <div className="space-y-3">
                  {sessions.map(({ course, time, day, status }, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate uppercase leading-tight">{course}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{day}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-gray-800">{time}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTrainer && <TrainerModal trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />}
      <OnboardStudentModal isOpen={showOnboard} onClose={() => setShowOnboard(false)} />
    </div>
  )
}