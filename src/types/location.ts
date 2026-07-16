export interface LocationModel {
  name: string
  country: string
  displayName: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface LocationSuggestion {
  name: string
  country: string
  displayName: string
  latitude: number
  longitude: number
}

export interface StationLocationModel extends LocationModel {
  stationId: string
  stationName: string
}

export interface StationWeatherModel {
  temperature: number
  weatherCode: number
  weatherLabel: string
  isDay: boolean
  windSpeed: number
  humidity: number
}

export interface StationTimeModel {
  localTime: string
  timezone: string
  utcOffset: string
}
