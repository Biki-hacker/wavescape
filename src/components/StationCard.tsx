import { useState } from 'react'
import { Play, Pause, Clock, Cloud, Loader2 } from 'lucide-react'
import type { StationModel, WeatherModel, WeatherProfile } from '../types'
import { getWeatherIcon, WEATHER_LABELS } from '../constants/weather'
import { haversineDistance } from '../utils/math'

interface StationCardProps {
  station: StationModel
  searchedLocation?: { latitude: number; longitude: number } | null
  distance?: number | null
  isCurrent?: boolean
  isPlaying?: boolean
  isLoading?: boolean
  playbackState?: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'
  weather?: WeatherModel | null
  weatherProfile?: WeatherProfile | null
  timezone?: string
  loading?: boolean
  error?: boolean
  onSelect: (station: StationModel) => void
  onPlay?: (station: StationModel) => void
}

function formatDateTimeRange(sunrise?: string, sunset?: string) {
  if (!sunrise || !sunset) return null
  const sunriseParts = sunrise.split('T')
  const sunsetParts = sunset.split('T')
  const dateStr = sunriseParts[0] || ''
  const startTime = sunriseParts[1] || sunrise
  const endTime = sunsetParts[1] || sunset
  return { dateStr, timeStr: `${startTime}–${endTime}` }
}

export function StationCard({
  station,
  searchedLocation,
  distance,
  isCurrent = false,
  isPlaying = false,
  weather,
  weatherProfile,
  timezone,
  loading,
  error,
  onSelect,
  onPlay,
}: StationCardProps) {
  const [logoError, setLogoError] = useState(false)
  const dateTime = weather ? formatDateTimeRange(weather.sunrise, weather.sunset) : null

  const computedDistance = distance ?? (searchedLocation && station.geo_lat && station.geo_long
    ? haversineDistance(searchedLocation.latitude, searchedLocation.longitude, station.geo_lat, station.geo_long)
    : null)

const locationParts = [station.city, station.state, station.country].filter(Boolean)
  const locationStr = locationParts.join(', ') || station.country

  const weatherIcon = weather ? getWeatherIcon(weather.weatherCode, weather.isDay) : 'cloud'
  const weatherLabel = weather ? WEATHER_LABELS[weather.weatherCode] ?? '—' : '—'

  const handleClick = () => onSelect(station)
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay?.(station)
  }

  const statusColor = isPlaying ? 'bg-green-400 border border-black animate-pulse' : 'bg-[var(--muted-text)] border border-black'

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
      className={`w-full text-left p-4 md:p-5 cursor-pointer bg-[var(--surface)] border-3 border-black rounded-lg transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${
        isCurrent ? 'bg-[var(--accent)]/15 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 flex-shrink-0 rounded border-2 border-black bg-[var(--surface)] shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden"
        >
          {station.favicon && !logoError ? (
            <img
              src={station.favicon}
              alt={`${station.name} logo`}
              className="w-full h-full object-contain p-1"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-space text-xl font-bold text-[var(--text)]">
              {station.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-space text-lg font-bold text-[var(--text)] truncate">{station.name}</h3>
              <p className="font-mono text-sm font-medium text-[var(--muted-text)] truncate">{locationStr}</p>
            </div>
            {computedDistance !== null && (
              <span className="flex-shrink-0 font-mono font-bold text-xs text-[var(--text)] bg-[var(--surface)] border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {computedDistance < 1 ? `${Math.round(computedDistance * 1000)}m` : `${computedDistance.toFixed(1)}km`}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono">
            {station.codec && <span className="font-bold bg-[var(--surface)] text-[var(--text)] border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">{station.codec}</span>}
            {station.bitrate && <span className="font-bold bg-[var(--surface)] text-[var(--text)] border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">{station.bitrate}kbps</span>}
            {station.tags?.length && station.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="font-bold bg-[var(--accent)] text-black border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 text-sm w-full">
            <div className="flex items-center gap-3">
              {loading ? (
                <span className="flex items-center gap-1 font-mono font-bold text-xs text-[var(--muted-text)]">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--text)]" />
                  Loading atmosphere...
                </span>
              ) : error ? (
                <span className="flex items-center gap-1 font-mono font-bold text-xs text-[var(--muted-text)]">
                  <Cloud className="w-4 h-4 text-[var(--text)]" />
                  Atmosphere unavailable
                </span>
              ) : weather && weatherProfile ? (
                <span className="flex items-center gap-1.5 font-space font-bold text-base text-[var(--text)]">
                  <img
                    src={`/icons/${weatherIcon}`}
                    alt={weatherLabel}
                    className="w-5 h-5"
                    style={{ filter: 'grayscale(0)' }}
                  />
                  <span>{Math.round(weather.temperature)}°C</span>
                </span>
              ) : (
                <span className="font-mono text-xs text-[var(--muted-text)]">No coordinates for weather</span>
              )}
            </div>

            {weather && weatherProfile && dateTime && (
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2 font-mono font-medium text-xs text-[var(--muted-text)] text-right">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text)]" />
                  <span>{dateTime.dateStr && `${dateTime.dateStr} · `}{dateTime.timeStr}</span>
                </span>
                {timezone && (
                  <span className="flex items-center gap-1">
                    <span>· {timezone}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColor}`} />
          <button
            onClick={handlePlayClick}
            className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center transition-all duration-150 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 font-bold ${
              isPlaying
                ? 'bg-[var(--accent)] text-black'
                : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-black'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}