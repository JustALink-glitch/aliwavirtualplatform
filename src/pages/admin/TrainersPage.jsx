import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { UserPlus, MoreHorizontal, Eye, Trash2, X, ChevronDown } from 'lucide-react'
import { trainersAPI } from '../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-purple-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-pink-500',
]

const statusStyles = {
  active: 'bg-green-50 text-green-700 border border-green-200 font-semibold',
  pending: 'bg-amber-50 text-amber-600 border border-amber-200 font-semibold',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200 font-semibold',
}

function TrainerModal({ trainer, onClose, onRevoke }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${trainer.color || 'bg-[#2563EB]'} flex items-center justify-center text-white text-base font-bold`}>
              {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{trainer.name}</p>
              <p className="text-xs text-gray-400">ID: {trainer.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trainer's Information</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'Full Name', value: trainer.name },
            { label: 'Gender', value: trainer.gender || 'N/A' },
            { label: 'Email Address', value: trainer.email },
            { label: 'Phone', value: trainer.phone || 'N/A' },
            { label: 'Status', value: trainer.status ? trainer.status.toUpperCase() : 'PENDING' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-xs font-bold text-gray-700 break-all">{value}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => { onRevoke(trainer.id); onClose() }}
          className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-bold rounded-lg py-2.5 hover:bg-red-100 transition-colors"
        >
          Revoke Access / Suspend
        </button>
      </div>
    </div>
  )
}

function ActionMenu({ onClose, onView, onDelete }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40 font-[Manrope]" onClick={e => e.stopPropagation()}>
      <button onClick={onView} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-left">
        <Eye size={13} className="text-gray-400" /> View Profile
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 text-left">
        <Trash2 size={13} /> Remove Trainer
      </button>
    </div>
  )
}

function InviteTrainerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and Email are required!')
      return
    }
    try {
      setLoading(true)
      const parts = form.name.trim().split(' ')
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      
      const payload = {
        email: form.email.trim(),
        firstName,
        lastName,
        role: 'trainer'
      }
      
      const res = await trainersAPI.invite(payload)
      if (res.success) {
        toast.success('Trainer invited successfully!')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Failed to invite trainer')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to invite trainer')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Invite Trainer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">FULL NAME <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handle} placeholder="Enter trainer name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">EMAIL ADDRESS <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="Enter email address"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700 font-medium">An invitation email will be sent to the trainer to set their password and log in.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#2563EB] text-white text-sm font-bold rounded-lg py-2.5 hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainersPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [sortBy, setSortBy] = useState('Name')
  const [showSort, setShowSort] = useState(false)
  const [trainersList, setTrainersList] = useState([])
  const [loading, setLoading] = useState(true)
  const sortRef = useRef()

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const res = await trainersAPI.list()
      if (res.success) {
        setTrainersList(res.users || res.trainers || [])
      } else {
        toast.error(res.message || 'Failed to load trainers')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while fetching trainers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this trainer from the system?')) return
    try {
      const res = await trainersAPI.remove(id)
      if (res.success) {
        toast.success('Trainer removed successfully!')
        fetchTrainers()
      } else {
        toast.error(res.message || 'Failed to remove trainer')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove trainer')
    }
  }

  const handleRevoke = async (id) => {
    try {
      const res = await trainersAPI.revoke(id)
      if (res.success) {
        toast.success('Trainer access revoked successfully!')
        fetchTrainers()
      } else {
        toast.error(res.message || 'Failed to revoke trainer access')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to revoke access')
    }
  }

  const mappedTrainers = trainersList.map((t, idx) => ({
    id: t.id,
    name: `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'No Name',
    email: t.email,
    phone: t.phone_number || 'N/A',
    gender: t.gender || 'N/A',
    status: (t.status || 'pending').toLowerCase(),
    color: cardColors[idx % cardColors.length],
    course: 'General Curriculum',
  }))

  const sorted = [...mappedTrainers].sort((a, b) => {
    if (sortBy === 'Name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  const filtered = sorted.filter(t => {
    const matchTab = activeTab === 'All' || t.status === activeTab.toLowerCase()
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900">Trainers</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
                <UserPlus size={14} /> Invite Trainer
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Trainers', value: trainersList.length.toString(), iconBg: 'bg-orange-50', icon: '👨‍🏫' },
              { label: 'Active Access', value: trainersList.filter(t => t.status === 'active').length.toString(), iconBg: 'bg-green-50', icon: '📊' },
              { label: 'Pending Invites', value: trainersList.filter(t => t.status === 'pending').length.toString(), iconBg: 'bg-blue-50', icon: '📩' },
            ].map(({ label, value, iconBg, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-base`}>{icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Sort + Search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {['All', 'Active', 'Pending', 'Inactive'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === tab ? 'bg-[#2563EB] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={sortRef}>
                <button onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 font-semibold">
                  Sort: {sortBy} <ChevronDown size={12} />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 z-20">
                    {['Name'].map(opt => (
                      <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false) }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                          sortBy === opt ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-44">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trainer..."
                  className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <p className="text-gray-500 text-sm font-medium mb-3">No trainers found</p>
              <button 
                onClick={() => setShowInvite(true)}
                className="text-xs text-[#2563EB] font-bold hover:underline"
              >
                Invite a trainer now &rarr;
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Trainer', 'Email', 'Phone', 'Gender', 'Status', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(trainer => (
                      <tr key={trainer.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelected(trainer)}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${trainer.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                              {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">{trainer.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold">Trainer</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{trainer.email}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{trainer.phone}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{trainer.gender}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[trainer.status] || 'bg-gray-100 text-gray-600'}`}>
                            {trainer.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setOpenMenu(openMenu === trainer.id ? null : trainer.id)}
                            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenu === trainer.id && (
                            <ActionMenu
                              onClose={() => setOpenMenu(null)}
                              onView={() => { setSelected(trainer); setOpenMenu(null) }}
                              onDelete={() => handleDelete(trainer.id)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <TrainerModal trainer={selected} onClose={() => setSelected(null)} onRevoke={handleRevoke} />}
      {showInvite && <InviteTrainerModal onClose={() => setShowInvite(false)} onSuccess={fetchTrainers} />}
    </div>
  )
}