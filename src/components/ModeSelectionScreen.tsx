import { Radio, Tv, Volume2, Globe } from 'lucide-react'
import type { ServiceTab } from './ServiceTabs'

interface ModeSelectionScreenProps {
  onSelect: (mode: ServiceTab) => void
}

export function ModeSelectionScreen({ onSelect }: ModeSelectionScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto neo-grid select-none"
      style={{
        '--background': '#FFF8E7',
        '--surface': '#FFFFFF',
        '--text': '#000000',
        '--muted-text': '#4A4A4A',
        '--accent': '#FFDE59',
      } as React.CSSProperties}
    >
      {/* Decorative Neobrutalist Geometric Accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
        {/* Top-left shape cluster */}
        <div className="absolute top-8 left-6 md:left-12 opacity-80 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 border-3 border-black bg-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-lg font-black animate-float">
            ★
          </div>
          <div className="w-8 h-8 border-3 border-black bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center font-mono text-sm font-black">
            ●
          </div>
        </div>

        {/* Top-right rotated diamond & crosshairs */}
        <div className="absolute top-8 right-6 md:right-12 opacity-80 hidden md:flex flex-col items-end gap-2">
          <div className="w-10 h-10 border-3 border-black bg-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center font-space text-xl font-black transform rotate-12">
            ◆
          </div>
          <div className="font-mono font-bold text-xl text-[var(--text)] tracking-widest">
            + + +
          </div>
        </div>

        {/* Bottom-left shape row */}
        <div className="absolute bottom-8 left-8 md:left-14 opacity-80 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 border-3 border-black bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-mono text-xl font-black">
            +
          </div>
          <div className="w-10 h-10 border-3 border-black bg-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-lg font-black">
            ✦
          </div>
        </div>

        {/* Bottom-right circle bar */}
        <div className="absolute bottom-8 right-8 md:right-16 opacity-80 hidden md:flex items-center gap-2 px-4 py-2 border-3 border-black bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-full">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-black bg-[var(--accent)]" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-black bg-black" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-black bg-sky-300" />
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 min-h-full w-full flex flex-col items-center justify-start md:justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl flex flex-col items-center text-center my-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-black p-1 bg-[var(--accent)] border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]" aria-hidden="true" />
            <span className="font-space text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[var(--text)] uppercase">
              WAVESCAPE
            </span>
          </div>

          {/* Main Title & Prompt */}
          <h1 className="font-space text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-black tracking-tight mb-2 sm:mb-3">
            What would you like to tune into?
          </h1>
          <p className="font-mono text-xs sm:text-sm md:text-base text-[var(--muted-text)] max-w-lg mb-6 sm:mb-8 md:mb-10 px-2">
            Select your media frequency below to enter the global atmospheric broadcast receiver.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl px-1 sm:px-2">
            {/* TV Selection Card */}
            <button
              type="button"
              onClick={() => onSelect('tv')}
              className="group relative flex flex-col items-center text-center p-5 sm:p-7 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:-translate-y-1.5 active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Top accent badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] uppercase px-2 py-0.5 border border-black rounded bg-sky-300 text-black">
                  <Globe className="w-3 h-3" /> VIDEO
                </span>
              </div>

              {/* Icon Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-5 rounded-2xl border-3 border-black bg-sky-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
              </div>

              {/* Title */}
              <h2 className="font-space text-xl sm:text-2xl font-black uppercase text-black mb-1.5 sm:mb-2 tracking-tight">
                Live TV
              </h2>

              {/* Description */}
              <p className="font-mono text-xs sm:text-sm text-[var(--muted-text)] leading-relaxed mb-6 sm:mb-8">
                Real-time international IPTV television streams with categorized regional channels.
              </p>

              {/* Enter Button CTA */}
              <div className="w-full mt-auto py-2.5 px-4 font-space font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black rounded-lg bg-sky-300 text-black group-hover:bg-black group-hover:text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors duration-150">
                Enter TV →
              </div>
            </button>

            {/* Radio Selection Card */}
            <button
              type="button"
              onClick={() => onSelect('radio')}
              className="group relative flex flex-col items-center text-center p-5 sm:p-7 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:-translate-y-1.5 active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Top accent badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] uppercase px-2 py-0.5 border border-black rounded bg-[var(--accent)] text-black">
                  <Volume2 className="w-3 h-3" /> AUDIO
                </span>
              </div>

              {/* Icon Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-5 rounded-2xl border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
              </div>

              {/* Title */}
              <h2 className="font-space text-xl sm:text-2xl font-black uppercase text-black mb-1.5 sm:mb-2 tracking-tight">
                Live Radio
              </h2>

              {/* Description */}
              <p className="font-mono text-xs sm:text-sm text-[var(--muted-text)] leading-relaxed mb-6 sm:mb-8">
                Atmospheric radio stations across the globe with audio visualizers & local weather sync.
              </p>

              {/* Enter Button CTA */}
              <div className="w-full mt-auto py-2.5 px-4 font-space font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black rounded-lg bg-[var(--accent)] text-black group-hover:bg-black group-hover:text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors duration-150">
                Enter Radio →
              </div>
            </button>
          </div>

          {/* Footer Note */}
          <p className="mt-6 sm:mt-8 font-mono text-[11px] sm:text-xs text-[var(--muted-text)]">
            You can toggle between Radio and TV at any time on the top navigation.
          </p>
        </div>
      </div>
    </div>
  )
}
