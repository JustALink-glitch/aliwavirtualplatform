import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const statusStyles = {
  Ongoing: 'bg-green-50 text-green-700 border border-green-200',
  Stopped: 'bg-red-50 text-red-600 border border-red-200',
  Paused:  'bg-amber-50 text-amber-600 border border-amber-200',
}

function ActionMenu({ course, onClose }) {
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Eye size={14} className="text-gray-400" /> View Details
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Pencil size={14} className="text-blue-400" /> Edit Course
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 size={14} /> Delete Course
      </button>
    </div>
  )
}

export default function CoursesTable({ courses: propCourses }) {
  const [openMenu, setOpenMenu] = useState(null)
  const navigate = useNavigate()

  const activeCourses = propCourses && propCourses.length > 0
    ? propCourses.map(c => ({
        id: c.id,
        name: c.name,
        trainer: c.trainer ? `${c.trainer.first_name || ''} ${c.trainer.last_name || ''}`.trim() : 'Unassigned',
        progress: c.progress || 0,
        status: c.status === 'active' ? 'Ongoing' : c.status === 'paused' ? 'Paused' : 'Stopped'
      }))
    : []

  return (
    <div className="bg-white rounded-xl border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">Active Courses</h2>
       <button onClick={() => navigate('/admin/courses')} className="text-xs text-[#2563EB] font-semibold hover:underline">
  View all →
</button>
      </div>

      {activeCourses.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs font-semibold text-gray-400">
          No courses found on the server.
        </div>
      ) : (
      <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-gray-50">
            {['Courses', 'Trainer', 'Progress', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {activeCourses.map(({ id, name, trainer, progress, status }) => (
            <tr key={name} className="hover:bg-gray-50 transition-colors relative">
              <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{name}</td>
              <td className="px-5 py-3.5 text-sm text-gray-600">{trainer}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{progress}%</span>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status] || 'bg-gray-50 text-gray-600'}`}>
                  {status}
                </span>
              </td>
              <td className="px-5 py-3.5 relative">
                <button
                  onClick={() => setOpenMenu(openMenu === name ? null : name)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === name && (
                  <ActionMenu course={name} onClose={() => setOpenMenu(null)} />
                )}
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
