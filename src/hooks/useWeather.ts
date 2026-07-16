import { useCallback, useEffect, useRef } from 'react'
import { useAppState, useAppDispatch } from '../context'
import { fetchWeather } from '../services/weather.service'
import { fetchTimeByCoordinates } from '../services/time.service'
import { weatherEngine } from '../weather/WeatherEngine'
import { themeEngine } from '../theme/ThemeEngine'
import { WEATHER_REFRESH_INTERVAL } from '../constants'
import type { Theme } from '../types'

export function useWeather() {
  const { weather, weatherProfile, weatherLoading, activeLocation } = useAppState()
  const dispatch = useAppDispatch()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadWeather = useCallback(async (latitude: number, longitude: number) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    dispatch({ type: 'SET_WEATHER_LOADING', payload: 'loading' })

    try {
      const [data, timeData] = await Promise.all([
        fetchWeather(latitude, longitude, abortRef.current.signal),
        fetchTimeByCoordinates(latitude, longitude, abortRef.current.signal),
      ])
      dispatch({ type: 'SET_WEATHER', payload: data })
      dispatch({ type: 'SET_TIMEZONE', payload: timeData.timezone })

      const profile = weatherEngine.process(data)
      dispatch({ type: 'SET_WEATHER_PROFILE', payload: profile })

      const theme = themeEngine.generate(profile.state, data.isDay, data.temperature)
      dispatch({ type: 'SET_THEME', payload: theme })

      return { profile, theme }
    } catch {
      dispatch({ type: 'SET_WEATHER_LOADING', payload: 'error' })
      return { profile: null, theme: null as Theme | null }
    }
  }, [dispatch])

  useEffect(() => {
    if (!activeLocation) return

    loadWeather(activeLocation.latitude, activeLocation.longitude)

    intervalRef.current = setInterval(() => {
      loadWeather(activeLocation.latitude, activeLocation.longitude)
    }, WEATHER_REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [activeLocation, loadWeather])

  return { weather, weatherProfile, weatherLoading, loadWeather }
}
