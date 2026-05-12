import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function SetPassword() {
  const [step, setStep] = useState('welcome')
  const [showTemp, setShowTemp] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ temp: '', password: '', confirm: '' })
  const [role, setRole] = useState('trainer')
  const navigate = useNavigate()
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const passwordChecks = [
    { label: 'At least 8 characters', pass: form.password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(form.password) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(form.password) },
    { label: 'Passwords match', pass: form.password === form.confirm && form.confirm !== '' },
  ]

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

        {/* STEP 1 — Welcome */}
        {step === 'welcome' && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Training Ops!</h1>
            <p className="text-sm text-gray-500 mb-2 text-center max-w-sm">
              You've been invited as a trainer by <span className="font-semibold text-gray-700">ALIWA Foundation</span>.
            </p>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              To get started, please set a new password for your account.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">

              {/* Role selector */}
<div className="mb-4">
  <label className="block text-xs font-semibold text-gray-700 mb-2">YOUR ROLE</label>
  <div className="grid grid-cols-2 gap-2">
    {[
      { value: 'trainer', label: 'Trainer', icon: '👨‍🏫' },
      { value: 'student', label: 'Student', icon: '🎓' },
    ].map(({ value, label, icon }) => (
      <button key={value} onClick={() => setRole(value)}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
          role === value
            ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}>
        <span>{icon}</span> {label}
      </button>
    ))}
  </div>
</div>

              {/* Trainer info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-5">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  AO
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Abdulhameed Olamilekan</p>
                  <p className="text-xs text-gray-500">abdulhameed@gmail.com</p>
                  <p className="text-xs text-[#2563EB] font-medium mt-0.5">Trainer · Data Analytics</p>
                </div>
              </div>

              <button
                onClick={() => setStep('set')}
                className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition">
                Set My Password
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Set password */}
        {step === 'set' && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Set your password</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              Enter your temporary password and choose a new one.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6 space-y-4">

              {/* Temp password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  TEMPORARY PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type={showTemp ? 'text' : 'password'}
                    name="temp"
                    value={form.temp}
                    onChange={handle}
                    placeholder="Enter temporary password"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button onClick={() => setShowTemp(!showTemp)} className="text-gray-400 hover:text-gray-600">
                    {showTemp ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NEW PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Create new password"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#2563EB]">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    value={form.confirm}
                    onChange={handle}
                    placeholder="Confirm new password"
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password checks */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                {passwordChecks.map(({ label, pass }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${pass ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <CheckCircle size={10} className={pass ? 'text-green-600' : 'text-gray-400'} />
                    </div>
                    <span className={`text-xs ${pass ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('success')}
                disabled={!passwordChecks.every(c => c.pass)}
                className={`w-full text-white text-sm font-semibold rounded-lg py-3 transition ${
                  passwordChecks.every(c => c.pass)
                    ? 'bg-[#2563EB] hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}>
                Set Password & Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — Success */}
        {step === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Password set!</h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              Your account is ready. Welcome to the Training Ops trainer dashboard!
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                AO
              </div>
              <p className="text-sm font-bold text-gray-800">Abdulhameed Olamilekan</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-1">abdulhameed@gmail.com</p>
              <p className="text-xs text-[#2563EB] font-semibold mb-5">Trainer · Data Analytics</p>

              <button
                onClick={() => navigate(role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard')}
                className="w-full bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-3 hover:bg-blue-700 transition">
                Go to My Dashboard →
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}