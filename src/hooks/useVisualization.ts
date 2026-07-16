import { useEffect, useRef } from 'react'
import { visualizationEngine } from '../visualization/VisualizationEngine'
import { useAppState } from '../context'

export function useVisualization(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { theme, audioMetrics, weatherProfile } = useAppState()
  const initialized = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || initialized.current) return

    visualizationEngine.init(canvas)
    initialized.current = true

    const handleResize = () => visualizationEngine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      visualizationEngine.stopLoop()
      window.removeEventListener('resize', handleResize)
      initialized.current = false
    }
  }, [canvasRef])

  useEffect(() => {
    if (theme) visualizationEngine.updateTheme(theme)
  }, [theme])

  useEffect(() => {
    if (audioMetrics) visualizationEngine.updateAudio(audioMetrics)
  }, [audioMetrics])

  useEffect(() => {
    if (weatherProfile) visualizationEngine.updateWeather(weatherProfile)
  }, [weatherProfile])
}
