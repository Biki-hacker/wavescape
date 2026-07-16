import { useAppState } from '../context'
import type { Theme } from '../types'

export function useTheme(): Theme | null {
  const { theme } = useAppState()
  return theme
}

export function useThemeColors(): Theme['colors'] | null {
  const theme = useTheme()
  return theme?.colors ?? null
}
