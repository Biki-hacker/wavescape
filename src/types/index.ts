export type { LocationModel, LocationSuggestion } from './location'
export type { WeatherModel, WeatherState, WeatherProfile, ParticleProfile, BackgroundStyle, ParticleType } from './weather'
export type { AudioMetrics, PlaybackState, StationModel } from './audio'
export type { ThemeColors, Theme } from './theme'
export type { TVChannel, TVCategory, TVStream, TVLogo, TVCountry } from './tv'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AppError {
  code: string
  message: string
  friendlyMessage: string
  retry?: () => void
}

export type SceneState = 'landing' | 'searching' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error'

export interface TimeModel {
  localTime: string
  timezone: string
  utcOffset: string
}
