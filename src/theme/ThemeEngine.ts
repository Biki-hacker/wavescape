import type { Theme, ThemeColors } from '../types'
import type { WeatherState } from '../types'

const PALETTE_PROFILES: Record<string, Partial<ThemeColors>> = {
  'clear-day': {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#FFDE59',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  'clear-night': {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#A855F7',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  'partly-cloudy-day': {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#38B6FF',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  'partly-cloudy-night': {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#60A5FA',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  cloudy: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#FF914D',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  overcast: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#FF5757',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  rain: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#00E5FF',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  drizzle: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#0EA5E9',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  storm: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#FFD700',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  snow: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#10B981',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  fog: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#8B5CF6',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  haze: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#F59E0B',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  mist: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#06B6D4',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
  wind: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    accent: '#26C6DA',
    text: '#000000',
    mutedText: '#4A4A4A',
    border: '#000000',
  },
}

const STARTER_THEME: Theme = {
  colors: {
    background: '#FFF8E7',
    surface: '#FFFFFF',
    border: '#000000',
    text: '#000000',
    mutedText: '#4A4A4A',
    accent: '#FFDE59',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#FF5757',
    info: '#38B6FF',
  },
  shadowIntensity: 1,
  glowIntensity: 0.5,
  brightness: 1,
  particles: true,
  crtEnabled: true,
}

export class ThemeEngine {
  private currentTheme: Theme
  private listeners: Set<(theme: Theme) => void> = new Set()

  constructor() {
    this.currentTheme = { ...STARTER_THEME }
  }

  get theme(): Theme {
    return this.currentTheme
  }

  generate(weatherState: WeatherState, isDay: boolean, temperature: number): Theme {
    const profile = this.getProfile(weatherState)
    const colors = this.generateColors(profile, temperature, isDay)

    const theme: Theme = {
      colors,
      shadowIntensity: 1,
      glowIntensity: this.calculateGlow(weatherState, temperature),
      brightness: 1,
      particles: true,
      crtEnabled: true,
    }

    this.currentTheme = theme
    this.notify()
    return theme
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private getProfile(weatherState: WeatherState): Partial<ThemeColors> {
    const key = weatherState as string
    return PALETTE_PROFILES[key] ?? PALETTE_PROFILES['clear-day']!
  }

  private generateColors(profile: Partial<ThemeColors>, temperature: number, _isDay: boolean): ThemeColors {
    const warmth = Math.min(Math.max((temperature + 10) / 40, 0), 1)

    return {
      background: profile.background ?? '#FFF8E7',
      surface: profile.surface ?? '#FFFFFF',
      border: '#000000',
      text: profile.text ?? '#000000',
      mutedText: profile.mutedText ?? '#4A4A4A',
      accent: this.adjustAccent(profile.accent ?? '#FFDE59', warmth),
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#FF5757',
      info: '#38B6FF',
    }
  }

  private adjustAccent(hex: string, warmth: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const wr = Math.round(r + (255 - r) * warmth * 0.3)
    const wg = Math.round(g + (255 - g) * warmth * 0.1)
    const wb = Math.round(b - b * warmth * 0.2)
    return `#${((wr << 16) | (wg << 8) | wb).toString(16).padStart(6, '0')}`
  }

  private calculateGlow(weatherState: WeatherState, temperature: number): number {
    if (weatherState.includes('storm')) return 0.8
    if (weatherState.includes('rain')) return 0.3
    if (weatherState.includes('fog') || weatherState.includes('haze') || weatherState.includes('mist')) return 0.2
    if (weatherState.includes('snow')) return 0.4
    return 0.5 + Math.min(Math.max(temperature / 50, 0), 1) * 0.3
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentTheme)
    }
  }
}

export const themeEngine = new ThemeEngine()
