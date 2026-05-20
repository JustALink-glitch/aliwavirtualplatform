import { useState, useEffect, useRef, useCallback } from 'react'
import { Video, X, Loader, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import zoomAPI from '../../services/zoom'

// ─────────────────────────────────────────────────────────────
// Dynamically load the Zoom Meeting SDK from CDN.
// We use CDN to avoid React 18 peer-dep conflicts with the npm package.
// Zoom Meeting SDK 3.11.x is the last stable version supporting CDN loading.
// ─────────────────────────────────────────────────────────────
const ZOOM_SDK_VERSION = '3.11.1'
const ZOOM_CDN_BASE = `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib`

function loadZoomSDK() {
  return new Promise((resolve, reject) => {
    if (window.ZoomMtg) {
      resolve(window.ZoomMtg)
      return
    }

    // Inject Zoom Bootstrap CSS
    const cssBootstrap = document.createElement('link')
    cssBootstrap.rel = 'stylesheet'
    cssBootstrap.type = 'text/css'
    cssBootstrap.href = `${ZOOM_CDN_BASE}/css/bootstrap.css`
    document.head.appendChild(cssBootstrap)

    const cssReact = document.createElement('link')
    cssReact.rel = 'stylesheet'
    cssReact.type = 'text/css'
    cssReact.href = `${ZOOM_CDN_BASE}/css/react-select.css`
    document.head.appendChild(cssReact)

    // Inject Zoom SDK script
    const script = document.createElement('script')
    script.src = `${ZOOM_CDN_BASE}/zoom.min.js`
    script.async = true
    script.onload = () => {
      if (window.ZoomMtg) resolve(window.ZoomMtg)
      else reject(new Error('Zoom SDK loaded but ZoomMtg not found on window'))
    }
    script.onerror = () => reject(new Error('Failed to load Zoom SDK from CDN'))
    document.body.appendChild(script)
  })
}

// ─────────────────────────────────────────────────────────────
// ZoomMeeting Component
//
// Props:
//   session        - the session object (must have zoom_meeting_id, zoom_password, teacher_user_id)
//   currentUser    - the authenticated user (name, email)
//   onClose        - callback when user clicks Exit
// ─────────────────────────────────────────────────────────────
export default function ZoomMeeting({ session, currentUser, onClose }) {
  const mountRef = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | joining | joined | error
  const [errorMsg, setErrorMsg] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  const joinMeeting = useCallback(async (ZoomMtg) => {
    setPhase('joining')
    setErrorMsg('')

    try {
      const meetingNumber = String(session.zoom_meeting_id)
      const teacherUserId = session.teacher_user_id

      // 1. Fetch SDK signature from backend
      const { signature, sdkKey } = await zoomAPI.getSDKSignature(meetingNumber, 0)

      // 2. Fetch OBF token (required post-March 2026 Zoom policy)
      //    Retries up to MAX_RETRIES — teacher may not be in meeting yet (Chaperone Rule)
      let obfToken = null
      if (teacherUserId) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const obfData = await zoomAPI.getOBFToken(teacherUserId)
            obfToken = obfData.obfToken
            break
          } catch (obfErr) {
            if (attempt < MAX_RETRIES) {
              setErrorMsg(`Waiting for teacher to open the meeting… (attempt ${attempt}/${MAX_RETRIES})`)
              await new Promise(r => setTimeout(r, 15000))
            } else {
              console.warn('[Zoom] Could not get OBF token after retries, joining without it')
            }
          }
        }
      }

      // 3. Initialize Zoom SDK
      ZoomMtg.setZoomJSLib(`${ZOOM_CDN_BASE}`, '/av')
      ZoomMtg.preLoadWasm()
      ZoomMtg.prepareWebSDK()

      // Set the container for the embedded meeting
      if (mountRef.current) {
        ZoomMtg.init({
          leaveUrl: window.location.href,
          isSupportAV: true,
          success: () => {
            ZoomMtg.join({
              sdkKey,
              signature,
              meetingNumber,
              userName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email,
              userEmail: currentUser.email,
              passWord: session.zoom_password || '',
              ...(obfToken && { obfToken }),
              success: () => setPhase('joined'),
              error: (joinErr) => {
                console.error('[Zoom] Join error:', joinErr)
                setErrorMsg(joinErr.errorMessage || 'Failed to join meeting.')
                setPhase('error')
              },
            })
          },
          error: (initErr) => {
            console.error('[Zoom] Init error:', initErr)
            setErrorMsg(initErr.errorMessage || 'Failed to initialize Zoom.')
            setPhase('error')
          },
        })
      }
    } catch (err) {
      console.error('[Zoom] Error fetching tokens:', err)
      setErrorMsg(err.message || 'Could not connect to meeting server.')
      setPhase('error')
    }
  }, [session, currentUser])

  useEffect(() => {
    let cancelled = false

    setPhase('loading')

    loadZoomSDK()
      .then((ZoomMtg) => {
        if (!cancelled) joinMeeting(ZoomMtg)
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(`Could not load Zoom SDK: ${err.message}`)
          setPhase('error')
        }
      })

    return () => {
      cancelled = true
      // Leave meeting on unmount
      if (window.ZoomMtg && phase === 'joined') {
        try {
          window.ZoomMtg.leaveMeeting({})
        } catch (_) {
          // Ignore error since we are unmounting
        }
      }
    }
  }, [retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fallback: open Zoom externally if embedding fails ──────
  const openExternal = () => {
    const url = session.zoom_link || (session.zoom_meeting_id ? `https://zoom.us/j/${session.zoom_meeting_id}` : '')
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 font-[Manrope,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Video size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[280px]">{session.title}</p>
            <p className="text-[10px] text-gray-400">Live Session · Attendance auto-recorded</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openExternal}
            disabled={!session.zoom_link && !session.zoom_meeting_id}
            title="Open in Zoom app"
            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg px-3 py-1.5 transition disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-600"
          >
            <ExternalLink size={12} /> Open in App
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition"
          >
            <X size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* Meeting viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Zoom SDK mounts here */}
        <div
          id="zmmtg-root"
          ref={mountRef}
          className="w-full h-full"
          style={{ display: phase === 'joined' ? 'block' : 'none' }}
        />

        {/* Loading / Joining overlay */}
        {(phase === 'loading' || phase === 'joining') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-5">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <Loader size={28} className="text-blue-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-sm">
                {phase === 'loading' ? 'Loading Zoom SDK…' : 'Connecting to meeting…'}
              </p>
              {errorMsg && (
                <p className="text-yellow-400 text-xs max-w-xs text-center">{errorMsg}</p>
              )}
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-5">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <div className="text-center space-y-2 max-w-sm px-6">
              <p className="text-white font-bold text-sm">Could not join meeting</p>
              <p className="text-gray-400 text-xs">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                <RefreshCw size={13} /> Retry
              </button>
              <button
                onClick={openExternal}
                className="flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                <ExternalLink size={13} /> Open Zoom App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
