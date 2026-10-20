import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Trash2, PauseCircle, AlertTriangle } from 'lucide-react'
import { cohortsAPI, trainersAPI } from '../../../services'
import toast from 'react-hot-toast'

export default function SettingsTab({ cohortId, onUpdate }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    maxStudents: '250',
  })
  const [trainers, setTrainers] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [cRes, tRes] = await Promise.all([
          cohortsAPI.get(cohortId),
          trainersAPI.list()
        ])
        if (cRes.success) {
          const c = cRes.cohort
          setForm({
            name: c.name || '',
            description: c.description || '',
            startDate: c.start_date ? c.start_date.split('T')[0] : '',
            endDate: c.end_date ? c.end_date.split('T')[0] : '',
            status: c.status || 'upcoming',
            maxStudents: c.max_students || '250',
          })
          setSelectedTrainerId(c.trainer_id || '')
        }
        if (tRes.success) {
          setTrainers(tRes.users || tRes.trainers || [])
        }
      } catch (err) {
        toast.error('Failed to load settings data')
      } finally {
        setLoading(false)
      }
    }
    if (cohortId) loadData()
  }, [cohortId])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        name: form.name,
        description: form.description,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        status: form.status,
        max_students: parseInt(form.maxStudents) || 250,
      }
      const res = await cohortsAPI.update(cohortId, updateData)
      if (res.success) {
        // Also assign trainer if selected
        if (selectedTrainerId) {
          await cohortsAPI.assignTrainer(cohortId, selectedTrainerId)
        }
        toast.success('Cohort updated successfully!')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res.message || 'Failed to update cohort')
      }
    } catch (err) {
      toast.error(err.message || 'Error updating cohort')
    }
  }

  const handlePause = async () => {
    try {
      const res = await cohortsAPI.update(cohortId, { status: 'paused' })
      if (res.success) {
        toast.success('Cohort status set to paused')
        if (onUpdate) onUpdate()
      } else {
        toast.error(res.message || 'Failed to pause cohort')
      }
    } catch (err) {
      toast.error(err.message || 'Error pausing cohort')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this cohort? This cannot be undone.')) return
    try {
      const res = await cohortsAPI.remove(cohortId)
      if (res.success) {
        toast.success('Cohort deleted successfully!')
        navigate('/admin/cohorts')
      } else {
        toast.error(res.message || 'Failed to delete cohort')
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting cohort')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6 font-[Manrope]">
      {/* General Settings */}
      <form onSubmit={handleSave}>
        <h3 className="text-sm font-bold text-gray-800 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT NAME <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handle} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] transition-colors font-semibold text-gray-700" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] transition-colors resize-none font-semibold text-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">START DATE</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">END DATE</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">STATUS</label>
              <select name="status" value={form.status} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold">
                <option value="active">Active/Ongoing</option>
                <option value="paused">Paused</option>
                <option value="completed">Complete</option>
                <option value="upcoming">Upcoming/Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">MAX STUDENTS</label>
              <input type="number" name="maxStudents" value={form.maxStudents} onChange={handle}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT LEADER / TRAINER</label>
              <select 
                value={selectedTrainerId} 
                onChange={(e) => setSelectedTrainerId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold"
              >
                <option value="">Choose Trainer...</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{`${t.first_name || ''} ${t.last_name || ''}`.trim()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-5 py-2.5 hover:bg-blue-700 transition-colors">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </form>

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
              <p className="text-xs font-bold text-gray-800">Pause this cohort</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Temporarily pause all activities for this cohort</p>
            </div>
            <button onClick={handlePause} className="flex items-center gap-2 border border-amber-200 text-amber-600 bg-amber-50 text-xs font-bold rounded-lg px-4 py-2 hover:bg-amber-100 transition-colors">
              <PauseCircle size={13} /> Pause Cohort
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-bold text-gray-800">Delete this cohort</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Permanently delete cohort and all its data. This cannot be undone.</p>
            </div>
            <button onClick={handleDelete} className="flex items-center gap-2 border border-red-200 text-red-500 bg-red-50 text-xs font-bold rounded-lg px-4 py-2 hover:bg-red-100 transition-colors">
              <Trash2 size={13} /> Delete Cohort
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}