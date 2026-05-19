import { useEffect, useMemo, useState } from 'react'
import Modal from '../../common/Modal'
import { Upload } from 'lucide-react'
import { cohortsAPI, coursesAPI, studentsAPI } from '../../../services'
import toast from 'react-hot-toast'

export default function OnboardStudentModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState('single')
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', courseId: '', cohortId: ''
  })
  const [courses, setCourses] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [coursesRes, cohortsRes] = await Promise.all([
          coursesAPI.list(),
          cohortsAPI.list()
        ])
        setCourses(coursesRes.courses || [])
        setCohorts(cohortsRes.cohorts || [])
      } catch (err) {
        toast.error('Failed to load courses and cohorts')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [isOpen])

  const visibleCourses = useMemo(() => {
    if (!form.cohortId) return courses
    return courses.filter(course => course.cohort_id === form.cohortId)
  }, [courses, form.cohortId])

  const handleSubmit = async () => {
    const names = form.fullName.trim().split(/\s+/)
    const firstName = names[0] || ''
    const lastName = names.slice(1).join(' ')

    if (!firstName || !lastName || !form.email || !form.courseId || !form.cohortId) {
      toast.error('Full name, email, course, and cohort are required.')
      return
    }

    try {
      setLoading(true)
      await studentsAPI.onboard({
        firstName,
        lastName,
        email: form.email.trim(),
        phone: form.phone.trim(),
        courseId: form.courseId,
        cohortId: form.cohortId
      })
      toast.success('Student onboarded successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to onboard student')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Onboard Students">
      <div className="space-y-4">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['single', 'bulk'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all capitalize ${
                tab === t
                  ? 'bg-white text-[#2563EB] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'single' ? 'Single Student' : 'Bulk Upload'}
            </button>
          ))}
        </div>

        {tab === 'single' ? (
          <>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                FULL NAME <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handle}
                placeholder="Enter student full name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="Enter email address"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PHONE NUMBER
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="Enter phone number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>

            {/* Course + Cohort */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  COURSE <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handle}
                  disabled={loadingOptions}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
                >
                  <option value="">{loadingOptions ? 'Loading...' : 'Select'}</option>
                  {visibleCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  COHORT <span className="text-red-500">*</span>
                </label>
                <select
                  name="cohortId"
                  value={form.cohortId}
                  onChange={(e) => setForm({ ...form, cohortId: e.target.value, courseId: '' })}
                  disabled={loadingOptions}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
                >
                  <option value="">{loadingOptions ? 'Loading...' : 'Select'}</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Bulk Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#2563EB] transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload size={18} className="text-[#2563EB]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Click to upload CSV file</p>
                <p className="text-xs text-gray-400 mt-0.5">or drag and drop here</p>
              </div>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">.CSV files only</span>
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-blue-700">Download template</p>
                <p className="text-[11px] text-blue-500 mt-0.5">Use our CSV template to avoid errors</p>
              </div>
              <button className="text-xs text-[#2563EB] font-bold hover:underline">
                Download →
              </button>
            </div>

            {/* Course + Cohort for bulk */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">COURSE</label>
                <select name="courseId" value={form.courseId} onChange={handle} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600">
                  <option value="">Select</option>
                  {visibleCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT</label>
                <select name="cohortId" value={form.cohortId} onChange={(e) => setForm({ ...form, cohortId: e.target.value, courseId: '' })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600">
                  <option value="">Select</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

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
            {loading ? 'Processing…' : (tab === 'single' ? 'Onboard Student' : 'Upload & Onboard')}
          </button>
        </div>

      </div>
    </Modal>
  )
}
