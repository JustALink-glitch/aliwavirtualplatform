import { useState } from 'react'
import TrainerSidebar from '../../components/trainer/TrainerSidebar'
import TrainerTopBar from '../../components/trainer/TrainerTopBar'
import { User, Bell, Shield, Save, Camera, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
]

function ProfileTab() {
  const [form, setForm] = useState({
    firstName: 'Abdulhameed', lastName: 'Olamilekan',
    email: 'abdulhameed@gmail.com', phone: '+234 913 634 5555',
    bio: '', expertise: 'Data Analytics', experience: '3 years'
  })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Profile Settings</h3>
        <p className="text-xs text-gray-400">Update your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold">AO</div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
            <Camera size={11} className="text-gray-500" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG or PNG, max 2MB</p>
          <button className="text-xs text-[#2563EB] font-semibold mt-1 hover:underline">Upload new photo</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">FIRST NAME</label>
          <input name="firstName" value={form.firstName} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">LAST NAME</label>
          <input name="lastName" value={form.lastName} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">EMAIL ADDRESS</label>
        <input name="email" type="email" value={form.email} onChange={handle}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">PHONE NUMBER</label>
          <input name="phone" value={form.phone} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">YEARS OF EXPERIENCE</label>
          <input name="experience" value={form.experience} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">AREA OF EXPERTISE</label>
        <input name="expertise" value={form.expertise} onChange={handle}
          placeholder="e.g. Data Analytics, UX Design"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">BIO</label>
        <textarea name="bio" value={form.bio} onChange={handle} rows={3}
          placeholder="Write a short bio about yourself..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700">
          <Save size={14} /> Save Changes
        </button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const groups = [
    { title: 'Class Notifications', items: [
      { label: 'Session reminders', desc: 'Get reminded 30 mins before a class starts', key: 'sessionReminder' },
      { label: 'Student joins session', desc: 'When a student joins your live class', key: 'studentJoin' },
      { label: 'Low attendance alert', desc: 'When class attendance drops below 60%', key: 'lowAttendance' },
    ]},
    { title: 'Assignment Notifications', items: [
      { label: 'New submission', desc: 'When a student submits an assignment', key: 'newSubmission' },
      { label: 'Overdue assignments', desc: 'Daily reminder for ungraded assignments', key: 'overdue' },
    ]},
    { title: 'Student Notifications', items: [
      { label: 'Student at risk alert', desc: 'When a student falls below performance threshold', key: 'atRisk' },
      { label: 'New student enrolled', desc: 'When a new student joins your course', key: 'newStudent' },
    ]},
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Notification Preferences</h3>
        <p className="text-xs text-gray-400">Control what notifications you receive</p>
      </div>
      {groups.map(({ title, items }) => (
        <div key={title}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {items.map(({ label, desc, key }) => (
              <div key={key} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const checks = [
    { label: 'At least 8 characters', pass: form.newPass.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(form.newPass) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(form.newPass) },
    { label: 'Passwords match', pass: form.newPass === form.confirm && form.confirm !== '' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Security Settings</h3>
        <p className="text-xs text-gray-400">Manage your password and account security</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-bold text-gray-800">Change Password</p>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">CURRENT PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
            <input type={showCurrent ? 'text' : 'password'} name="current" value={form.current} onChange={handle}
              placeholder="Enter current password"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">NEW PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
            <input type={showNew ? 'text' : 'password'} name="newPass" value={form.newPass} onChange={handle}
              placeholder="Enter new password"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
            <button onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">CONFIRM PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
            <input type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handle}
              placeholder="Confirm new password"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
            <button onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Password checks */}
        {form.newPass && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            {checks.map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${pass ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${pass ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <span className={`text-xs ${pass ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700">
            <Save size={14} /> Update Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>
    </div>
  )
}

export default function TrainerSettingsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <TrainerSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">

            {/* Left nav */}
            <div className="w-full md:w-44 md:flex-shrink-0 bg-white rounded-xl border border-gray-100 p-2 h-fit">
              <nav className="space-y-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === id ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-4 md:p-6">
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'security' && <SecurityTab />}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}