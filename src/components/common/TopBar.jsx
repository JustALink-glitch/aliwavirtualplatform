import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronDown, Search, Bell, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getUserFullName, getUserInitials } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import notificationsAPI from '../../services/notifications'

const cohorts = ['Cohort 1', 'Cohort 2', 'Cohort 3']

function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
}

export default function TopBar({
  onToggleSidebar,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search courses, trainers or students',
  showCohortSelector = true,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCohorts, setShowCohorts] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState('Cohort 1')
  const [notifications, setNotifications] = useState([])

  const notifRef = useRef()
  const profileRef = useRef()
  const cohortRef = useRef()

  useOutsideClick(notifRef, () => setShowNotifications(false))
  useOutsideClick(profileRef, () => setShowProfile(false))
  useOutsideClick(cohortRef, () => setShowCohorts(false))

  const unreadCount = notifications.filter(n => !n.read).length

  const loadNotifications = async () => {
    try {
      const result = await notificationsAPI.list()
      const items = result.notifications || result || []
      setNotifications(items.filter(item => item.type !== 'otp'))
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  useEffect(() => {
    let intervalId
    loadNotifications()
    intervalId = setInterval(loadNotifications, 5000)

    const refreshListener = () => loadNotifications()
    window.addEventListener('notifications:refresh', refreshListener)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('notifications:refresh', refreshListener)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = getUserInitials(user, 'AF')
  const fullName = getUserFullName(user) || 'Admin User'

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
        {showCohortSelector && (
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
                    }`}>
                    {c}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search — full on desktop, icon on mobile */}
      <div className="flex-1 max-w-md ml-auto hidden md:block">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400"
          />
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
                <button
                  className="text-xs text-[#2563EB] font-semibold hover:underline"
                  onClick={async () => {
                    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
                    await notificationsAPI.markAllRead()
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-500">
                  No new notifications.
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={n.id || i} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${n.read ? '' : 'bg-blue-50/40'}`}>
                    <div className="flex items-start gap-2">
                      {!n.read ? <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mt-1.5 flex-shrink-0" /> : <div className="w-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message || n.desc || ''}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at || n.time || '').toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            <input autoFocus
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
          </div>
        </div>
      )}
    </header>
  )
}
