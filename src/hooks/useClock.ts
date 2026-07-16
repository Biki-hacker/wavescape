import { useState, useEffect, useRef } from 'react'

interface ClockState {
  time: string
  timeWithSeconds: string
  hours: number
  minutes: number
  seconds: number
  isDay: boolean
}

export function useClock(timezone?: string): ClockState {
  const [state, setState] = useState<ClockState>(() => getClockState(timezone))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const update = () => setState(getClockState(timezone))

    update()
    intervalRef.current = setInterval(update, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timezone])

  return state
}

function getClockState(timezone?: string): ClockState {
  const now = timezone
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date()

  return {
    time: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    timeWithSeconds: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    isDay: now.getHours() >= 6 && now.getHours() < 18,
  }
}
