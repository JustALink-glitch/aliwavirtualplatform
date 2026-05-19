import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Video, ClipboardList, Star, Settings, LogOut, X, HelpCircle } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: BookOpen, label: 'My Course', path: '/student/course' },
  { icon: Video, label: 'My Sessions', path: '/student/sessions' },
  { icon: ClipboardList, label: 'My Assignments', path: '/student/assignments' },
  { icon: Star, label: 'My Grades', path: '/student/grades' },
  { icon: Settings, label: 'Settings', path: '/student/settings' },
  { icon: HelpCircle, label: 'Help & FAQ', path: '/student/help' },
]

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs z-10 p-6 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut size={20} className="text-red-500" />
        </div>
        <h2 className="text-sm font-bold text-gray-800 mb-1">Sign out?</h2>
        <p className="text-xs text-gray-400 mb-5">You'll need to sign in again to access your dashboard.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-red-600">Sign out</button>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, activePath, onClose, isMobile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`px-3 py-4 flex items-center gap-2 border-b border-gray-100 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2563EB] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            {(!collapsed || isMobile) && <span className="text-sm font-bold text-gray-900 whitespace-nowrap">training ops</span>}
          </div>
          {isMobile && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-5 overflow-y-auto">
          {(!collapsed || isMobile) && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
          )}
          <ul className="space-y-0.5">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = activePath ? activePath === path : location.pathname === path
              return (
                <li key={label}>
                  <Link to={path} title={collapsed && !isMobile ? label : ''}
                    onClick={isMobile ? onClose : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      collapsed && !isMobile ? 'justify-center' : ''
                    } ${isActive ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon size={17} className="flex-shrink-0" />
                    {(!collapsed || isMobile) && <span className="flex-1 whitespace-nowrap">{label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Profile */}
        <div className="px-2 py-4 border-t border-gray-100">
          <div onClick={() => setShowLogout(true)}
            className={`flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer group ${
              collapsed && !isMobile ? 'justify-center' : ''
            }`}>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">MK</div>
            {(!collapsed || isMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">Michael Kaine</p>
                  <p className="text-xs text-gray-400 truncate">Student</p>
                </div>
                <LogOut size={15} className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
              </>
            )}
          </div>
        </div>
      </div>

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); navigate('/login') }}
        />
      )}
    </>
  )
}

export default function StudentSidebar({ collapsed, activePath }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(true)}>
        <span className="text-gray-600 text-lg leading-none">☰</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl z-50">
            <SidebarContent collapsed={false} activePath={activePath} onClose={() => setMobileOpen(false)} isMobile={true} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? 'w-[64px]' : 'w-[230px]'} transition-all duration-300 bg-white border-r border-gray-100 flex-col flex-shrink-0 h-screen overflow-hidden`}>
        <SidebarContent collapsed={collapsed} activePath={activePath} isMobile={false} />
      </aside>
    </>
  )
}