import { useState } from 'react'
import { Plus, UserPlus, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateCourseModal from './modals/CreateCourseModal'
import AssignTrainerModal from './modals/AssignTrainerModal'
import OnboardStudentModal from './modals/OnboardStudentModal'

export default function RightPanel({ sessions: propSessions }) {
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()

  const upcomingSessions = propSessions && propSessions.length > 0
    ? propSessions.slice(0, 5).map(s => {
        const date = new Date(s.scheduled_at)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return {
          course: s.course?.name || s.title || 'Course Session',
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          day: days[date.getDay()],
          status: new Date() >= date ? 'Live' : 'Upcoming'
        }
      })
    : []

  return (
    <div className="w-full space-y-4">

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Quick actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => setModal('course')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Plus size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Create a Course</span>
          </button>

          <button
            onClick={() => setModal('trainer')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
              <UserPlus size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Assign Trainers</span>
          </button>

          <button
            onClick={() => setModal('student')}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">Onboard Students</span>
          </button>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800">Activities</h3>
        <p className="text-[11px] text-gray-400 mb-3">5 most recent activity</p>
        <p className="text-xs text-gray-400 font-semibold py-4">No recent activity found on the server.</p>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800">Upcoming Sessions</h3>
        <p className="text-[11px] text-gray-400 mb-3">Next 5 scheduled</p>
        <div className="space-y-3">
          {upcomingSessions.length === 0 ? (
            <p className="text-xs text-gray-400 font-semibold py-4">No scheduled sessions found on the server.</p>
          ) : upcomingSessions.map(({ course, time, day, status }, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate uppercase leading-tight">{course}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{day}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-gray-800">{time}</p>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  status === 'Live'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/cohorts')}
            className="w-full text-xs text-[#2563EB] font-semibold hover:underline text-center">
            Full Calendar →
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateCourseModal isOpen={modal === 'course'} onClose={() => setModal(null)} />
      <AssignTrainerModal isOpen={modal === 'trainer'} onClose={() => setModal(null)} />
      <OnboardStudentModal isOpen={modal === 'student'} onClose={() => setModal(null)} />

    </div>
  )
}
