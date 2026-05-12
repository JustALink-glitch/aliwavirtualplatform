import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState('email') // email → sent → reset → success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()

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

        {/* STEP 1 — Enter email */}
        {step === 'email' && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-[#2563EB]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              No worries! Enter your email and we'll send you a reset code.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <Mail size={16} className="text-gray-400" />
                </div>
              </div>

              <button
                onClick={() => setStep('sent')}
                className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition mb-4">
                Send Reset Code
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition">
                <ArrowLeft size={13} /> Back to Sign in
              </Link>
            </div>
          </>
        )}

        {/* STEP 2 — Code sent */}
        {step === 'sent' && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={24} className="text-[#2563EB]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              We sent a reset code to <span className="font-semibold text-gray-700">{email || 'your email'}</span>
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ENTER RESET CODE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] text-center tracking-widest"
                />
              </div>

              <button
                onClick={() => setStep('reset')}
                className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition mb-4">
                Verify Code
              </button>

              <p className="text-center text-xs text-gray-500">
                Didn't receive it?{' '}
                <button className="text-[#2563EB] font-semibold hover:underline">Resend code</button>
              </p>

              <div className="mt-3 text-center">
                <button onClick={() => setStep('email')} className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition w-full">
                  <ArrowLeft size={13} /> Back
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 — New password */}
        {step === 'reset' && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-[#2563EB]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              Your new password must be different from your previous one.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NEW PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                onClick={() => setStep('success')}
                className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition">
                Reset Password
              </button>
            </div>
          </>
        )}

        {/* STEP 4 — Success */}
        {step === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Password reset!</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="bg-[#2563EB] text-white text-sm font-semibold rounded-lg px-8 py-3 hover:bg-blue-700 transition">
              Back to Sign in
            </button>
          </>
        )}

      </div>
    </div>
  )
}