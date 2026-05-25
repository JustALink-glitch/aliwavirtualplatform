import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronDown, Search, Bell, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const notifications = [
  { title: 'New student enrolled', desc: 'Fatima A. joined Data Analytics', time: '5 mins ago', unread: true },
  { title: 'Live class starting', desc: 'UX Design class starts in 10 mins', time: '10 mins ago', unread: true },
  { title: 'Attendance marked', desc: 'Victor O. marked DevOps attendance', time: '1 hour ago', unread: false },
  { title: 'Course updated', desc: 'Oyindamola updated Project Management', time: '2 hours ago', unread: false },
  { title: 'New trainer added', desc: 'Michael K. was assigned to UX Design', time: '1 day ago', unread: false },
]

const cohorts = ['Cohort 1', 'Cohort 2', 'Cohort 3']

function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
}

export default function TopBar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCohorts, setShowCohorts] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState('Cohort 1')

  const notifRef = useRef()
  const profileRef = useRef()
  const cohortRef = useRef()

  useOutsideClick(notifRef, () => setShowNotifications(false))
  useOutsideClick(profileRef, () => setShowProfile(false))
  useOutsideClick(cohortRef, () => setShowCohorts(false))

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'AF'
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Admin User'

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 z-10">

      {/* Sidebar toggle */}
      <button onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0">
        <Menu size={20} />
      </button>

      {/* Org + Cohort — hidden on mobile */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AF</div>
          <span className="text-sm font-semibold text-gray-800">ALIWA Foundation</span>
        </div>
        <div className="relative" ref={cohortRef}>
          <button onClick={() => setShowCohorts(!showCohorts)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            {selectedCohort} <ChevronDown size={14} />
          </button>
          {showCohorts && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36 z-30">
              {cohorts.map(c => (
                <button key={c} onClick={() => { setSelectedCohort(c); setShowCohorts(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    selectedCohort === c ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search — full on desktop, icon on mobile */}
      <div className="flex-1 max-w-md ml-auto hidden md:block">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input placeholder="Search courses, trainers or students"
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
        </div>
      </div>

      {/* Mobile search icon */}
      <button className="md:hidden ml-auto text-gray-500 hover:text-gray-800 p-1.5"
        onClick={() => setShowSearch(!showSearch)}>
        <Search size={18} />
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={18} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-72 z-30">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                <button className="text-xs text-[#2563EB] font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mt-1.5 flex-shrink-0" />}
                      {!n.unread && <div className="w-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="w-full text-xs text-[#2563EB] font-semibold hover:underline text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors">
            {initials}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-48 z-30">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email || 'No email'}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/${user?.role || 'admin'}/settings`)}>
                  <User size={14} className="text-gray-400" /> My Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/${user?.role || 'admin'}/settings`)}>
                  <Settings size={14} className="text-gray-400" /> Settings
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar — expands below topbar */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 px-4 py-3 md:hidden z-20">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input autoFocus placeholder="Search courses, trainers or students"
              className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
          </div>
        </div>
      )}
    </header>
  )
}