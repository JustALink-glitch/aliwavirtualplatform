import { useState, useEffect } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { User, Bell, Shield, Save, Camera, Eye, EyeOff } from 'lucide-react'
import { studentsAPI } from '../../services'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
]

function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    course: 'Data Analytics',
    cohort: 'Cohort 1'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        bio: user.bio || '',
        course: user.course || 'Data Analytics',
        cohort: user.cohort_name || 'Cohort 1'
      })
    }
  }, [user])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName) return toast.error('Name fields cannot be empty')
    try {
      setSaving(true)
      const res = await studentsAPI.update(user.id, {
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phone,
        bio: form.bio
      })
      if (res.success || res.user) {
        toast.success('Profile saved successfully!')
        onUpdate(res.user || { ...user, first_name: form.firstName, last_name: form.lastName, phone_number: form.phone, bio: form.bio })
      } else {
        toast.error(res.message || 'Failed to save profile')
      }
    } catch (err) {
      toast.error(err.message || 'Error saving student profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-[Manrope]">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Profile Settings</h3>
        <p className="text-xs text-gray-400">Update your student profile details</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold">
            {initials || 'ST'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
            <Camera size={11} className="text-gray-500" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">Custom student profile avatar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">FIRST NAME</label>
          <input name="firstName" value={form.firstName} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-700 font-semibold" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">LAST NAME</label>
          <input name="lastName" value={form.lastName} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-700 font-semibold" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">EMAIL ADDRESS</label>
        <input name="email" type="email" value={form.email} disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-400 font-semibold cursor-not-allowed" />
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">PHONE NUMBER</label>
        <input name="phone" value={form.phone} onChange={handle}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-700 font-semibold" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">COURSE</label>
          <input name="course" value={form.course} disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-400 font-semibold cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">COHORT</label>
          <input name="cohort" value={form.cohort} disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-400 font-semibold cursor-not-allowed" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">BIO</label>
        <textarea name="bio" value={form.bio} onChange={handle} rows={3}
          placeholder="Tell us a little about yourself..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none text-gray-700 font-semibold" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-5 py-2.5 hover:bg-blue-700 transition">
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function NotificationsTab() {
  const groups = [
    { title: 'Class Notifications', items: [
      { label: 'Session reminders', desc: 'Get reminded 30 mins before a class starts', key: 'sessionReminder' },
      { label: 'New session scheduled', desc: 'When your trainer schedules a new class', key: 'newSession' },
      { label: 'Session recording available', desc: 'When a class recording is uploaded', key: 'recording' },
    ]},
    { title: 'Assignment Notifications', items: [
      { label: 'Assignment due reminder', desc: 'Reminder 24hrs before assignment is due', key: 'assignmentReminder' },
      { label: 'Assignment graded', desc: 'When your trainer grades your submission', key: 'graded' },
      { label: 'New assignment posted', desc: 'When a new assignment is added', key: 'newAssignment' },
    ]},
  ]

  const handleSave = () => {
    toast.success('Notification preferences updated!')
  }

  return (
    <div className="max-w-2xl space-y-6 font-[Manrope]">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Notification Preferences</h3>
        <p className="text-xs text-gray-400">Control what notifications you receive</p>
      </div>
      {groups.map(({ title, items }) => (
        <div key={title}>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">{title}</p>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {items.map(({ label, desc, key }) => (
              <div key={key} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input type="checkbox" defaultChecked onChange={handleSave} className="sr-only peer" />
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
  const [submitting, setSubmitting] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPass !== form.confirm) return toast.error('Passwords do not match')
    if (form.newPass.length < 8) return toast.error('Password must be at least 8 characters')
    try {
      setSubmitting(true)
      toast.success('Password updated successfully!')
      setForm({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  const checks = [
    { label: 'At least 8 characters', pass: form.newPass.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(form.newPass) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(form.newPass) },
    { label: 'Passwords match', pass: form.newPass === form.confirm && form.confirm !== '' },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-[Manrope]">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Security Settings</h3>
        <p className="text-xs text-gray-400">Manage your password and account security</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-bold text-gray-800">Change Password</p>

        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">CURRENT PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-xs focus-within:border-[#2563EB] bg-white">
            <input type={showCurrent ? 'text' : 'password'} name="current" value={form.current} onChange={handle} required
              placeholder="Enter current password"
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-semibold" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">NEW PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-xs focus-within:border-[#2563EB] bg-white">
            <input type={showNew ? 'text' : 'password'} name="newPass" value={form.newPass} onChange={handle} required
              placeholder="Enter new password"
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-semibold" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-700 tracking-wider mb-1">CONFIRM PASSWORD</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-xs focus-within:border-[#2563EB] bg-white">
            <input type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handle} required
              placeholder="Confirm new password"
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-semibold" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {form.newPass && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
            {checks.map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${pass ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${pass ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <span className={`text-[10px] font-bold ${pass ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg px-5 py-2.5 hover:bg-blue-700 transition">
            <Save size={14} /> Update Password
          </button>
        </div>
      </div>
    </form>
  )
}

export default function StudentSettingsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { user, updateUser } = useAuth()
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
    } else {
      const saved = localStorage.getItem('user')
      if (saved) setCurrentUser(JSON.parse(saved))
    }
  }, [user])

  const handleUpdateUser = (updated) => {
    setCurrentUser(updated)
    updateUser(updated)
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="w-full md:w-44 md:flex-shrink-0 bg-white rounded-xl border border-gray-100 p-2 h-fit shadow-sm">
              <nav className="space-y-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === id ? 'bg-[#2563EB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-4 md:p-6 shadow-sm">
              {activeTab === 'profile' && <ProfileTab user={currentUser} onUpdate={handleUpdateUser} />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'security' && <SecurityTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}