import { useNavigate } from 'react-router-dom'

function RateColor(rate) {
  if (rate >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (rate >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export default function AttendanceTable({ courses = [], attendanceRecords = [] }) {
  const navigate = useNavigate()

  const data = courses && courses.length > 0
    ? courses.map(c => {
        const courseAttendance = attendanceRecords.filter(r => r.course_id === c.id)
        const total = courseAttendance.length
        const present = courseAttendance.filter(r => r.status === 'present').length
        const absent = total - present
        const rate = total > 0 ? Math.round((present / total) * 100) : 0
        return {
          course: c.name,
          trainer: c.trainer ? `${c.trainer.first_name || ''} ${c.trainer.last_name || ''}`.trim() : 'Unassigned',
          total,
          present,
          absent,
          rate
        }
      })
    : []

  return (
    <div className="bg-white rounded-xl border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Attendance Summary</h2>
          <p className="text-xs text-gray-400 mt-0.5">Per course breakdown for this cohort</p>
        </div>
        <button
          onClick={() => navigate('/admin/cohorts')}
          className="text-xs text-[#2563EB] font-semibold hover:underline">
          View all →
        </button>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs font-semibold text-gray-400">
          No attendance data found on the server.
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              {['Course', 'Trainer', 'Total Sessions', 'Present', 'Absent', 'Rate'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(({ course, trainer, total, present, absent, rate }) => (
              <tr key={course} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{course}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{trainer}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{total}</td>
                <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{present}</td>
                <td className="px-5 py-3.5 text-sm text-red-500 font-medium">{absent}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${RateColor(rate)}`}>
                    {rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

    </div>
  )
}
