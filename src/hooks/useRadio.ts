import { useCallback, useEffect, useRef } from 'react'
import { useAppState, useAppDispatch } from '../context'
import { fetchStationsByCoordinates } from '../services/radio.service'
import { audioEngine } from '../audio/AudioEngine'
import type { StationModel } from '../types'
import { stationToLocation } from '../utils/station'

export function useRadio() {
  const { stations, currentStation, playbackState, searchedLocation } = useAppState()
  const dispatch = useAppDispatch()
  const abortRef = useRef<AbortController | null>(null)
  const stationIndexRef = useRef(0)

  const selectStation = useCallback((station: StationModel) => {
    dispatch({ type: 'SET_CURRENT_STATION', payload: station })
    const idx = stations.findIndex((s) => s.id === station.id)
    if (idx !== -1) {
      stationIndexRef.current = idx
    }
    const loc = stationToLocation(station, searchedLocation)
    if (loc) {
      dispatch({ type: 'SET_ACTIVE_LOCATION', payload: loc })
    }
  }, [dispatch, searchedLocation, stations])

  const loadStations = useCallback(async (latitude: number, longitude: number) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    dispatch({ type: 'SET_STATIONS_LOADING', payload: 'loading' })

    try {
      const results = await fetchStationsByCoordinates(latitude, longitude, abortRef.current.signal)
      dispatch({ type: 'SET_STATIONS', payload: results })

      if (results.length > 0) {
        const station = results[0]!
        selectStation(station)
        stationIndexRef.current = 0
      }

      return results
    } catch {
      dispatch({ type: 'SET_STATIONS_LOADING', payload: 'error' })
      return [] as typeof stations
    }
  }, [dispatch, selectStation])

  const play = useCallback(async (targetStation?: StationModel) => {
    const stationToPlay = targetStation || currentStation
    if (!stationToPlay) return
    await audioEngine.play(stationToPlay.streamUrl, stationToPlay.id)
  }, [currentStation])

  const pause = useCallback(() => {
    audioEngine.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (playbackState === 'playing' || playbackState === 'loading' || playbackState === 'buffering') {
      pause()
    } else {
      play()
    }
  }, [playbackState, play, pause])

  const nextStation = useCallback(() => {
    if (stations.length === 0) return
    let currentIndex = stationIndexRef.current
    if (currentStation) {
      const foundIdx = stations.findIndex((s) => s.id === currentStation.id)
      if (foundIdx !== -1) {
        currentIndex = foundIdx
      }
    }
    const nextIdx = (currentIndex + 1) % stations.length
    stationIndexRef.current = nextIdx
    const station = stations[nextIdx]!
    selectStation(station)
    play(station)
  }, [stations, currentStation, selectStation, play])

  const prevStation = useCallback(() => {
    if (stations.length === 0) return
    let currentIndex = stationIndexRef.current
    if (currentStation) {
      const foundIdx = stations.findIndex((s) => s.id === currentStation.id)
      if (foundIdx !== -1) {
        currentIndex = foundIdx
      }
    }
    const prevIdx = (currentIndex - 1 + stations.length) % stations.length
    stationIndexRef.current = prevIdx
    const station = stations[prevIdx]!
    selectStation(station)
    play(station)
  }, [stations, currentStation, selectStation, play])

  useEffect(() => {
    const unsubState = audioEngine.onStateChange((state) => {
      dispatch({ type: 'SET_PLAYBACK_STATE', payload: state })
    })

    const unsubMetrics = audioEngine.subscribe((metrics) => {
      dispatch({ type: 'SET_AUDIO_METRICS', payload: metrics })
    })

    return () => {
      unsubState()
      unsubMetrics()
    }
  }, [dispatch])

  useEffect(() => {
    return () => {
      audioEngine.dispose()
    }
  }, [])

  return {
    stations,
    currentStation,
    playbackState,
    loadStations,
    selectStation,
    play,
    pause,
    togglePlay,
    nextStation,
    prevStation,
  }
}