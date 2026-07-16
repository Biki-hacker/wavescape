export interface ThemeColors {
  background: string
  surface: string
  border: string
  text: string
  mutedText: string
  accent: string
  success: string
  warning: string
  danger: string
  info: string
}

export interface Theme {
  colors: ThemeColors
  shadowIntensity: number
  glowIntensity: number
  brightness: number
  particles: boolean
  crtEnabled: boolean
}
