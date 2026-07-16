import { API_BASE_URLS } from '../constants'
import { fetchJson } from './api'

interface WorldTimeResponse {
  datetime: string
  timezone: string
  utc_offset: string
}

interface TimeApiResponse {
  dateTime?: string
  timeZone?: string
}

interface OpenMeteoTimeResponse {
  timezone?: string
  utc_offset_seconds?: number
  current?: {
    time?: string
  }
}

export interface TimeModel {
  localTime: string
  timezone: string
  utcOffset: string
}

function getUtcOffset(tz: string): string {
  try {
    const formatted = Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    }).format(new Date())
    const parts = formatted.split(', ')
    const offsetPart = parts[parts.length - 1] || 'GMT+00:00'
    const clean = offsetPart.replace('GMT', '')
    return clean || '+00:00'
  } catch {
    return '+00:00'
  }
}

function getLocalIsoString(tz: string): string {
  try {
    const now = new Date()
    const str = now.toLocaleString('sv-SE', { timeZone: tz })
    return str.replace(' ', 'T')
  } catch {
    return new Date().toISOString()
  }
}

export async function fetchTime(
  timezone: string,
  signal?: AbortSignal
): Promise<TimeModel> {
  // 1. Try TimeAPI.io by zone
  try {
    const url = `${API_BASE_URLS.timeApi}/zone?timeZone=${encodeURIComponent(timezone)}`
    const data = await fetchJson<TimeApiResponse>(url, { signal })
    if (data.timeZone) {
      return {
        localTime: data.dateTime || getLocalIsoString(data.timeZone),
        timezone: data.timeZone,
        utcOffset: getUtcOffset(data.timeZone),
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 2. Try WorldTimeAPI
  try {
    const url = `${API_BASE_URLS.worldTime}/timezone/${encodeURIComponent(timezone)}`
    const data = await fetchJson<WorldTimeResponse>(url, { signal })
    if (data.timezone) {
      return {
        localTime: data.datetime,
        timezone: data.timezone,
        utcOffset: data.utc_offset || getUtcOffset(data.timezone),
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 3. Fallback to Intl calculation
  const tz = timezone || 'UTC'
  return {
    localTime: getLocalIsoString(tz),
    timezone: tz,
    utcOffset: getUtcOffset(tz),
  }
}

export async function fetchTimeByCoordinates(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<TimeModel> {
  // 1. Try TimeAPI.io by coordinate
  try {
    const url = `${API_BASE_URLS.timeApi}/coordinate?latitude=${latitude}&longitude=${longitude}`
    const data = await fetchJson<TimeApiResponse>(url, { signal })
    if (data.timeZone) {
      return {
        localTime: data.dateTime || getLocalIsoString(data.timeZone),
        timezone: data.timeZone,
        utcOffset: getUtcOffset(data.timeZone),
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 2. Try Open-Meteo forecast (lightweight query since it returns exact timezone)
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'is_day',
      timezone: 'auto',
    })
    const url = `${API_BASE_URLS.openMeteo}/forecast?${params}`
    const data = await fetchJson<OpenMeteoTimeResponse>(url, { signal })
    if (data.timezone) {
      return {
        localTime: data.current?.time || getLocalIsoString(data.timezone),
        timezone: data.timezone,
        utcOffset: getUtcOffset(data.timezone),
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 3. Try WorldTimeAPI
  try {
    const url = `${API_BASE_URLS.worldTime}/timezone/${latitude}/${longitude}`
    const data = await fetchJson<WorldTimeResponse>(url, { signal })
    if (data.timezone) {
      return {
        localTime: data.datetime,
        timezone: data.timezone,
        utcOffset: data.utc_offset || getUtcOffset(data.timezone),
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 4. Fallback to client browser timezone
  const fallbackTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  return {
    localTime: getLocalIsoString(fallbackTz),
    timezone: fallbackTz,
    utcOffset: getUtcOffset(fallbackTz),
  }
}
