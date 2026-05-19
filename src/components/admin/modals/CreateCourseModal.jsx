import { useState } from 'react'
import Modal from '../../common/Modal'
import { coursesAPI } from '../../../services'
import toast from 'react-hot-toast'

export default function CreateCourseModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', trainer: '', category: '', duration: '', description: '', status: 'Ongoing'
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await coursesAPI.create(form)
      toast.success('Course created successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to create course')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Course">
      <div className="space-y-4">

        {/* Course Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            COURSE NAME <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handle}
            placeholder="e.g. Data Analytics"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        

        {/* Category + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">CATEGORY</label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
            >
              <option value="">Select</option>
              <option>Technology</option>
              <option>Design</option>
              <option>Business</option>
              <option>Marketing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">DURATION</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handle}
              placeholder="e.g. 8 weeks"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">STATUS</label>
          <div className="flex gap-3">
            {['Ongoing', 'Paused', 'Stopped'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={form.status === s}
                  onChange={handle}
                  className="accent-[#2563EB]"
                />
                <span className="text-sm text-gray-600">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handle}
            placeholder="Brief description of the course..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Course'}
          </button>
        </div>

      </div>
    </Modal>
  )
}