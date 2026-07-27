import { API_BASE_URLS } from '../constants'
import { fetchJson } from './api'
import type { TVChannel, TVCategory, TVStream, TVLogo, TVCountry } from '../types'

// In-memory caches to avoid refetching large datasets
let channelsCache: TVChannel[] | null = null
let categoriesCache: TVCategory[] | null = null
let streamsCache: TVStream[] | null = null
let logosCache: TVLogo[] | null = null
let countriesCache: TVCountry[] | null = null

export async function fetchTVChannels(signal?: AbortSignal): Promise<TVChannel[]> {
  if (channelsCache) return channelsCache
  const data = await fetchJson<TVChannel[]>(
    `${API_BASE_URLS.iptvOrg}/channels.json`,
    { signal, timeout: 30000 }
  )
  channelsCache = data
  return data
}

export async function fetchTVCategories(signal?: AbortSignal): Promise<TVCategory[]> {
  if (categoriesCache) return categoriesCache
  const data = await fetchJson<TVCategory[]>(
    `${API_BASE_URLS.iptvOrg}/categories.json`,
    { signal }
  )
  categoriesCache = data
  return data
}

export async function fetchTVStreams(signal?: AbortSignal): Promise<TVStream[]> {
  if (streamsCache) return streamsCache
  const data = await fetchJson<TVStream[]>(
    `${API_BASE_URLS.iptvOrg}/streams.json`,
    { signal, timeout: 30000 }
  )
  streamsCache = data
  return data
}

export async function fetchTVLogos(signal?: AbortSignal): Promise<TVLogo[]> {
  if (logosCache) return logosCache
  const data = await fetchJson<TVLogo[]>(
    `${API_BASE_URLS.iptvOrg}/logos.json`,
    { signal, timeout: 30000 }
  )
  logosCache = data
  return data
}

export async function fetchTVCountries(signal?: AbortSignal): Promise<TVCountry[]> {
  if (countriesCache) return countriesCache
  const data = await fetchJson<TVCountry[]>(
    `${API_BASE_URLS.iptvOrg}/countries.json`,
    { signal }
  )
  countriesCache = data
  return data
}

/**
 * Get all active (non-NSFW, non-closed) channels for a given country code.
 */
export function getChannelsByCountry(countryCode: string, channels: TVChannel[]): TVChannel[] {
  const code = countryCode.toUpperCase()
  return channels.filter(
    (ch) => ch.country === code && !ch.is_nsfw && !ch.closed
  )
}

/**
 * Filter channels by category ID.
 */
export function getChannelsByCategory(categoryId: string, channels: TVChannel[]): TVChannel[] {
  return channels.filter((ch) => ch.categories.includes(categoryId))
}

/**
 * Find the best available stream for a channel (prefer higher quality).
 */
export function getStreamForChannel(channelId: string, streams: TVStream[]): TVStream | null {
  const channelStreams = streams.filter((s) => s.channel === channelId)
  if (channelStreams.length === 0) return null

  // Sort by quality: prefer numbered quality like "1080p" > "720p" > "480p" > others
  const qualityOrder = (q: string | null): number => {
    if (!q) return 0
    const match = q.match(/^(\d+)p$/i)
    return match ? parseInt(match[1]!, 10) : 1
  }

  channelStreams.sort((a, b) => qualityOrder(b.quality) - qualityOrder(a.quality))
  return channelStreams[0]!
}

/**
 * Find the best logo for a channel (prefer in_use SVG/PNG logos).
 */
export function getLogoForChannel(channelId: string, logos: TVLogo[]): TVLogo | null {
  const channelLogos = logos.filter((l) => l.channel === channelId)
  if (channelLogos.length === 0) return null

  // Prefer in_use logos, then by format preference
  const formatOrder: Record<string, number> = { SVG: 4, PNG: 3, WebP: 2, JPEG: 1 }
  channelLogos.sort((a, b) => {
    if (a.in_use !== b.in_use) return a.in_use ? -1 : 1
    return (formatOrder[b.format ?? ''] ?? 0) - (formatOrder[a.format ?? ''] ?? 0)
  })

  return channelLogos[0]!
}

/**
 * Resolve logo URLs for a set of channels using the logos dataset.
 * Returns a Map of channelId -> logo URL.
 */
export function resolveLogosForChannels(
  channels: TVChannel[],
  logos: TVLogo[]
): Map<string, string> {
  const logoMap = new Map<string, string>()
  for (const channel of channels) {
    const logo = getLogoForChannel(channel.id, logos)
    if (logo) {
      logoMap.set(channel.id, logo.url)
    }
  }
  return logoMap
}

/**
 * Resolve stream availability for a set of channels.
 * Returns a Map of channelId -> stream URL.
 */
export function resolveStreamsForChannels(
  channels: TVChannel[],
  streams: TVStream[]
): Map<string, TVStream> {
  const streamMap = new Map<string, TVStream>()
  for (const channel of channels) {
    const stream = getStreamForChannel(channel.id, streams)
    if (stream) {
      streamMap.set(channel.id, stream)
    }
  }
  return streamMap
}
