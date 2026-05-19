import { useState, useEffect, useRef } from 'react'
import { 
  Wifi, 
  CheckCircle2, 
  X, 
  RotateCw, 
  Info, 
  Activity, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react'

// Backend ping URL from api.js configurations
const PING_ENDPOINT = 'http://localhost:5000/api/ping'

export default function PreMeetingCheck({ session, currentUser, onProceed, onClose }) {
  const [testState, setTestState] = useState('idle') // idle | testing | completed
  const [progress, setProgress] = useState(0)
  
  // Speed metrics
  const [metrics, setMetrics] = useState({
    latency: null,
    packetLoss: 0,
    jitter: null,
    classification: 'good' // good | fair | poor
  })

  const [showTooltip, setShowTooltip] = useState(false)
  const [agreedToPoor, setAgreedToPoor] = useState(false)
  const timerRef = useRef(null)

  // Run speed test sequence
  const runDiagnostics = async () => {
    setTestState('testing')
    setProgress(5)
    setAgreedToPoor(false)

    const latencies = []
    let lostCount = 0
    const totalPings = 8 // We do 8 rapid pings: 3 for median latency, remaining to calculate loss & jitter

    try {
      // Step-by-step progress simulation
      for (let i = 0; i < totalPings; i++) {
        // Increment progress incrementally
        setProgress(Math.round(((i + 1) / totalPings) * 80) + 10)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1000) // 1 second timeout

        const startTime = Date.now()
        try {
          const res = await fetch(PING_ENDPOINT, {
            method: 'HEAD',
            cache: 'no-store',
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          if (res.ok) {
            const endTime = Date.now()
            latencies.push(endTime - startTime)
          } else {
            lostCount++
          }
        } catch (err) {
          clearTimeout(timeoutId)
          lostCount++
        }

        // Delay between pings slightly to let connection breathe
        await new Promise(r => setTimeout(r, 150))
      }

      setProgress(95)
      await new Promise(r => setTimeout(r, 200)) // smooth transition

      // Calculate final speed test results
      let finalLatency = 50 // Default fallback if all fail
      let finalJitter = 0

      if (latencies.length > 0) {
        // 1. Median Latency
        const sorted = [...latencies].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        finalLatency = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)

        // 2. Jitter calculation (variation between consecutive pings)
        if (latencies.length > 1) {
          let jitterSum = 0
          for (let k = 1; k < latencies.length; k++) {
            jitterSum += Math.abs(latencies[k] - latencies[k - 1])
          }
          finalJitter = Math.round(jitterSum / (latencies.length - 1))
        }
      } else {
        // If all 8 pings failed, represent 100% loss
        lostCount = totalPings
      }

      // Calculate loss percentage
      const finalLoss = Math.round((lostCount / totalPings) * 100)

      // Classification Logic
      // - Good: Latency < 150ms and Loss < 2% and Jitter < 40ms
      // - Fair: Latency between 150ms and 300ms and Loss <= 5%
      // - Poor: Latency > 300ms or Loss > 5%
      let finalClass = 'good'
      if (finalLatency > 300 || finalLoss > 5 || finalJitter > 60) {
        finalClass = 'poor'
      } else if (finalLatency >= 150 || finalLoss > 2 || finalJitter >= 40) {
        finalClass = 'fair'
      }

      // Save to metrics
      const results = {
        latency: finalLatency,
        packetLoss: finalLoss,
        jitter: finalJitter,
        classification: finalClass
      }

      setMetrics(results)
      
      // Store in sessionStorage to cache for this specific classroom session
      sessionStorage.setItem(`zoom_speedcheck_${session.id}`, JSON.stringify(results))

      setProgress(100)
      setTestState('completed')
    } catch (err) {
      console.error('Speed test error:', err)
      // Safe fallback on unexpected system failure
      setMetrics({
        latency: 120,
        packetLoss: 0,
        jitter: 10,
        classification: 'good'
      })
      setProgress(100)
      setTestState('completed')
    }
  }

  // Auto-run if no cached result for this session exists
  useEffect(() => {
    const cached = sessionStorage.getItem(`zoom_speedcheck_${session.id}`)
    if (cached) {
      try {
        setMetrics(JSON.parse(cached))
        setTestState('completed')
        setProgress(100)
      } catch (_) {
        runDiagnostics()
      }
    } else {
      runDiagnostics()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [session.id])

  // Get status details based on classification
  const getStatusConfig = () => {
    switch (metrics.classification) {
      case 'good':
        return {
          bg: 'bg-green-50/70 border-green-200/60',
          text: 'text-green-800',
          badgeBg: 'bg-green-500',
          badgeText: 'text-white',
          label: 'Good Connection',
          desc: 'Your internet is stable and ready. Audio and video will be perfectly synced.',
          accentColor: '#22c55e'
        }
      case 'fair':
        return {
          bg: 'bg-yellow-50/70 border-yellow-200/60',
          text: 'text-yellow-800',
          badgeBg: 'bg-yellow-500',
          badgeText: 'text-white',
          label: 'Fair Connection',
          desc: 'Generally stable. You might experience minor audio delays or momentary pixelation.',
          accentColor: '#eab308'
        }
      case 'poor':
      default:
        return {
          bg: 'bg-red-50/70 border-red-200/60',
          text: 'text-red-800',
          badgeBg: 'bg-red-500',
          badgeText: 'text-white',
          label: 'Poor Connection',
          desc: 'High response delays or package loss. You are likely to experience voice lagging or video freezes.',
          accentColor: '#ef4444'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[Manrope,sans-serif] overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/65 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col my-8">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 px-6 py-5 text-white relative">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-gray-300 hover:text-white">
              <X size={15} />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Wifi size={16} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">Pre-Meeting System Check</h2>
              <p className="text-[10px] text-gray-300 mt-0.5">Live Class: {session.title}</p>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-5 flex-1">

          {/* 1. SPEED CHECK STATUS SECTION */}
          {testState === 'testing' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {/* Pulsing speed radar visual */}
              <div className="relative w-20 h-20 flex items-center justify-center bg-blue-50 rounded-full border border-blue-100">
                <div className="absolute inset-0 rounded-full bg-blue-200/30 animate-ping" />
                <Activity size={28} className="text-blue-600 animate-pulse" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-gray-800">Measuring network latency & packet loss...</p>
                <p className="text-[10px] text-gray-400">Pinging server cluster to establish signal health</p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs space-y-1">
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-[9px] font-bold text-gray-400">{progress}%</p>
              </div>
            </div>
          )}

          {testState === 'completed' && (
            <div className={`p-4 border rounded-xl flex items-start gap-4 transition-colors ${config.bg}`}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]"
                style={{ backgroundColor: config.accentColor }}
              >
                <Activity size={18} />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText} uppercase tracking-wider`}>
                    {config.label}
                  </span>
                  <button 
                    onClick={runDiagnostics} 
                    title="Run speed test again"
                    className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-gray-900 border border-gray-200/80 hover:border-gray-300 rounded px-1.5 py-0.5 bg-white shadow-xs transition"
                  >
                    <RotateCw size={8} /> Re-test
                  </button>
                </div>
                <p className="text-xs font-bold text-gray-800">{config.desc}</p>

                {/* Metrics detail row with info icon */}
                <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[10px] text-gray-500 font-bold border-t border-gray-100/50 mt-1">
                  <span className="flex items-center gap-1">
                    Latency: <strong className="text-gray-700">{metrics.latency}ms</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    Packet Loss: <strong className="text-gray-700">{metrics.packetLoss}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    Jitter: <strong className="text-gray-700">{metrics.jitter}ms</strong>
                  </span>
                  
                  {/* Tooltip anchor */}
                  <div className="relative ml-auto flex items-center">
                    <button 
                      type="button"
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="p-0.5 rounded-full hover:bg-gray-200/50 text-gray-400 hover:text-gray-700 transition"
                    >
                      <Info size={11} />
                    </button>
                    {showTooltip && (
                      <div className="absolute right-0 bottom-6 bg-slate-900 text-white rounded-lg p-3 w-56 text-[9px] leading-relaxed shadow-xl border border-slate-800 z-20 space-y-1.5 font-medium">
                        <div className="flex items-center justify-between font-bold border-b border-white/10 pb-1 mb-1">
                          <span>Network Standard</span>
                          <button onClick={() => setShowTooltip(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <p>💡 <strong>Latency &lt; 150ms</strong> is ideal for natural, lag-free conversations.</p>
                        <p>💡 <strong>Latency &lt; 500ms</strong> is generally acceptable for joining a live broadcast.</p>
                        <p>⚠️ <strong>Packet loss &gt; 5%</strong> causes voice breakdown and video freezing.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. FRIENDLY ACTIONABLE ADVICE CHECKLIST */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Before launching, ensure you:</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/80 space-y-2.5">
              {[
                { bold: 'Use a wired connection:', normal: 'Ethernet is more stable than Wi-Fi.' },
                { bold: 'Close active bandwidth apps:', normal: 'Turn off Netflix, game downloads, or cloud uploads.' },
                { bold: 'Turn off video during call:', normal: 'Webcam uses upload speed. Turn off video if audio stutters.' },
                { bold: 'Halt large downloads:', normal: 'Check that no software updates are running on other devices.' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 text-[11px] text-gray-600 leading-normal">
                  <CheckCircle2 size={13} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>{item.bold}</strong> {item.normal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. POOR CONNECTION WARNING BANNER */}
          {testState === 'completed' && metrics.classification === 'poor' && (
            <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 flex items-start gap-3">
              <ShieldAlert className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-900">Unstable Connection Warning</p>
                <p className="text-[10px] text-red-700 leading-normal">
                  Your speed metrics indicate severe delays. You can still proceed, but we strongly advise closing high-bandwidth apps or switching to a wired network before joining to prevent audio and video sync issues.
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreedToPoor}
                    onChange={(e) => setAgreedToPoor(e.target.checked)}
                    className="w-3.5 h-3.5 text-red-600 border-red-200 rounded focus:ring-red-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-red-800 font-bold">I understand, join the class anyway</span>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Modal footer controls */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
          <button 
            onClick={onClose} 
            className="border border-gray-200 bg-white text-gray-600 text-xs font-bold rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          
          {testState === 'completed' ? (
            metrics.classification === 'poor' ? (
              <button 
                onClick={onProceed} 
                disabled={!agreedToPoor}
                className={`text-xs font-bold rounded-lg px-5 py-2 flex items-center gap-1.5 shadow-sm transition ${
                  agreedToPoor 
                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Join Call anyway <ArrowRight size={12} />
              </button>
            ) : (
              <button 
                onClick={onProceed} 
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg px-5 py-2 flex items-center gap-1.5 shadow-sm transition"
              >
                Join Call <ArrowRight size={12} />
              </button>
            )
          ) : (
            <button 
              disabled 
              className="bg-gray-100 text-gray-400 text-xs font-bold rounded-lg px-5 py-2 cursor-not-allowed flex items-center gap-1.5"
            >
              Checking...
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
