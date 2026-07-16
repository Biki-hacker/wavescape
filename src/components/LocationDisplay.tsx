import type { LocationModel } from '../types'

interface LocationDisplayProps {
  location: LocationModel | null
}

export function LocationDisplay({ location }: LocationDisplayProps) {
  if (!location) return null

  return (
    <div className="text-center space-y-2">
      <h1 className="font-space text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text)] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">
        {location.name.toUpperCase()}
      </h1>
      <p className="inline-block font-mono text-base md:text-lg font-bold text-[var(--text)] bg-[var(--surface)] border-3 border-black px-4 py-1.5 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        {location.country}
      </p>
    </div>
  )
}
