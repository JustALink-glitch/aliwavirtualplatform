import { useState } from 'react'
import { Plus, UserPlus, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateCourseModal from './modals/CreateCourseModal'
import AssignTrainerModal from './modals/AssignTrainerModal'
import OnboardStudentModal from './modals/OnboardStudentModal'

const activities = [
  { name: 'Abdulhameed', action: 'uploaded a course material to', target: 'Data Analytics', time: '10 mins ago' },
  { name: 'Michael Kaine', action: 'started a live class on', target: 'UX Design', time: '2 days ago' },
  { name: 'Oyindamola', action: 'updated the course info for', target: 'UX Design', time: '2 days ago' },
  { name: 'Victor O.', action: 'marked attendance for', target: 'DevOps', time: '3 days ago' },
  { name: 'Bewaji O.', action: 'added new students to', target: 'Full Stack Dev', time: '4 days ago' },
]

const sessions = [
  { course: 'Web Development', time: '10:00 AM', day: 'Monday', status: 'Live' },
  { course: 'Digital Marketing', time: '7:00 PM', day: 'Tuesday', status: 'Live' },
  { course: 'Virtual Assistant', time: '12:00 PM', day: 'Wednesday', status: 'Upcoming' },
  { course: 'Data Analytics', time: '3:00 PM', day: 'Thursday', status: 'Upcoming' },
  { course: 'UX Design', time: '5:00 PM', day: 'Friday', status: 'Upcoming' },
]

export default function RightPanel({ sessions: propSessions }) {
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()

  // Use props if they exist and are non-empty, otherwise fallback to template data
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
    : sessions

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
        <div className="space-y-3">
          {activities.map(({ name, action, target, time }, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5">
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">{name}</span>{' '}
                  {action}{' '}
                  <span className="text-[#2563EB] font-medium">{target}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800">Upcoming Sessions</h3>
        <p className="text-[11px] text-gray-400 mb-3">Next 5 scheduled</p>
        <div className="space-y-3">
          {upcomingSessions.map(({ course, time, day, status }, i) => (
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