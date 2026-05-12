import { useState } from 'react'
import { Search, LayoutGrid, List, ChevronDown, Check, X } from 'lucide-react'

const students = [
  { id: 'STU-971', name: 'Abdulhameed Olamilekan', course: 'Data Analytics', color: 'bg-orange-400', attendance: [1,1,1,1,0,1,1,1,1,1], total: 14, absences: 1 },
  { id: 'STU-972', name: 'Michael Kaine', course: 'UX Design', color: 'bg-blue-500', attendance: [1,1,1,1,1,1,1,0,1,1], total: 14, absences: 1 },
  { id: 'STU-973', name: 'Mojoyinola Rahman', course: 'Project Management', color: 'bg-red-400', attendance: [1,1,0,1,1,1,1,1,1,1], total: 14, absences: 1 },
  { id: 'STU-974', name: 'Oyindamola', course: 'Virtual Assistant', color: 'bg-teal-500', attendance: [1,1,1,1,1,0,1,1,1,1], total: 14, absences: 1 },
  { id: 'STU-975', name: 'Bewaji Daniels', course: 'Digital Marketing', color: 'bg-purple-500', attendance: [1,1,1,0,1,1,1,1,1,1], total: 14, absences: 1 },
  { id: 'STU-976', name: 'Osupala Victor', course: 'Front-end Development', color: 'bg-green-500', attendance: [1,1,1,1,1,1,0,1,1,1], total: 14, absences: 1 },
  { id: 'STU-977', name: 'Michael Kaine', course: 'UX Design', color: 'bg-indigo-500', attendance: [1,0,1,1,1,1,1,1,1,1], total: 14, absences: 1 },
  { id: 'STU-978', name: 'Bewaji Daniels', course: 'Digital Marketing', color: 'bg-pink-500', attendance: [1,1,1,1,0,1,1,1,1,1], total: 14, absences: 1 },
]

const sessions = [
  { course: 'Web Development', time: '10:00 AM', day: 'Monday', status: 'Live' },
  { course: 'Digital Marketing', time: '7:00 PM', day: 'Tuesday', status: 'Live' },
  { course: 'Virtual Assistant', time: '12:00 PM', day: 'Wednesday', status: 'Live' },
  { course: 'UX Design', time: '10:00 AM', day: 'Thursday', status: 'Live' },
  { course: 'Leadership Training', time: '9:30 AM', day: 'Friday', status: 'Live' },
]

const sessionDates = ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12']

function AttendanceMark({ value, onChange }) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTip(!showTip)}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          value ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-red-100 text-red-500 hover:bg-red-200'
        }`}
      >
        {value ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      </button>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-20">
          <button
            onClick={() => { onChange(1); setShowTip(false) }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <Check size={11} className="text-blue-500" /> Mark as Present
          </button>
          <button
            onClick={() => { onChange(0); setShowTip(false) }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <X size={11} className="text-red-500" /> Mark as Absent
          </button>
        </div>
      )}
    </div>
  )
}

export default function AttendanceTab() {
  const [view, setView] = useState('card')
  const [search, setSearch] = useState('')
  const [attendance, setAttendance] = useState(
    Object.fromEntries(students.map(s => [s.id, [...s.attendance]]))
  )

  const toggleMark = (studentId, index, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId].map((v, i) => i === index ? value : v)
    }))
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-4">

      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Find Student..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('card')}
              className={`p-1.5 rounded-md transition-colors ${view === 'card' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
              <List size={15} />
            </button>
          </div>

          {/* Course filter */}
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            All courses <ChevronDown size={13} />
          </button>
        </div>

        {/* CARD VIEW */}
        {view === 'card' && (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(student => (
              <div key={student.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${student.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                    {student.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{student.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{student.id} · {student.course}</p>
                  </div>
                </div>

                {/* Attendance marks */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {attendance[student.id].map((val, i) => (
                    <AttendanceMark key={i} value={val} onChange={(v) => toggleMark(student.id, i, v)} />
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500">
                    <span className="font-bold text-gray-700">{attendance[student.id].filter(v => v).length}/{attendance[student.id].length}</span> Attended
                  </p>
                  <p className="text-[10px] text-red-500">
                    <span className="font-bold">{attendance[student.id].filter(v => !v).length}</span> Absence
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 sticky left-0 bg-gray-50 min-w-[180px]">Student</th>
                  {sessionDates.map(d => (
                    <th key={d} className="text-center text-xs font-semibold text-gray-500 px-2 py-3 min-w-[48px]">{d}</th>
                  ))}
                  <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3">Total</th>
                  <th className="text-center text-xs font-semibold text-red-400 px-3 py-3">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${student.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400">{student.course}</p>
                        </div>
                      </div>
                    </td>
                    {attendance[student.id].map((val, i) => (
                      <td key={i} className="px-2 py-2.5 text-center">
                        <div className="flex justify-center">
                          <AttendanceMark value={val} onChange={(v) => toggleMark(student.id, i, v)} />
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-xs font-bold text-gray-700">{attendance[student.id].filter(v => v).length}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-xs font-bold text-red-500">{attendance[student.id].filter(v => !v).length}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  )
}