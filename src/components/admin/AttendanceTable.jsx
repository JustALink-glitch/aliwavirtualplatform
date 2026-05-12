import { useNavigate } from 'react-router-dom'

const attendance = [
  { course: 'Data Analytics', trainer: 'Abdulhameed O.', total: 40, present: 36, absent: 4, rate: 90 },
  { course: 'Project Management', trainer: 'Oyindamola O.', total: 40, present: 30, absent: 10, rate: 75 },
  { course: 'UX Design', trainer: 'Michael K.', total: 40, present: 34, absent: 6, rate: 85 },
  { course: 'DevOps', trainer: 'Victor O.', total: 40, present: 20, absent: 20, rate: 50 },
  { course: 'Full Stack Dev', trainer: 'Bewaji O.', total: 40, present: 38, absent: 2, rate: 95 },
]

function RateColor(rate) {
  if (rate >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (rate >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export default function AttendanceTable() {
  const navigate = useNavigate()

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

      {/* Table */}
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
            {attendance.map(({ course, trainer, total, present, absent, rate }) => (
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

    </div>
  )
}