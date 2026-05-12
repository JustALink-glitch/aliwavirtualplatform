import { useState } from 'react'
import Modal from '../../common/Modal'
import { Upload, X } from 'lucide-react'

export default function OnboardStudentModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('single')
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', course: '', cohort: ''
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    console.log('Student onboarded:', form)
    onClose()
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
                  name="course"
                  value={form.course}
                  onChange={handle}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
                >
                  <option value="">Select</option>
                  <option>Data Analytics</option>
                  <option>Project Management</option>
                  <option>UX Design</option>
                  <option>DevOps</option>
                  <option>Full Stack Dev</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  COHORT <span className="text-red-500">*</span>
                </label>
                <select
                  name="cohort"
                  value={form.cohort}
                  onChange={handle}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600"
                >
                  <option value="">Select</option>
                  <option>Cohort 1</option>
                  <option>Cohort 2</option>
                  <option>Cohort 3</option>
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
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600">
                  <option value="">Select</option>
                  <option>Data Analytics</option>
                  <option>Project Management</option>
                  <option>UX Design</option>
                  <option>DevOps</option>
                  <option>Full Stack Dev</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">COHORT</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors text-gray-600">
                  <option value="">Select</option>
                  <option>Cohort 1</option>
                  <option>Cohort 2</option>
                  <option>Cohort 3</option>
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
            className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors"
          >
            {tab === 'single' ? 'Onboard Student' : 'Upload & Onboard'}
          </button>
        </div>

      </div>
    </Modal>
  )
}