import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* Navbar */}
      <nav className="bg-white px-6 py-4 flex items-center gap-2 shadow-sm">
        <div className="w-5 h-5 bg-[#2563EB] rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">training ops</span>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign up</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account.</p>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              FULL NAME <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type="text" placeholder="Enter full name"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <User size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
              <input type="email" placeholder="Enter Email"
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
              <input type={showPassword ? 'text' : 'password'} placeholder="Create Password"
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button onClick={() => setShowOTP(true)}
            className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition mb-4">
            Sign up
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

          {/* Sign in link */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          *Use your work email. You'll set up your organization next.
        </p>
      </div>

      {/* OTP Modal */}
      {showOTP && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Mail size={28} className="text-[#2563EB]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Verify your email</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              We've sent a verification code to your@email.com
            </p>
            <input type="text" placeholder="Enter One Time Verification code"
              value={otp} onChange={e => setOtp(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] mb-4 text-center" />
            <button
  onClick={() => navigate('/admin/dashboard')}
  className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition mb-3">
  Verify
</button>
            <p className="text-xs text-gray-500">
              Didn't receive otp?{' '}
              <button className="text-[#2563EB] font-semibold hover:underline">Resend</button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}