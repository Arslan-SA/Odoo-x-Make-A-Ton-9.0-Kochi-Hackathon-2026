import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Globe, HelpCircle } from 'lucide-react'

export default function AuthLayout({ children }) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070709] font-sans text-zinc-100 antialiased flex flex-col justify-between">
      {/* Background Starry Wave Texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Soft atmospheric radial glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-950/20 via-zinc-900/10 to-transparent blur-[140px]" />
        
        {/* Organic wave particle mesh (SVG) */}
        <svg
          className="absolute inset-0 h-full w-full opacity-40 mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="0.75" fill="#71717a" opacity="0.25" />
            </pattern>
          </defs>

          {/* Subtle background dot grid */}
          <rect width="100%" height="100%" fill="url(#dotGrid)" />

          {/* Wave line 1 */}
          <path
            d="M-100 450 Q 250 320, 600 480 T 1300 420 T 2000 460"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeDasharray="1 8"
            opacity="0.35"
          />
          {/* Wave line 2 */}
          <path
            d="M-100 480 Q 300 350, 700 520 T 1400 460 T 2000 500"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="2 12"
            opacity="0.45"
          />
          {/* Wave line 3 */}
          <path
            d="M-100 520 Q 350 380, 800 560 T 1500 500 T 2000 540"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeDasharray="1 6"
            opacity="0.25"
          />
          {/* Wave line 4 */}
          <path
            d="M-100 420 Q 200 300, 550 440 T 1200 390 T 2000 430"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1"
            strokeDasharray="2 14"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Top Bar: Home Link and Language/Icon Indicator */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to Brightloop</span>
        </Link>

        {/* Top-right language/theme badge from screenshot */}
        <button
          type="button"
          aria-label="Language options"
          className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-white"
        >
          <span className="text-xs font-semibold tracking-tighter">文A</span>
        </button>
      </header>

      {/* Centered Auth Card Container */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[430px]">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121215]/95 p-7 shadow-2xl shadow-black/90 backdrop-blur-md sm:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Bar: Help icon from screenshot */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="text-[11px] text-zinc-600">
          Brightloop · Odoo Hackathon 2026
        </p>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            aria-label="Help and demo accounts"
            className="flex size-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
          >
            ?
          </button>

          {showHelp && (
            <div className="absolute bottom-9 right-0 w-64 rounded-xl border border-zinc-800 bg-[#141418] p-3 text-xs text-zinc-300 shadow-xl z-50">
              <p className="font-semibold text-white mb-1">Demo Credentials</p>
              <div className="space-y-1 text-zinc-400 font-mono text-[11px]">
                <p>admin@brightloop.dev</p>
                <p>staff@brightloop.dev</p>
                <p>customer@brightloop.dev</p>
                <p className="text-zinc-500 mt-1">Pass: Admin@12345</p>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
