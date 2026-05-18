import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { User, Building, Bell, Shield, Palette, Save, Camera, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { trainersAPI } from '../../services'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', role: 'Administrator', bio: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        role: user.role === 'admin' ? 'Administrator' : user.role,
        bio: user.bio || ''
      })
    }
  }, [user])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName) return toast.error('First and Last Name are required')
    try {
      setSaving(true)
      const res = await trainersAPI.update(user.id, {
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phone,
        bio: form.bio
      })
      if (res.success || res.user) {
        toast.success('Profile updated successfully!')
        onUpdate(res.user || { ...user, first_name: form.firstName, last_name: form.lastName, phone_number: form.phone, bio: form.bio })
      } else {
        toast.error(res.message || 'Failed to update profile')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while updating profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Profile Settings</h3>
        <p className="text-xs text-gray-400">Update your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold">
            {initials || 'AD'}
          </div>
          <button type="button" className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
            <Camera size={11} className="text-gray-500" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">Assigned profile avatar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">FIRST NAME</label>
          <input name="firstName" value={form.firstName} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">LAST NAME</label>
          <input name="lastName" value={form.lastName} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">EMAIL ADDRESS</label>
        <input name="email" type="email" value={form.email} disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">PHONE NUMBER</label>
          <input name="phone" value={form.phone} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ROLE</label>
          <input name="role" value={form.role} disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">BIO</label>
        <textarea name="bio" value={form.bio} onChange={handle} rows={3}
          placeholder="Write a short bio..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700">
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function OrganizationTab() {
  const [form, setForm] = useState({
    name: 'ALIWA Foundation', email: 'info@aliwa.org',
    phone: '+234 913 634 5555', website: 'www.aliwa.org',
    address: 'Lagos, Nigeria', description: ''
  })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Organization Settings</h3>
        <p className="text-xs text-gray-400">Manage your organization details</p>
      </div>

      {/* Org logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-amber-700 flex items-center justify-center text-white text-xl font-bold">AF</div>
          <button className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
            <Camera size={11} className="text-gray-500" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Organization Logo</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG or PNG, max 2MB</p>
          <button className="text-xs text-[#2563EB] font-semibold mt-1 hover:underline">Upload logo</button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">ORGANIZATION NAME</label>
        <input name="name" value={form.name} onChange={handle}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">EMAIL</label>
          <input name="email" value={form.email} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">PHONE</label>
          <input name="phone" value={form.phone} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">WEBSITE</label>
          <input name="website" value={form.website} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ADDRESS</label>
          <input name="address" value={form.address} onChange={handle}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
        <textarea name="description" value={form.description} onChange={handle} rows={3}
          placeholder="Brief description of your organization..."
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
  const notifications = [
    { group: 'Platform Activity', items: [
      { label: 'New student enrolled', desc: 'Get notified when a new student joins', key: 'newStudent' },
      { label: 'Trainer invitation accepted', desc: 'When a trainer accepts their invite', key: 'trainerAccepted' },
      { label: 'New assignment submitted', desc: 'When a student submits an assignment', key: 'newAssignment' },
      { label: 'Live class started', desc: 'When a trainer starts a live class', key: 'liveClass' },
    ]},
    { group: 'Reports & Alerts', items: [
      { label: 'Weekly attendance report', desc: 'Receive weekly attendance summary', key: 'weeklyReport' },
      { label: 'Student at risk alert', desc: 'When a student falls below 60% attendance', key: 'atRisk' },
      { label: 'Course completion alert', desc: 'When a course is 100% complete', key: 'courseComplete' },
    ]},
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Notification Preferences</h3>
        <p className="text-xs text-gray-400">Control what notifications you receive</p>
      </div>
      {notifications.map(({ group, items }) => (
        <div key={group}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{group}</p>
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
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
          <input name="current" type="password" value={form.current} onChange={handle}
            placeholder="Enter current password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">NEW PASSWORD</label>
          <input name="newPass" type="password" value={form.newPass} onChange={handle}
            placeholder="Enter new password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">CONFIRM NEW PASSWORD</label>
          <input name="confirm" type="password" value={form.confirm} onChange={handle}
            placeholder="Confirm new password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex justify-end pt-1">
          <button className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700">
            <Save size={14} /> Update Password
          </button>
        </div>
      </div>

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

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-red-500" />
          <p className="text-sm font-bold text-red-500">Danger Zone</p>
        </div>
        <div className="border border-red-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Delete Account</p>
            <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</p>
          </div>
          <button className="flex items-center gap-2 border border-red-200 text-red-500 bg-red-50 text-xs font-semibold rounded-lg px-4 py-2 hover:bg-red-100">
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

function AppearanceTab() {
  const [theme, setTheme] = useState('light')
  const [accent, setAccent] = useState('#2563EB')

  const accents = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2']

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Appearance</h3>
        <p className="text-xs text-gray-400">Customize how the platform looks</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-800 mb-3">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className={`border-2 rounded-xl p-4 text-left transition-colors ${
                  theme === t ? 'border-[#2563EB]' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`h-12 rounded-lg mb-2 ${t === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`} />
                <p className={`text-xs font-semibold capitalize ${theme === t ? 'text-[#2563EB]' : 'text-gray-700'}`}>{t} Mode</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-3">Accent Color</p>
          <div className="flex items-center gap-3">
            {accents.map(color => (
              <button key={color} onClick={() => setAccent(color)}
                style={{ background: color }}
                className={`w-8 h-8 rounded-full transition-transform ${accent === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : 'hover:scale-110'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700">
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
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
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">

            {/* Left — Tab nav */}
            <div className="w-full md:w-44 md:flex-shrink-0 bg-white rounded-xl border border-gray-100 p-2 h-fit">
              <nav className="space-y-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
  activeTab === id
    ? 'bg-[#2563EB] text-white'
    : 'text-gray-600 hover:bg-gray-50'
}`}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right — Content */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-4 md:p-6">
              {activeTab === 'profile' && <ProfileTab user={currentUser} onUpdate={handleUpdateUser} />}
              {activeTab === 'organization' && <OrganizationTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'appearance' && <AppearanceTab />}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}