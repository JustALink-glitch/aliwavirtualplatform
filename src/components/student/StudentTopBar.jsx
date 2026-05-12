import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react'

const notifications = [
  { title: 'New session scheduled', desc: 'Data Analytics class on Apr 22 at 4:30 PM', time: '1 hour ago', unread: true },
  { title: 'Assignment graded', desc: 'Your Hero Section Design got 85/100', time: '2 hours ago', unread: true },
  { title: 'Resource uploaded', desc: 'New lecture slides added to Data Analytics', time: '1 day ago', unread: false },
]

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cb])
}

export default function StudentTopBar({ onToggleSidebar }) {
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const notifRef = useRef()
  const profileRef = useRef()
  useOutsideClick(notifRef, () => setShowNotif(false))
  useOutsideClick(profileRef, () => setShowProfile(false))

  const unread = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 relative">
      <button onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0">
        <Menu size={20} />
      </button>

      {/* Org — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-white text-xs font-bold">AF</div>
        <span className="text-sm font-semibold text-gray-800">ALIWA Foundation</span>
      </div>

      {/* Search — desktop */}
      <div className="flex-1 max-w-md ml-auto hidden md:block">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input placeholder="Search courses, sessions..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
        </div>
      </div>

      {/* Mobile search icon */}
      <button className="md:hidden ml-auto text-gray-500 hover:text-gray-800 p-1.5"
        onClick={() => setShowSearch(!showSearch)}>
        <Search size={18} />
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={18} className="text-gray-500" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {unread}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-72 z-30">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
              <button className="text-xs text-[#2563EB] font-semibold">Mark all read</button>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.unread ? 'bg-blue-50/40' : ''}`}>
                  <div className="flex gap-2">
                    {n.unread && <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mt-1.5 flex-shrink-0" />}
                    {!n.unread && <div className="w-1.5 flex-shrink-0" />}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button className="text-xs text-[#2563EB] font-semibold">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative" ref={profileRef}>
        <div onClick={() => setShowProfile(!showProfile)}
          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-green-600 transition-colors">
          MK
        </div>
        {showProfile && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg w-48 z-30">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Michael Kaine</p>
              <p className="text-xs text-gray-400 mt-0.5">michael@gmail.com</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Student</p>
            </div>
            <div className="py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <User size={13} className="text-gray-400" /> My Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <Settings size={13} className="text-gray-400" /> Settings
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 px-4 py-3 md:hidden z-20">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input autoFocus placeholder="Search courses, sessions..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
          </div>
        </div>
      )}
    </header>
  )
}