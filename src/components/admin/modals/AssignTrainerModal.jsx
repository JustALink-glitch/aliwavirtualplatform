import { useEffect, useState } from 'react'
import Modal from '../../common/Modal'
import { coursesAPI, trainersAPI } from '../../../services'
import toast from 'react-hot-toast'

export default function AssignTrainerModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    trainerId: '', courseId: '', role: '', startDate: ''
  })
  const [courses, setCourses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    if (!isOpen) return

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [coursesRes, trainersRes] = await Promise.all([
          coursesAPI.list(),
          trainersAPI.list({ status: 'active' })
        ])
        setCourses(coursesRes.courses || [])
        setTrainers(trainersRes.users || [])
      } catch (err) {
        toast.error('Failed to load trainers and courses')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [isOpen])

  const handleSubmit = async () => {
    if (!form.trainerId || !form.courseId) {
      toast.error('Trainer and Course are required fields.')
      return
    }

    try {
      setLoading(true)
      const res = await coursesAPI.assignTrainer(form.courseId, form.trainerId)
      toast.success(res.message || 'Trainer assigned successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to assign trainer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Trainer">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SELECT TRAINER <span className="text-red-500">*</span>
          </label>
          <select
            name="trainerId"
            value={form.trainerId}
            onChange={handle}
            disabled={loadingOptions}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
          >
            <option value="">{loadingOptions ? 'Loading...' : 'Choose a trainer'}</option>
            {trainers.map(trainer => (
              <option key={trainer.id} value={trainer.id}>
                {`${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || trainer.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ASSIGN TO COURSE <span className="text-red-500">*</span>
          </label>
          <select
            name="courseId"
            value={form.courseId}
            onChange={handle}
            disabled={loadingOptions}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
          >
            <option value="">{loadingOptions ? 'Loading...' : 'Choose a course'}</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

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

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <p className="text-xs text-blue-700 font-medium">
            The trainer will immediately be able to view this course and schedule sessions for it.
          </p>
        </div>

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
            {loading ? 'Assigning...' : 'Assign Trainer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
