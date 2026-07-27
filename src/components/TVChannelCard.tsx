import { useState } from 'react'
import { Tv, Signal, SignalZero, Clock } from 'lucide-react'
import type { TVChannel, TVStream } from '../types'
import { useClock } from '../hooks/useClock'

interface TVChannelCardProps {
  channel: TVChannel
  logoUrl?: string
  stream?: TVStream
  timezone?: string
  onPlay: (stream: TVStream) => void
}

export function TVChannelCard({ channel, logoUrl, stream, timezone, onPlay }: TVChannelCardProps) {
  const [logoError, setLogoError] = useState(false)
  const hasStream = !!stream
  const clock = useClock(timezone)

  const handleClick = () => {
    if (stream) {
      onPlay(stream)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={`flex flex-col p-4 bg-[var(--surface)] border-3 border-black rounded-lg transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
        hasStream
          ? 'cursor-pointer hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)]/10'
          : 'opacity-60 cursor-not-allowed'
      }`}
      title={hasStream ? `Watch ${channel.name}` : `${channel.name} — No stream available`}
    >
      {/* Logo & Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 flex-shrink-0 rounded border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={`${channel.name} logo`}
              className="w-full h-full object-contain p-1"
              onError={() => setLogoError(true)}
              loading="lazy"
            />
          ) : (
            <Tv className="w-6 h-6 text-[var(--muted-text)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-space text-sm font-bold text-[var(--text)] truncate leading-tight">
            {channel.name}
          </h3>
          {channel.network && (
            <p className="font-mono text-xs text-[var(--muted-text)] truncate mt-0.5">
              {channel.network}
            </p>
          )}
        </div>
        {/* Stream status indicator */}
        <div className="flex-shrink-0">
          {hasStream ? (
            <Signal className="w-4 h-4 text-emerald-500" />
          ) : (
            <SignalZero className="w-4 h-4 text-[var(--muted-text)]" />
          )}
        </div>
      </div>

      {/* Category tags */}
      {channel.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {channel.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 bg-[var(--accent)] text-black border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: quality + local time */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/20">
        <div className="flex items-center gap-1.5">
          {hasStream && stream.quality && (
            <span className="font-mono font-bold text-[10px] bg-[var(--surface)] text-[var(--text)] border-2 border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              {stream.quality}
            </span>
          )}
          {hasStream && (
            <span className="font-mono font-bold text-[10px] text-emerald-600">LIVE</span>
          )}
          {!hasStream && (
            <span className="font-mono font-bold text-[10px] text-[var(--muted-text)]">NO STREAM</span>
          )}
        </div>

        {timezone && (
          <span className="flex items-center gap-1 font-space font-bold text-sm text-[var(--text)]">
            <Clock className="w-3.5 h-3.5 text-[var(--muted-text)]" />
            {clock.time}
          </span>
        )}
      </div>
    </div>
  )
}
