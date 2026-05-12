import { useState } from 'react'
import Modal from '../../common/Modal'

export default function AssignTrainerModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    trainer: '', course: '', role: '', startDate: ''
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    console.log('Trainer assigned:', form)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Trainer">
      <div className="space-y-4">

        {/* Select Trainer */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SELECT TRAINER <span className="text-red-500">*</span>
          </label>
          <select
            name="trainer"
            value={form.trainer}
            onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
          >
            <option value="">Choose a trainer</option>
            <option>Abdulhameed O.</option>
            <option>Oyindamola O.</option>
            <option>Michael K.</option>
            <option>Victor O.</option>
            <option>Bewaji O.</option>
          </select>
        </div>

        {/* Assign to Course */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ASSIGN TO COURSE <span className="text-red-500">*</span>
          </label>
          <select
            name="course"
            value={form.course}
            onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
          >
            <option value="">Choose a course</option>
            <option>Data Analytics</option>
            <option>Project Management</option>
            <option>UX Design</option>
            <option>DevOps</option>
            <option>Full Stack Dev</option>
          </select>
        </div>

        {/* Role + Start Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ROLE</label>
            <select
              name="role"
              value={form.role}
              onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
            >
              <option value="">Select</option>
              <option>Lead Trainer</option>
              <option>Co-Trainer</option>
              <option>Guest Trainer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">START DATE</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
            />
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <p className="text-xs text-blue-700 font-medium">
            The trainer will receive an email notification once assigned to the course.
          </p>
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
            className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors"
          >
            Assign Trainer
          </button>
        </div>

      </div>
    </Modal>
  )
}