import type { WeatherModel, WeatherProfile } from '../types'
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure } from '../utils'

interface WeatherCardProps {
  weather: WeatherModel | null
  profile: WeatherProfile | null
}

export function WeatherCard({ weather, profile }: WeatherCardProps) {
  if (!weather || !profile) return null

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20">
          <img
            src={profile.icon}
            alt={profile.label}
            className="w-full h-full"
            aria-hidden="true"
          />
        </div>
        <span className="font-mono text-6xl md:text-7xl lg:text-8xl font-black text-[var(--text)] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          {formatTemperature(weather.temperature)}
        </span>
      </div>

      <p className="font-space text-xl md:text-2xl font-black text-[var(--text)] uppercase">
        {profile.label}
      </p>

      <div className="flex flex-wrap justify-center gap-4 font-mono text-sm md:text-base">
        <span title="Wind Speed" className="bg-[var(--surface)] text-[var(--text)] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">{formatWindSpeed(weather.windSpeed)}</span>
        <span title="Humidity" className="bg-[var(--surface)] text-[var(--text)] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">{formatHumidity(weather.humidity)}</span>
        <span title="Pressure" className="bg-[var(--surface)] text-[var(--text)] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">{formatPressure(weather.pressure)}</span>
      </div>
    </div>
  )
}
