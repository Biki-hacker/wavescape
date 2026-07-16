import { useState, useEffect, useCallback, useRef } from 'react'
import { StationCard } from './StationCard'
import type { StationModel, WeatherModel, WeatherProfile } from '../types'
import { fetchWeather } from '../services/weather.service'
import { weatherEngine } from '../weather/WeatherEngine'
import { haversineDistance } from '../utils/math'

interface StationWeatherData {
  weather: WeatherModel | null
  weatherProfile: WeatherProfile | null
  loading: boolean
  error: boolean
}

interface StationListProps {
  stations: StationModel[]
  searchedLocation?: { latitude: number; longitude: number } | null
  currentStationId?: string | null
  playingStationId?: string | null
  playbackState?: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'
  onSelect: (station: StationModel) => void
  onPlay: (station: StationModel) => void
}

export function StationList({
  stations,
  searchedLocation,
  currentStationId,
  playingStationId,
  playbackState = 'idle',
  onSelect,
  onPlay,
}: StationListProps) {
  const [weatherData, setWeatherData] = useState<Map<string, StationWeatherData>>(new Map())
  const loadedStationsRef = useRef<Set<string>>(new Set())
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  const loadStationWeather = useCallback(async (station: StationModel) => {
    if (!station.geo_lat || !station.geo_long) return
    if (loadedStationsRef.current.has(station.id)) return

    const controller = new AbortController()
    abortControllersRef.current.set(station.id, controller)

    setWeatherData(prev => {
      const next = new Map(prev)
      next.set(station.id, { weather: null, weatherProfile: null, loading: true, error: false })
      return next
    })

    try {
      const weatherResult = await fetchWeather(station.geo_lat, station.geo_long, controller.signal)

      if (controller.signal.aborted) return

      const profile = weatherEngine.process(weatherResult)

      setWeatherData(prev => {
        const next = new Map(prev)
        next.set(station.id, {
          weather: weatherResult,
          weatherProfile: profile,
          loading: false,
          error: false,
        })
        return next
      })

      loadedStationsRef.current.add(station.id)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setWeatherData(prev => {
        const next = new Map(prev)
        next.set(station.id, { weather: null, weatherProfile: null, loading: false, error: true })
        return next
      })
    }
  }, [])

  useEffect(() => {
    const controllers = abortControllersRef.current
    stations.forEach(station => {
      if (station.geo_lat && station.geo_long) {
        loadStationWeather(station)
      }
    })

    return () => {
      controllers.forEach(controller => controller.abort())
    }
  }, [stations, loadStationWeather])

  if (stations.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted-text)] font-mono">
        No stations found nearby
      </div>
    )
  }

  return (
    <div className="space-y-3" role="list" aria-label="Nearby radio stations">
      {stations.map((station) => {
        const isCurrent = station.id === currentStationId
        const isPlaying = playingStationId === station.id && playbackState === 'playing'
        const isLoading = playingStationId === station.id && playbackState === 'loading'
        const data = weatherData.get(station.id)
        const distance = searchedLocation && station.geo_lat && station.geo_long
          ? haversineDistance(searchedLocation.latitude, searchedLocation.longitude, station.geo_lat, station.geo_long)
          : null

        return (
          <StationCard
            key={station.id}
            station={station}
            distance={distance}
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            isLoading={isLoading}
            playbackState={playbackState}
            weather={data?.weather ?? null}
            weatherProfile={data?.weatherProfile ?? null}
            loading={data?.loading ?? false}
            error={data?.error ?? false}
            onSelect={onSelect}
            onPlay={onPlay}
          />
        )
      })}
    </div>
  )
}