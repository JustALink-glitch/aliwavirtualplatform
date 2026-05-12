import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'All Courses', value: '5', sub: 'View all →', link: '/admin/courses', iconBg: 'bg-emerald-50', icon: '📚' },
  { label: 'Total Students', value: '248', sub: '220 students active', link: '/admin/students', subHighlight: true, iconBg: 'bg-blue-50', icon: '🎓' },
  { label: 'Attendance Rate', value: '84%', sub: 'View all →', link: '/admin/cohorts', iconBg: 'bg-purple-50', icon: '📊' },
]

export default function StatCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map(({ label, value, sub, subHighlight, iconBg, icon, link }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p
            onClick={() => navigate(link)}
            className={`text-xs font-medium cursor-pointer hover:underline ${subHighlight ? 'text-green-600' : 'text-[#2563EB]'}`}>
            {sub}
          </p>
        </div>
      ))}
    </div>
  )
}