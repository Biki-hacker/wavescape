import { useState, useCallback, useEffect, useRef } from 'react'
import { useClock } from '../hooks/useClock'
import type { StationModel, PlaybackState, WeatherModel, WeatherProfile } from '../types'
import { StationList } from './StationList'

interface RadioDisplayProps {
  station: StationModel | null
  playbackState: PlaybackState
  weather: WeatherModel | null
  weatherProfile: WeatherProfile | null
  timezone?: string
  onStationSelect: (station: StationModel) => void
  onStationPlay: (station: StationModel) => void
  stations: StationModel[]
  searchedLocation?: { latitude: number; longitude: number } | null
  isVisualConnecting?: boolean
  isVisualConnected?: boolean
}

function StationLogo({ favicon, name }: { favicon?: string; name: string }) {
  const [error, setError] = useState(false)

  if (favicon && !error) {
    return (
      <img
        src={favicon}
        alt={`${name} logo`}
        className="w-12 h-12 rounded border-2 border-black object-contain p-1 bg-[var(--surface)] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className="w-12 h-12 rounded border-2 border-black bg-[var(--surface)] shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center font-space text-base font-bold text-[var(--text)]">
      {(name.charAt(0) || 'R').toUpperCase()}
    </div>
  )
}

export function RadioDisplay({ 
  station, 
  playbackState, 
  weather, 
  weatherProfile, 
  timezone, 
  onStationSelect, 
  onStationPlay,
  stations,
  searchedLocation,
  isVisualConnecting,
  isVisualConnected
}: RadioDisplayProps) {
  const rawPlaying = playbackState === 'playing'
  const rawConnecting = playbackState === 'loading' || playbackState === 'buffering'
  const clock = useClock(timezone)
  const [showStationList, setShowStationList] = useState(false)
  const [localJustConnected, setLocalJustConnected] = useState(false)
  const prevConnectingRef = useRef(rawConnecting)

  useEffect(() => {
    if (prevConnectingRef.current && rawPlaying && !rawConnecting) {
      setLocalJustConnected(true)
      const timer = setTimeout(() => setLocalJustConnected(false), 2600)
      return () => clearTimeout(timer)
    }
    prevConnectingRef.current = rawConnecting
  }, [rawConnecting, rawPlaying])

  const connecting = isVisualConnecting !== undefined ? isVisualConnecting : rawConnecting
  const connected = isVisualConnected !== undefined ? isVisualConnected : localJustConnected
  const playing = rawPlaying && !connecting

  const handleStationSelect = useCallback((s: StationModel) => {
    onStationSelect(s)
    setShowStationList(false)
  }, [onStationSelect])

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Current station card */}
      <div className="bg-[var(--surface)] border-4 border-black rounded-lg p-5 md:p-6 space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-300">
        {/* Header: Logo + name + status */}
        <div className="flex items-center gap-3">
          <StationLogo favicon={station?.favicon} name={station?.name || ''} />
          <div key={station?.id || 'empty'} className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-500">
            <p className="font-space text-lg font-bold text-[var(--text)] truncate">
              {station?.name || 'No station selected'}
            </p>
            {station && (
              <p className="font-mono text-xs font-medium text-[var(--muted-text)] truncate mt-0.5">
                {[station.city, station.state, station.country].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {station && (
              <span className={`w-3 h-3 rounded-full border border-black transition-all duration-500 ${connected || playing ? 'bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]' : connecting ? 'bg-[var(--accent)] animate-ping' : 'bg-[var(--muted-text)]'}`} />
            )}
          </div>
        </div>

        {/* Creative tuning / frequency locked transition banner */}
        {(connecting || connected) && station && (
          <div
            className={`flex items-center justify-between gap-2 py-2.5 px-3 border-3 border-black rounded-lg font-mono text-xs font-bold shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all duration-300 ease-out ${
              connected
                ? 'bg-emerald-400 text-black'
                : 'bg-[var(--accent)] text-black animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 border border-black rounded-full ${
                  connected ? 'bg-black' : 'bg-black animate-ping'
                }`}
              />
              <span>{connected ? '✦ FREQUENCY LOCKED · STREAM LIVE' : 'TUNING TO FREQUENCY...'}</span>
            </div>
            <span className="opacity-90 font-extrabold tracking-wider">{connected ? 'CONNECTED' : 'TUNING'}</span>
          </div>
        )}

        {/* Codec & bitrate */}
        {station && (
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="font-bold bg-[var(--surface)] text-[var(--text)] border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">{station.codec}</span>
            <span className="font-bold bg-[var(--surface)] text-[var(--text)] border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">{station.bitrate} kbps</span>
            {station.tags && station.tags.length > 0 && (
              <span className="font-bold bg-[var(--accent)] text-black border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] truncate max-w-[200px]">
                {station.tags.slice(0, 3).join(', ')}
              </span>
            )}
          </div>
        )}

        {/* Weather & time for station */}
        {weather && weatherProfile && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t-3 border-black">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-[var(--muted-text)]">Weather</p>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={weatherProfile.icon}
                  alt={weatherProfile.label}
                  className="w-8 h-8"
                />
                <div>
                  <p className="font-space text-lg font-bold text-[var(--text)]">
                    {Math.round(weather.temperature)}°C
                  </p>
                  <p className="font-mono text-xs font-medium text-[var(--muted-text)]">
                    {weatherProfile.label}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase text-[var(--muted-text)]">Local Time</p>
              <p className="font-space text-2xl font-bold text-[var(--text)] mt-1">
                {clock.time}
              </p>
              {timezone && (
                <p className="font-mono text-xs font-medium text-[var(--muted-text)] truncate">
                  {timezone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* No data state */}
        {!station && (
          <p className="font-mono text-sm font-bold text-[var(--muted-text)] text-center py-4">
            Select a station to hear its atmosphere
          </p>
        )}
      </div>

      {/* Station browser toggle */}
      {stations.length > 1 && (
        <button
          onClick={() => setShowStationList((v) => !v)}
          className="w-full py-3 font-space font-bold uppercase text-sm text-[var(--text)] bg-[var(--surface)] border-3 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)] hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
          aria-expanded={showStationList}
        >
          {showStationList ? 'Hide stations' : `Browse ${stations.length} stations`}
        </button>
      )}

      {/* Station list */}
      {showStationList && stations.length > 0 && (
        <StationList
          stations={stations}
          searchedLocation={searchedLocation}
          currentStationId={station?.id ?? null}
          onSelect={handleStationSelect}
          onPlay={onStationPlay}
        />
      )}
    </div>
  )
}