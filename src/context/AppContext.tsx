/* oxlint-disable react/only-export-components */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { LocationModel, WeatherModel, WeatherProfile, Theme, AudioMetrics, StationModel, PlaybackState, SceneState, LoadingState, AppError } from '../types'

interface AppState {
  searchedLocation: LocationModel | null
  activeLocation: LocationModel | null
  weather: WeatherModel | null
  weatherProfile: WeatherProfile | null
  weatherLoading: LoadingState
  theme: Theme | null
  timezone: string | null
  stations: StationModel[]
  currentStation: StationModel | null
  stationsLoading: LoadingState
  playbackState: PlaybackState
  audioMetrics: AudioMetrics | null
  sceneState: SceneState
  error: AppError | null
  searchHistory: string[]
}

type Action =
  | { type: 'SET_SEARCHED_LOCATION'; payload: LocationModel }
  | { type: 'SET_ACTIVE_LOCATION'; payload: LocationModel }
  | { type: 'SET_WEATHER'; payload: WeatherModel }
  | { type: 'SET_WEATHER_PROFILE'; payload: WeatherProfile }
  | { type: 'SET_WEATHER_LOADING'; payload: LoadingState }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_TIMEZONE'; payload: string }
  | { type: 'SET_STATIONS'; payload: StationModel[] }
  | { type: 'SET_CURRENT_STATION'; payload: StationModel | null }
  | { type: 'SET_STATIONS_LOADING'; payload: LoadingState }
  | { type: 'SET_PLAYBACK_STATE'; payload: PlaybackState }
  | { type: 'SET_AUDIO_METRICS'; payload: AudioMetrics }
  | { type: 'SET_SCENE_STATE'; payload: SceneState }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'CLEAR_DATA' }

const initialState: AppState = {
  searchedLocation: null,
  activeLocation: null,
  weather: null,
  weatherProfile: null,
  weatherLoading: 'idle',
  theme: null,
  timezone: null,
  stations: [],
  currentStation: null,
  stationsLoading: 'idle',
  playbackState: 'idle',
  audioMetrics: null,
  sceneState: 'landing',
  error: null,
  searchHistory: [],
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SEARCHED_LOCATION':
      return { ...state, searchedLocation: action.payload }
    case 'SET_ACTIVE_LOCATION':
      return { ...state, activeLocation: action.payload }
    case 'SET_WEATHER':
      return { ...state, weather: action.payload, weatherLoading: 'success' }
    case 'SET_WEATHER_PROFILE':
      return { ...state, weatherProfile: action.payload }
    case 'SET_WEATHER_LOADING':
      return { ...state, weatherLoading: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_TIMEZONE':
      return { ...state, timezone: action.payload }
    case 'SET_STATIONS':
      return { ...state, stations: action.payload, stationsLoading: 'success' }
    case 'SET_CURRENT_STATION':
      return { ...state, currentStation: action.payload }
    case 'SET_STATIONS_LOADING':
      return { ...state, stationsLoading: action.payload }
    case 'SET_PLAYBACK_STATE':
      return { ...state, playbackState: action.payload }
    case 'SET_AUDIO_METRICS':
      return { ...state, audioMetrics: action.payload }
    case 'SET_SCENE_STATE':
      return { ...state, sceneState: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR_DATA':
      return {
        ...state,
        weather: null,
        weatherProfile: null,
        theme: null,
        timezone: null,
        stations: [],
        currentStation: null,
        playbackState: 'idle',
        audioMetrics: null,
        error: null,
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx.state
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider')
  return ctx.dispatch
}

export { AppContext }
export type { Action }
