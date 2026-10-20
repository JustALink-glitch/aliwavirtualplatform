import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../services'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep] = useState('email') // email → sent → reset → success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Step 1 — send OTP
  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      toast.success('Reset code sent to your email!')
      setStep('sent')
    } catch (err) {
      const message = err.message || 'Failed to send reset code. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP
  const handleVerifyCode = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyOtp({ email, otp })
      toast.success('Code verified successfully!')
      setStep('reset')
    } catch (err) {
      const message = err.message || 'Invalid or expired code. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 3 — reset password
  const handleResetPassword = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp, newPassword: password })
      toast.success('Password reset successfully!')
      setStep('success')
    } catch (err) {
      const message = err.message || 'Failed to reset password. Please try again.'
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
                    onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                    placeholder="Enter your email"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <Mail size={16} className="text-gray-400" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={loading}
                className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition mb-4 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
                }`}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition">
                <ArrowLeft size={13} /> Back to Sign in
              </Link>
            </div>
          </>
        )}

        {/* STEP 2 — Code sent, enter OTP */}
        {step === 'sent' && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={24} className="text-[#2563EB]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              We sent a reset code to <span className="font-semibold text-gray-700">{email}</span>
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ENTER RESET CODE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] text-center tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition mb-4 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
                }`}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Didn't receive it?{' '}
                <button
                  onClick={() => { setError(''); handleSendCode() }}
                  className="text-[#2563EB] font-semibold hover:underline">
                  Resend code
                </button>
              </p>

              <div className="mt-3 text-center">
                <button onClick={() => { setStep('email'); setError('') }}
                  className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition w-full">
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
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
                }`}>
                {loading ? 'Resetting...' : 'Reset Password'}
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