export function formatTemperature(celsius: number): string {
  const rounded = Math.round(celsius)
  return `${rounded}°`
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index] ?? 'N'
}

export function formatWindSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`
}

export function formatPressure(hpa: number): string {
  return `${Math.round(hpa)} hPa`
}

export function formatStationFrequency(name: string): string {
  const match = name.match(/(\d+[.,]\d+)/)
  if (match?.[1]) {
    return `${match[1]} FM`
  }
  return name
}

export function formatTimeWithSeconds(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}
