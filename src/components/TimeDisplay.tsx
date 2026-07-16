import { useClock } from '../hooks/useClock'

interface TimeDisplayProps {
  timezone?: string
}

export function TimeDisplay({ timezone }: TimeDisplayProps) {
  const clock = useClock(timezone)

  return (
    <div className="text-center">
      <time
        className="font-mono text-5xl md:text-6xl lg:text-7xl font-black text-[var(--text)] tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        dateTime={clock.timeWithSeconds}
        aria-label={`Current time: ${clock.timeWithSeconds}`}
      >
        {clock.time}
      </time>
      {timezone && (
        <p className="inline-block font-mono font-bold text-xs text-[var(--text)] bg-[var(--surface)] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] mt-2">
          {timezone}
        </p>
      )}
    </div>
  )
}
