import { useState, useEffect, useRef } from 'react'

export function useTuningTransition(
  stationId: string | undefined,
  isRawConnecting: boolean,
  isRawPlaying: boolean
) {
  const [isVisualConnecting, setIsVisualConnecting] = useState(isRawConnecting)
  const [isVisualConnected, setIsVisualConnected] = useState(false)
  
  const minTuningEndRef = useRef<number>(0)
  const prevStationIdRef = useRef<string | undefined>(stationId)

  useEffect(() => {
    const now = Date.now()
    const stationChanged = stationId !== prevStationIdRef.current
    prevStationIdRef.current = stationId

    if (stationChanged || isRawConnecting) {
      minTuningEndRef.current = Math.max(minTuningEndRef.current, now + 850)
      setIsVisualConnecting(true)
      setIsVisualConnected(false)
    }
  }, [stationId, isRawConnecting])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now >= minTuningEndRef.current) {
        if (isRawPlaying && !isRawConnecting) {
          setIsVisualConnecting((prev) => {
            if (prev) {
              setIsVisualConnected(true)
            }
            return false
          })
        } else if (!isRawConnecting && !isRawPlaying) {
          setIsVisualConnecting(false)
        }
      }
    }, 40)

    return () => clearInterval(interval)
  }, [isRawPlaying, isRawConnecting])

  useEffect(() => {
    if (isVisualConnected) {
      const timer = setTimeout(() => setIsVisualConnected(false), 2800)
      return () => clearTimeout(timer)
    }
  }, [isVisualConnected])

  return { isVisualConnecting, isVisualConnected }
}
