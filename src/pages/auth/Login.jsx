import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const roleRoutes = {
  admin: '/admin/dashboard',
  trainer: '/set-password',
  student: '/set-password',
}

export default function Login() {
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
      if (user.isFirstLogin) {
        navigate('/set-password')
      } else {
        navigate(roleRoutes[user.role] || '/login')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-[Manrope,sans-serif]">

      {/* Navbar */}
      <nav className="bg-white px-6 py-4 flex items-center gap-2 shadow-sm">
        <div className="w-5 h-5 bg-[#2563EB] rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">training ops</span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your email"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <Mail size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2 mb-2">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Forgot password */}
          <div className="flex justify-end mb-5 mt-2">
            <Link to="/forgot-password" className="text-xs text-[#2563EB] font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button onClick={handleLogin} disabled={loading}
            className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition mb-4 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
            }`}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            New to Training Ops?{' '}
            <Link to="/signup" className="text-[#2563EB] font-semibold hover:underline">Create Account</Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 w-full max-w-sm">
          <p className="text-xs font-bold text-gray-600 mb-2">🔑 Demo Credentials</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Email: <span className="font-medium text-gray-700">admin@trainingops.com</span></p>
            <p className="text-xs text-gray-500">Password: <span className="font-medium text-gray-700">Admin@1234</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}