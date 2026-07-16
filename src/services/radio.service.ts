import { API_BASE_URLS } from '../constants'
import { fetchJson } from './api'
import type { StationModel } from '../types'

interface RadioBrowserStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  country: string
  countrycode: string
  state?: string
  codec: string
  bitrate: number
  homepage?: string
  language?: string
  tags?: string
  favicon?: string
  geo_lat?: number
  geo_long?: number
}

function toStationModel(s: RadioBrowserStation): StationModel {
  return {
    id: s.stationuuid,
    name: s.name,
    streamUrl: s.url_resolved || s.url,
    country: s.country,
    state: s.state,
    codec: s.codec,
    bitrate: s.bitrate,
    homepage: s.homepage,
    language: s.language,
    tags: s.tags ? s.tags.split(',').map((t) => t.trim()) : [],
    favicon: s.favicon,
    geo_lat: s.geo_lat,
    geo_long: s.geo_long,
  }
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TOP_COUNT = 5

export async function fetchStations(
  country: string,
  signal?: AbortSignal
): Promise<StationModel[]> {
  const params = new URLSearchParams({
    limit: '50',
    hidebroken: 'true',
    order: 'votes',
    reverse: 'true',
  })

  const url = `${API_BASE_URLS.radioBrowser}/stations/search?${params}&name=${encodeURIComponent(country)}`

  const data = await fetchJson<RadioBrowserStation[]>(url, { signal })

  return data
    .filter((s) => s.url && s.name)
    .slice(0, TOP_COUNT)
    .map(toStationModel)
}

export async function fetchStationsByCoordinates(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<StationModel[]> {
  const fetchWithParams = async (paramsObj: Record<string, string>) => {
    const params = new URLSearchParams({
      hidebroken: 'true',
      has_geo_info: 'true',
      geo_lat: latitude.toString(),
      geo_long: longitude.toString(),
      order: 'votes',
      reverse: 'true',
      ...paramsObj,
    })
    const url = `${API_BASE_URLS.radioBrowser}/stations/search?${params}`
    return fetchJson<RadioBrowserStation[]>(url, { signal })
  }

  // Tier 1: Search within 500 km radius for up to 200 top-voted working stations
  const rawStations = await fetchWithParams({
    geo_distance: '500000',
    limit: '200',
  })

  // Tier 2: If we found fewer than TOP_COUNT stations, expand search radius to 3,000 km
  if (rawStations.filter((s) => s.geo_lat != null && s.geo_long != null && s.url && s.name).length < TOP_COUNT) {
    const moreStations = await fetchWithParams({
      geo_distance: '3000000',
      limit: '200',
    })
    const existingIds = new Set(rawStations.map((s) => s.stationuuid))
    for (const s of moreStations) {
      if (!existingIds.has(s.stationuuid)) {
        rawStations.push(s)
      }
    }
  }

  // Tier 3: If still fewer than TOP_COUNT stations, fetch top 500 working stations globally with coordinates
  if (rawStations.filter((s) => s.geo_lat != null && s.geo_long != null && s.url && s.name).length < TOP_COUNT) {
    const globalStations = await fetchWithParams({
      limit: '500',
    })
    const existingIds = new Set(rawStations.map((s) => s.stationuuid))
    for (const s of globalStations) {
      if (!existingIds.has(s.stationuuid)) {
        rawStations.push(s)
      }
    }
  }

  // Separate stations that have geolocation data
  const stationsWithGeo = rawStations.filter(
    (s) => s.geo_lat != null && s.geo_long != null && s.url && s.name
  )

  // Sort by Haversine distance (nearest first)
  stationsWithGeo.sort((a, b) =>
    haversineDistance(latitude, longitude, a.geo_lat!, a.geo_long!) -
      haversineDistance(latitude, longitude, b.geo_lat!, b.geo_long!)
  )

  // Take up to TOP_COUNT stations with coordinates
  const selected: RadioBrowserStation[] = stationsWithGeo.slice(0, TOP_COUNT)

  // If we have fewer than TOP_COUNT, fill the remainder with any other stations from the raw response
  if (selected.length < TOP_COUNT) {
    const usedUuids = new Set(selected.map((s) => s.stationuuid))
    const extras = rawStations
      .filter((s) => s.url && s.name && !usedUuids.has(s.stationuuid))
      .slice(0, TOP_COUNT - selected.length)
    selected.push(...extras)
  }

  return selected.map(toStationModel)
}
