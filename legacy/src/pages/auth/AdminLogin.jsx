import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Lock, Mail, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  student: '/student/dashboard',
}

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success('Access granted. Welcome back.')
      if (user.isFirstLogin) {
        navigate('/set-password')
      } else {
        navigate(ROLE_ROUTES[user.role] || '/login')
      }
    } catch (err) {
      const message = err.message || 'Authentication failed. Please verify your credentials.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen flex font-[Manrope,sans-serif]">
      {/* Left panel — dark branded side */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f2044 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-none">ALIWA</p>
            <p className="text-blue-300 text-[10px] font-semibold uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-800/40 rounded-full px-3 py-1 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-blue-300 font-bold tracking-wide">Secure Admin Access</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Control Centre<br />
              <span className="text-blue-400">for Learning Ops</span>
            </h1>
            <p className="text-blue-200/70 text-sm mt-4 leading-relaxed max-w-xs">
              Manage cohorts, trainers, students, and learning programmes from one powerful command centre.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5">
            {[
              'Cohort & Course Management',
              'Trainer & Student Onboarding',
              'Reports & Attendance Insights',
              'Platform-wide Settings',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={10} className="text-blue-400" />
                </div>
                <span className="text-sm text-blue-100/80 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-blue-400/50 text-xs font-semibold relative z-10">
          © 2026 ALIWA Foundation · Training Operations Platform
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-[#F1F5F9]">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-extrabold text-sm leading-none">ALIWA Admin Portal</p>
            <p className="text-gray-400 text-[10px]">Restricted access</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-[#2563EB] rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-3">
              <Lock size={10} />
              Administrator Login
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Welcome back,<br />Admin</h2>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to access the admin control centre.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="admin@aliwa.org"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Lock size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter admin password"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-300 bg-transparent"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-[10px] font-black">!</span>
                </div>
                <p className="text-xs text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {/* Forgot */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[#2563EB] font-bold hover:underline">
                Forgot your password?
              </Link>
            </div>

            {/* CTA */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full text-white text-sm font-bold rounded-xl py-3 transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={15} />
                  Access Admin Dashboard
                </>
              )}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">🔐 Demo Credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Email: <span className="font-bold text-gray-700">admin@trainingops.com</span></p>
              <p className="text-xs text-gray-500">Password: <span className="font-bold text-gray-700">Admin@1234</span></p>
            </div>
          </div>

          {/* Create account */}
          <p className="text-center text-xs text-gray-500 mt-4">
            New organisation?{' '}
            <Link to="/signup" className="text-[#2563EB] font-bold hover:underline">Create an Admin Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
