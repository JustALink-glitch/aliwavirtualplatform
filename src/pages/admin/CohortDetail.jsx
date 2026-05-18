import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { cohortsAPI, trainersAPI, studentsAPI, coursesAPI } from '../../services'
import toast from 'react-hot-toast'

const tabs = ['Overview', 'Students', 'Courses', 'Assignments', 'Resources', 'Attendance', 'Settings']

const statusStyles = {
  active: 'bg-green-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
  completed: 'bg-blue-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
  paused: 'bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
  upcoming: 'bg-purple-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
}

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-purple-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-pink-500',
]

function TrainerModal({ trainer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${trainer.color || 'bg-[#2563EB]'} flex items-center justify-center text-white text-sm font-bold`}>
              {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{trainer.name}</p>
              <p className="text-xs text-gray-400">Trainer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trainer Information</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Full Name', value: trainer.name },
            { label: 'Email Address', value: trainer.email },
            { label: 'Phone', value: trainer.phone || 'N/A' },
            { label: 'Status', value: trainer.status ? trainer.status.toUpperCase() : 'PENDING' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full bg-[#2563EB] text-white text-sm font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
          Close Profile
        </button>
      </div>
    </div>
  )
}

export default function CohortDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)

  const [cohort, setCohort] = useState(null)
  const [cohortTrainers, setCohortTrainers] = useState([])
  const [cohortStudents, setCohortStudents] = useState([])
  const [cohortCourses, setCohortCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCohort = async () => {
    try {
      setLoading(true)
      const res = await cohortsAPI.get(id)
      if (res.success) {
        setCohort(res.cohort)
        // Load extras in parallel
        const [tRes, sRes, cRes] = await Promise.all([
          trainersAPI.list({ cohort_id: id }),
          studentsAPI.list({ cohort_id: id }),
          coursesAPI.list({ cohort_id: id }),
        ])
        if (tRes.success) setCohortTrainers(tRes.users || [])
        if (sRes.success) setCohortStudents(sRes.users || [])
        if (cRes.success) setCohortCourses(cRes.courses || [])
      } else {
        toast.error(res.message || 'Failed to load cohort details')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while fetching cohort details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCohort()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await cohortsAPI.update(id, { status: newStatus })
      if (res.success) {
        toast.success(`Cohort status updated to ${newStatus}`)
        fetchCohort()
      } else {
        toast.error(res.message || 'Failed to update cohort status')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setShowEditMenu(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 font-bold mb-3">Cohort not found</p>
        <button onClick={() => navigate('/admin/cohorts')} className="text-sm text-[#2563EB] font-bold hover:underline">&larr; Back to Cohorts</button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} activePath="/admin/cohorts" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto">
          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <button onClick={() => navigate('/admin/cohorts')} className="hover:text-[#2563EB] transition-colors font-semibold">
                Cohorts
              </button>
              <ChevronRight size={13} />
              <span className="text-gray-800 font-bold">{cohort.name}</span>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="flex items-center gap-1 bg-[#ffffff] border border-gray-200 text-gray-600 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Status Actions <ChevronDown size={13} />
              </button>
              {showEditMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-44 z-30 py-1">
                  {[
                    { label: 'Start Ongoing', value: 'active' },
                    { label: 'Pause Cohort', value: 'paused' },
                    { label: 'Mark Complete', value: 'completed' },
                    { label: 'Set to Draft/Upcoming', value: 'upcoming' }
                  ].map(item => (
                    <button 
                      key={item.value} 
                      onClick={() => handleStatusChange(item.value)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
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

          <div className="p-4 md:p-6 space-y-5">
            {/* Banner */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: '72px', fontWeight: 900, opacity: 0.12, textTransform: 'uppercase', letterSpacing: '8px' }}>{cohort.name}</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-black">{cohort.name}</h1>
                  <span className={statusStyles[cohort.status] || statusStyles.upcoming}>
                    {cohort.status}
                  </span>
                </div>
                <p className="text-sm text-white/90 max-w-xl leading-relaxed mb-4 font-medium">
                  {cohort.description || 'An intensive digital skills development and mentorship program for professional and personal growth.'}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/95 flex-wrap font-semibold">
                  <span>👥 {cohortStudents.length} Students</span>
                  <span>📚 {cohortCourses.length} Courses</span>
                  <span>👨‍🏫 {cohortTrainers.length} Trainers</span>
                  <span>📅 {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : 'N/A'} → {cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tabs content */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center border-b border-gray-100 px-4 overflow-x-auto bg-gray-50/50">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div className="p-4 md:p-6 space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    {[
                      { label: 'Completion Rate', value: '86%', color: 'text-green-600' },
                      { label: 'Avg Attendance', value: '76%', color: 'text-blue-600' },
                      { label: 'Total Enrolled', value: cohortStudents.length.toString(), color: 'text-gray-800' },
                      { label: 'Active Courses', value: cohortCourses.length.toString(), color: 'text-gray-800' },
                      { label: 'Trainers Roster', value: cohortTrainers.length.toString(), color: 'text-purple-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center px-2 py-1">
                        <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide font-bold">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Trainers section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-gray-800">Assigned Trainers</h2>
                      <button onClick={() => navigate('/admin/trainers')} className="text-xs text-[#2563EB] font-bold hover:underline">View all trainers &rarr;</button>
                    </div>
                    {cohortTrainers.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                        <p className="text-xs text-gray-400 font-semibold mb-2">No trainers assigned to this cohort yet</p>
                        <button onClick={() => setActiveTab('Settings')} className="text-[11px] text-[#2563EB] font-bold hover:underline">Assign Trainer in Settings</button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full min-w-[500px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {['Trainer', 'Email', 'Phone', 'Status'].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {cohortTrainers.map((t, idx) => {
                              const trainerObj = {
                                id: t.id,
                                name: `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'No Name',
                                email: t.email,
                                phone: t.phone_number || t.phone,
                                status: t.status || 'pending',
                                color: cardColors[idx % cardColors.length]
                              }
                              return (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedTrainer(trainerObj)}>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-8 h-8 rounded-full ${trainerObj.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                        {trainerObj.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-800">{trainerObj.name}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold">Trainer</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3 text-xs text-gray-600 font-semibold">{trainerObj.email}</td>
                                  <td className="px-5 py-3 text-xs text-gray-500 font-semibold">{trainerObj.phone || 'N/A'}</td>
                                  <td className="px-5 py-3 text-xs font-bold capitalize text-green-600">{trainerObj.status}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TABS DELEGATION */}
              {activeTab !== 'Overview' && (
                <div className="p-4 md:p-6">
                  {activeTab === 'Students' && <StudentsTab cohortId={cohort.id} />}
                  {activeTab === 'Courses' && <CoursesTab cohortId={cohort.id} />}
                  {activeTab === 'Assignments' && <AssignmentsTab cohortId={cohort.id} />}
                  {activeTab === 'Resources' && <ResourcesTab cohortId={cohort.id} />}
                  {activeTab === 'Attendance' && <AttendanceTab cohortId={cohort.id} />}
                  {activeTab === 'Settings' && <SettingsTab cohortId={cohort.id} onUpdate={fetchCohort} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTrainer && <TrainerModal trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />}
      <OnboardStudentModal isOpen={showOnboard} onClose={() => setShowOnboard(false)} onSuccess={fetchCohort} />
    </div>
  )
}