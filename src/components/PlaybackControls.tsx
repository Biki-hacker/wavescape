import { SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react'
import type { PlaybackState } from '../types'

interface PlaybackControlsProps {
  playbackState: PlaybackState
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  volume: number
  muted: boolean
  disabled?: boolean
  isVisualConnecting?: boolean
}

const btn = 'flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[var(--surface)] border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg text-[var(--text)] font-bold hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)] hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 focus-visible:outline-3 focus-visible:outline-black disabled:opacity-40 disabled:pointer-events-none'

export function PlaybackControls({
  playbackState,
  onTogglePlay,
  onNext,
  onPrev,
  onVolumeChange,
  onToggleMute,
  volume,
  muted,
  disabled,
  isVisualConnecting,
}: PlaybackControlsProps) {
  const isPlaying = playbackState === 'playing'
  const rawConnecting = playbackState === 'loading' || playbackState === 'buffering'
  const isConnecting = isVisualConnecting !== undefined ? isVisualConnecting : rawConnecting

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4" role="group" aria-label="Playback controls">
      <button
        onClick={onPrev}
        disabled={disabled}
        className={btn}
        aria-label="Previous station"
        title="Previous station"
      >
        <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={onTogglePlay}
        disabled={disabled}
        className={`${btn} w-14 h-14 md:w-16 md:h-16 bg-[var(--accent)] text-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] ${isConnecting ? 'animate-pulse' : ''}`}
        aria-label={isConnecting ? 'Tuning frequency...' : isPlaying ? 'Pause' : 'Play'}
        title={isConnecting ? 'Tuning frequency... (Click to cancel)' : isPlaying ? 'Pause' : 'Play'}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6 md:w-7 md:h-7" />
        ) : (
          <Play className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
        )}
      </button>

      <button
        onClick={onNext}
        disabled={disabled}
        className={btn}
        aria-label="Next station"
        title="Next station"
      >
        <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onToggleMute}
          className={btn}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volume"
          className="w-20 md:w-24 h-3 accent-[var(--accent)] bg-[var(--surface)] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
