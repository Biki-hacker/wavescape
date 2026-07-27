import { API_BASE_URLS } from '../constants'
import { fetchJson } from './api'
import type { LocationModel, LocationSuggestion } from '../types'

interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
  name?: string
  address?: {
    city?: string
    town?: string
    village?: string
    hamlet?: string
    suburb?: string
    neighbourhood?: string
    borough?: string
    municipality?: string
    county?: string
    state_district?: string
    state?: string
    island?: string
    country?: string
    country_code?: string
  }
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const url = `${API_BASE_URLS.nominatim}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`

  const data = await fetchJson<NominatimResponse[]>(url, { signal })

  return data
    .filter((item) => item.lat && item.lon)
    .map((item) => {
      const fallbackName = item.name || item.display_name.split(',')[0]?.trim() || 'Unknown'
      return {
        name:
          item.address?.city ??
          item.address?.town ??
          item.address?.village ??
          item.address?.municipality ??
          item.address?.hamlet ??
          item.address?.suburb ??
          item.address?.neighbourhood ??
          item.address?.borough ??
          item.address?.county ??
          item.address?.state ??
          item.address?.island ??
          fallbackName,
        country: item.address?.country ?? 'Unknown',
        countryCode: item.address?.country_code?.toUpperCase(),
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }
    })
}

export async function resolveLocation(
  query: string,
  signal?: AbortSignal
): Promise<LocationModel | null> {
  const suggestions = await searchLocations(query, signal)
  if (suggestions.length === 0) return null

  const first = suggestions[0]!
  return {
    name: first.name,
    country: first.country,
    countryCode: first.countryCode,
    displayName: first.displayName,
    latitude: first.latitude,
    longitude: first.longitude,
  }
}
