import { useRef } from 'react'
import { useVisualization } from '../hooks/useVisualization'

interface WaveformCanvasProps {
  className?: string
}

export function WaveformCanvas({ className = '' }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useVisualization(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
