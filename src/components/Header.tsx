import { Radio } from 'lucide-react'
import type { PlaybackState } from '../types'

interface HeaderProps {
  playbackState: PlaybackState
  isVisualConnecting?: boolean
  isVisualConnected?: boolean
}

export function Header({ playbackState, isVisualConnecting, isVisualConnected }: HeaderProps) {
  const rawPlaying = playbackState === 'playing'
  const rawConnecting = playbackState === 'loading' || playbackState === 'buffering'
  
  const connecting = isVisualConnecting !== undefined ? isVisualConnecting : rawConnecting
  const playing = isVisualConnected !== undefined ? (rawPlaying && !connecting) : rawPlaying

  return (
    <header className="w-full py-4 px-6 md:px-8 border-b-3 border-black bg-[var(--surface)] shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className={`w-7 h-7 text-black p-1 bg-[var(--accent)] border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-300 ${connecting ? 'animate-pulse' : ''}`} aria-hidden="true" />
          <span className="font-space text-2xl font-black tracking-tight text-[var(--text)] uppercase">
            WAVESCAPE
          </span>
        </div>

        <div className={`flex items-center gap-2 font-mono font-bold text-xs px-3 py-1.5 border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-300 ${isVisualConnected || playing ? 'bg-emerald-400 text-black' : connecting ? 'bg-[var(--accent)] text-black animate-pulse' : 'bg-[var(--surface)] text-[var(--text)]'}`}>
          <span className={`w-2.5 h-2.5 rounded-full border border-black ${isVisualConnected || playing ? 'bg-black animate-pulse' : connecting ? 'bg-black animate-ping' : 'bg-[var(--muted-text)]'}`} />
          <span>{isVisualConnected ? '✦ SIGNAL LOCKED' : playing ? 'LIVE STREAM' : connecting ? 'SWEEPING BAND...' : 'STANDBY'}</span>
        </div>
      </div>
    </header>
  )
}
