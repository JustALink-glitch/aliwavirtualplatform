import { useState } from 'react'
import { Save, Trash2, PauseCircle, AlertTriangle } from 'lucide-react'

export default function SettingsTab() {
  const [form, setForm] = useState({
    name: 'Cohort 1',
    description: 'An 8-week intensive program with hands-on projects, live mentorship and introduction to virtual assistants, UX design, data analysis, project management and cybersecurity for beginners.',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'Ongoing',
    maxStudents: '250',
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="max-w-2xl space-y-6">

      {/* General Settings */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-4">General Settings</h3>
        <div className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT NAME <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">START DATE</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">END DATE</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">STATUS</label>
              <select name="status" value={form.status} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
                <option>Ongoing</option>
                <option>Paused</option>
                <option>Complete</option>
                <option>Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">MAX STUDENTS</label>
              <input type="number" name="maxStudents" value={form.maxStudents} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700 transition-colors">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Notifications */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'Notify students when a new resource is uploaded', key: 'notifyResource' },
            { label: 'Notify students when attendance is marked', key: 'notifyAttendance' },
            { label: 'Send weekly progress report to trainers', key: 'notifyProgress' },
            { label: 'Alert admin when a student is at risk', key: 'notifyAtRisk' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50">
              <p className="text-sm text-gray-700">{label}</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Danger Zone */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
        </div>
        <div className="border border-red-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-red-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Pause this cohort</p>
              <p className="text-xs text-gray-400 mt-0.5">Temporarily pause all activities for this cohort</p>
            </div>
            <button className="flex items-center gap-2 border border-amber-200 text-amber-600 bg-amber-50 text-xs font-semibold rounded-lg px-4 py-2 hover:bg-amber-100 transition-colors">
              <PauseCircle size={13} /> Pause Cohort
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Delete this cohort</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently delete cohort and all its data. This cannot be undone.</p>
            </div>
            <button className="flex items-center gap-2 border border-red-200 text-red-500 bg-red-50 text-xs font-semibold rounded-lg px-4 py-2 hover:bg-red-100 transition-colors">
              <Trash2 size={13} /> Delete Cohort
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}