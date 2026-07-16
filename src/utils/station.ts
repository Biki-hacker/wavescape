import type { LocationModel, StationModel } from '../types'

export function stationToLocation(station: StationModel, fallback?: LocationModel | null): LocationModel | null {
  if (station.geo_lat != null && station.geo_long != null) {
    return {
      name: station.city || station.state || station.name.split(' ').slice(0, 2).join(' ') || station.name,
      country: station.country,
      displayName: [station.city, station.state, station.country].filter(Boolean).join(', '),
      latitude: station.geo_lat,
      longitude: station.geo_long,
    }
  }
  return fallback || null
}