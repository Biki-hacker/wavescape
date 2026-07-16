export const API_TIMEOUT = 8000
export const WEATHER_REFRESH_INTERVAL = 600_000
export const DEBOUNCE_DELAY = 300
export const MAX_RETRIES = 1

export const API_BASE_URLS = {
  nominatim: 'https://nominatim.openstreetmap.org',
  openMeteo: 'https://api.open-meteo.com/v1',
  worldTime: 'https://worldtimeapi.org/api',
  timeApi: 'https://timeapi.io/api/Time/current',
  radioBrowser: 'https://de1.api.radio-browser.info/json',
} as const
