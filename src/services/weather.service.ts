import { API_BASE_URLS } from '../constants'
import { fetchJson } from './api'
import type { WeatherModel } from '../types'

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    relative_humidity_2m: number
    surface_pressure: number
    is_day: number
  }
  daily?: {
    sunrise?: string[]
    sunset?: string[]
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<WeatherModel> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,is_day',
    daily: 'sunrise,sunset',
    timezone: 'auto',
  })

  const url = `${API_BASE_URLS.openMeteo}/forecast?${params}`
  const data = await fetchJson<OpenMeteoResponse>(url, { signal })

  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    humidity: data.current.relative_humidity_2m,
    pressure: data.current.surface_pressure,
    sunrise: data.daily?.sunrise?.[0] ?? '',
    sunset: data.daily?.sunset?.[0] ?? '',
    isDay: data.current.is_day === 1,
  }
}
