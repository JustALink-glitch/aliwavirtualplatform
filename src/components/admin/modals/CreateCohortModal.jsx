import { useState } from 'react'
import Modal from '../../common/Modal'
import { cohortsAPI } from '../../../services'
import toast from 'react-hot-toast'

export default function CreateCohortModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'Ongoing'
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await cohortsAPI.create(form)
      toast.success('Cohort created successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to create cohort')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Cohort">
      <div className="space-y-4">

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT NAME <span className="text-red-500">*</span></label>
          <input name="name" value={form.name} onChange={handle} placeholder="e.g. Cohort 4"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
          <textarea name="description" value={form.description} onChange={handle}
            placeholder="Brief description of this cohort..." rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">START DATE</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">END DATE</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">STATUS</label>
          <div className="flex gap-3">
            {['Ongoing', 'Draft', 'Paused'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value={s} checked={form.status === s}
                  onChange={handle} className="accent-[#2563EB]" />
                <span className="text-sm text-gray-600">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Creating…' : 'Create Cohort'}
          </button>
        </div>

      </div>
    </Modal>
  )
}