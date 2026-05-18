import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, Eye, EyeOff, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: ''
  })
  const navigate = useNavigate()
  const { register } = useAuth()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSignup = async () => {
    const { firstName, lastName, email, password, organizationName } = form
    if (!firstName || !lastName || !email || !password || !organizationName) {
      setError('All fields are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      // Registration successful → go directly to admin dashboard
      navigate('/admin/dashboard')
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-[Manrope,sans-serif]">
      {/* Navbar */}
      <nav className="bg-white px-6 py-4 flex items-center gap-2 shadow-sm">
        <div className="w-5 h-5 bg-[#2563EB] rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">training ops</span>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Admin Account</h1>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
          Set up your organization on Training Ops.
        </p>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                FIRST NAME <span className="text-red-500">*</span>
              </label>
              <input type="text" name="firstName" value={form.firstName} onChange={handle}
                placeholder="First name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                LAST NAME <span className="text-red-500">*</span>
              </label>
              <input type="text" name="lastName" value={form.lastName} onChange={handle}
                placeholder="Last name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>

          {/* Organization */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ORGANIZATION NAME <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type="text" name="organizationName" value={form.organizationName} onChange={handle}
                placeholder="e.g. ALIWA Foundation"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <Building2 size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type="email" name="email" value={form.email} onChange={handle}
                placeholder="Enter your work email"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <Mail size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                placeholder="Min. 8 characters"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Sign Up Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition mb-4 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
            }`}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Sign in link */}
          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
          This creates an admin account. Trainers and students are invited by the admin.
        </p>
      </div>
    </div>
  )
}