import type { WeatherModel, WeatherState, WeatherProfile, ParticleProfile, BackgroundStyle } from '../types'
import { WEATHER_CODE_MAP, WEATHER_ICON_MAP } from '../constants'

function getWeatherState(weatherCode: number, isDay: boolean): WeatherState {
  const base = WEATHER_CODE_MAP[weatherCode] ?? 'clear'

  if (base === 'clear') return isDay ? 'clear-day' : 'clear-night'
  if (base === 'mostly-clear') return isDay ? 'mostly-clear-day' : 'mostly-clear-night'
  if (base === 'partly-cloudy') return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
  if (base === 'fog') return isDay ? ('fog-day' as WeatherState) : ('fog-night' as WeatherState)
  if (base === 'overcast') return isDay ? 'overcast' : 'overcast'

  return base as WeatherState
}

function getWeatherLabel(state: WeatherState): string {
  const labels: Record<string, string> = {
    'clear-day': 'Clear Sky',
    'clear-night': 'Clear Night',
    'mostly-clear-day': 'Mostly Clear',
    'mostly-clear-night': 'Mostly Clear',
    'partly-cloudy-day': 'Partly Cloudy',
    'partly-cloudy-night': 'Partly Cloudy',
    cloudy: 'Cloudy',
    overcast: 'Overcast',
    'fog-day': 'Foggy',
    'fog-night': 'Foggy',
    fog: 'Fog',
    'haze-day': 'Hazy',
    'haze-night': 'Hazy',
    haze: 'Haze',
    mist: 'Mist',
    drizzle: 'Drizzle',
    rain: 'Rain',
    snow: 'Snow',
    storm: 'Thunderstorm',
    wind: 'Windy',
  }
  return labels[state] ?? 'Unknown'
}

function getParticleProfile(state: WeatherState): ParticleProfile {
  switch (state) {
    case 'clear-day':
      return { type: 'dust', density: 10, speed: 0.2, size: [1, 3], opacity: [0.1, 0.3], direction: 0, spread: 0.5 }
    case 'clear-night':
    case 'mostly-clear-night':
      return { type: 'stars', density: 30, speed: 0.1, size: [1, 2], opacity: [0.3, 0.8], direction: 0, spread: 1 }
    case 'rain':
    case 'drizzle':
      return { type: 'rain', density: 60, speed: 2, size: [1, 4], opacity: [0.2, 0.5], direction: 0, spread: 0.3 }
    case 'storm':
      return { type: 'rain', density: 80, speed: 3, size: [1, 5], opacity: [0.3, 0.7], direction: 0, spread: 0.4 }
    case 'snow':
      return { type: 'snow', density: 40, speed: 0.5, size: [2, 4], opacity: [0.3, 0.7], direction: 0, spread: 0.8 }
    case 'fog':
    case 'fog-day':
    case 'fog-night':
      return { type: 'haze', density: 20, speed: 0.3, size: [3, 6], opacity: [0.1, 0.2], direction: 0, spread: 1 }
    case 'haze':
    case 'haze-day':
    case 'haze-night':
      return { type: 'haze', density: 15, speed: 0.2, size: [2, 5], opacity: [0.1, 0.25], direction: 0, spread: 1 }
    case 'mist':
      return { type: 'haze', density: 25, speed: 0.2, size: [3, 6], opacity: [0.1, 0.2], direction: 0, spread: 1 }
    default:
      return { type: 'dust', density: 10, speed: 0.2, size: [1, 3], opacity: [0.1, 0.3], direction: 0, spread: 0.5 }
  }
}

function getBackgroundStyle(state: WeatherState, isDay: boolean): BackgroundStyle {
  if (state.includes('night') || !isDay) {
    return { style: 'radial', colors: ['#0a0a1a', '#141428'], intensity: 0.4 }
  }
  if (state.includes('rain') || state === 'drizzle') {
    return { style: 'linear', colors: ['#0e1424', '#1a2034'], intensity: 0.6 }
  }
  if (state.includes('storm')) {
    return { style: 'radial', colors: ['#0a0a18', '#181828'], intensity: 0.8 }
  }
  if (state.includes('snow')) {
    return { style: 'radial', colors: ['#1a1a28', '#282840'], intensity: 0.5 }
  }
  if (state.includes('fog') || state.includes('haze') || state.includes('mist') || state.includes('overcast') || state.includes('cloudy')) {
    return { style: 'radial', colors: ['#181828', '#242438'], intensity: 0.5 }
  }
  return { style: 'radial', colors: ['#1a1a2e', '#2a2a3e'], intensity: 0.7 }
}

function getIconPath(state: WeatherState): string {
  const lookup = state as string
  const icon = WEATHER_ICON_MAP[lookup]
  return icon ? `/icons/${icon}` : '/icons/clear-day.svg'
}

export class WeatherEngine {
  private currentProfile: WeatherProfile | null = null

  get profile(): WeatherProfile | null {
    return this.currentProfile
  }

  process(weather: WeatherModel): WeatherProfile {
    const state = getWeatherState(weather.weatherCode, weather.isDay)

    const profile: WeatherProfile = {
      state,
      icon: getIconPath(state),
      label: getWeatherLabel(state),
      brightness: weather.isDay ? 0.8 : 0.4,
      contrast: weather.isDay ? 1 : 0.7,
      motionLevel: this.getMotionLevel(state),
      glowLevel: this.getGlowLevel(state),
      particleProfile: getParticleProfile(state),
      backgroundStyle: getBackgroundStyle(state, weather.isDay),
    }

    this.currentProfile = profile
    return profile
  }

  private getMotionLevel(state: WeatherState): number {
    if (state === 'storm') return 0.8
    if (state.includes('rain')) return 0.5
    if (state.includes('wind')) return 0.6
    if (state.includes('snow')) return 0.3
    if (state.includes('fog') || state.includes('haze') || state.includes('mist') || state.includes('overcast') || state.includes('cloudy')) return 0.2
    return 0.1
  }

  private getGlowLevel(state: WeatherState): number {
    if (state === 'clear-day' || state === 'clear-night') return 0.7
    if (state.includes('fog') || state.includes('haze') || state.includes('mist')) return 0.2
    if (state.includes('overcast') || state.includes('cloudy')) return 0.3
    if (state.includes('storm')) return 0.6
    return 0.5
  }
}

export const weatherEngine = new WeatherEngine()
