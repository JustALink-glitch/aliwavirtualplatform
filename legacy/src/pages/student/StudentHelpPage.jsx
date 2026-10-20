import { useState } from 'react'
import StudentSidebar from '../../components/student/StudentSidebar'
import StudentTopBar from '../../components/student/StudentTopBar'
import { HelpCircle, Activity, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

export default function StudentHelpPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index)
  }

  const tips = [
    {
      title: 'Use a wired internet connection',
      desc: 'Ethernet is significantly more stable than Wi-Fi. A physical cable eliminates signal dropouts, reduces jitter, and provides a continuous, high-speed channel for video streams.',
      strong: 'Ethernet is more stable than Wi-Fi.'
    },
    {
      title: 'Turn off your video if things get choppy',
      desc: 'Sending high-definition video requires substantial upload bandwidth. If your stream lags, turn off your webcam – this frees up network bandwidth, and your incoming audio/video will remain smooth.',
      strong: 'Audio will remain on.'
    },
    {
      title: 'Close background tabs and applications',
      desc: 'Applications running in the background (like Netflix, YouTube, game downloads, cloud backups, or Torrent clients) consume heavy bandwidth. Close them to give Zoom your complete connection speed.',
      strong: 'Close heavy platforms like Netflix, game downloads, or cloud backups.'
    },
    {
      title: 'Position yourself close to your router',
      desc: 'If Wi-Fi is your only option, physical proximity is crucial. Thick walls, appliances, and distance degrade wireless signals. Sit in the same room or as close as possible to the router.',
      strong: 'Minimize distance and walls between your device and the router.'
    },
    {
      title: 'Restart your router periodically',
      desc: 'Routers run internal memory that gets cluttered over time, leading to unexplained slowdowns. Power-cycling (turning off, waiting 30 seconds, and restarting) before important sessions can instantly clear routing issues.',
      strong: 'Restart before critical live sessions to avoid persistent issues.'
    }
  ]

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <StudentSidebar collapsed={collapsed} activePath="/student/help" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentTopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="text-[#2563EB]" size={22} />
              Help & FAQ
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Optimize your live classroom connection and get support</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Accordion Tips */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">How to get the best live class experience</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Follow these essential guidelines to guarantee crystal-clear video and lag-free audio.</p>
                </div>

                <div className="space-y-2.5">
                  {tips.map((tip, idx) => {
                    const isOpen = openSection === idx
                    return (
                      <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden bg-white transition-all">
                        <button
                          onClick={() => toggleSection(idx)}
                          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-700">{tip.title}</span>
                          </div>
                          {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 bg-gray-50/50 border-t border-gray-50/80 text-xs text-gray-500 space-y-2 leading-relaxed">
                            <p>{tip.desc}</p>
                            <p className="text-gray-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mt-1 bg-white p-2 rounded-lg border border-gray-100/50 w-fit">
                              <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
                              Key Rule: {tip.strong}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Diagnostic explanation info card */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Activity size={18} className="text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Pre-Meeting System Checks</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5">
                    Our system checks your network before you join – you’ll see a <strong>Good</strong> / <strong>Fair</strong> / <strong>Poor</strong> status. Poor connections may still work, but you might face audio or video problems.
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50 space-y-3">
                  <div className="flex gap-3 text-xs leading-relaxed text-gray-500">
                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-black text-[9px] h-fit mt-0.5">GOOD</span>
                    <p className="text-[11px]">Latency below 150ms. Ideal for fluid, natural audio and video streaming.</p>
                  </div>
                  <div className="flex gap-3 text-xs leading-relaxed text-gray-500">
                    <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-black text-[9px] h-fit mt-0.5">FAIR</span>
                    <p className="text-[11px]">Latency 150ms to 300ms. Generally stable, but you might experience slight delays.</p>
                  </div>
                  <div className="flex gap-3 text-xs leading-relaxed text-gray-500">
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-black text-[9px] h-fit mt-0.5">POOR</span>
                    <p className="text-[11px]">Latency above 300ms. High risk of voice stuttering or freezing. Try closing other apps.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 p-5 shadow-sm flex items-start gap-3">
                <ShieldAlert className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">Need Immediate Help?</h4>
                  <p className="text-[10px] text-blue-700 leading-relaxed mt-1">
                    If you are experiencing continuous disconnection in live sessions, contact the course administrator or consult your internet service provider (ISP).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
