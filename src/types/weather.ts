export interface WeatherModel {
  temperature: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  humidity: number
  pressure: number
  sunrise: string
  sunset: string
  isDay: boolean
}

export type WeatherState =
  | 'clear-day'
  | 'clear-night'
  | 'mostly-clear-day'
  | 'mostly-clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'overcast'
  | 'overcast-day'
  | 'overcast-night'
  | 'rain'
  | 'drizzle'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'fog-day'
  | 'fog-night'
  | 'haze'
  | 'haze-day'
  | 'haze-night'
  | 'mist'
  | 'wind'

export interface WeatherProfile {
  state: WeatherState
  icon: string
  label: string
  brightness: number
  contrast: number
  motionLevel: number
  glowLevel: number
  particleProfile: ParticleProfile
  backgroundStyle: BackgroundStyle
}

export interface ParticleProfile {
  type: ParticleType
  density: number
  speed: number
  size: [number, number]
  opacity: [number, number]
  direction: number
  spread: number
}

export type ParticleType = 'dust' | 'rain' | 'snow' | 'stars' | 'haze' | 'sparks' | 'none'

export interface BackgroundStyle {
  style: 'radial' | 'linear' | 'solid'
  colors: [string, string]
  intensity: number
}
