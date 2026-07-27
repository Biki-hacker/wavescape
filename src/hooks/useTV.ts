import { useState, useCallback, useRef } from 'react'
import type { TVChannel, TVCategory, TVStream, TVCountry } from '../types'
import {
  fetchTVChannels,
  fetchTVCategories,
  fetchTVStreams,
  fetchTVLogos,
  fetchTVCountries,
  getChannelsByCountry,
  getChannelsByCategory,
  resolveLogosForChannels,
  resolveStreamsForChannels,
} from '../services/tv.service'

interface UseTVReturn {
  channels: TVChannel[]
  filteredChannels: TVChannel[]
  categories: TVCategory[]
  countries: TVCountry[]
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  logoMap: Map<string, string>
  streamMap: Map<string, TVStream>
  loading: boolean
  error: string | null
  countryName: string | null
  countryFlag: string | null
  loadTVData: (countryCode: string) => Promise<void>
}

export function useTV(): UseTVReturn {
  const [channels, setChannels] = useState<TVChannel[]>([])
  const [categories, setCategories] = useState<TVCategory[]>([])
  const [countries, setCountries] = useState<TVCountry[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [logoMap, setLogoMap] = useState<Map<string, string>>(new Map())
  const [streamMap, setStreamMap] = useState<Map<string, TVStream>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryName, setCountryName] = useState<string | null>(null)
  const [countryFlag, setCountryFlag] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadTVData = useCallback(async (countryCode: string) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setLoading(true)
    setError(null)
    setSelectedCategory(null)
    setChannels([])
    setLogoMap(new Map())
    setStreamMap(new Map())

    try {
      // Load channels, categories, and countries in parallel
      const [allChannels, allCategories, allCountries] = await Promise.all([
        fetchTVChannels(signal),
        fetchTVCategories(signal),
        fetchTVCountries(signal),
      ])

      if (signal.aborted) return

      const countryChannels = getChannelsByCountry(countryCode, allChannels)

      // Find country info
      const country = allCountries.find((c) => c.code === countryCode.toUpperCase())
      setCountryName(country?.name ?? countryCode)
      setCountryFlag(country?.flag ?? null)

      // Filter categories to only those present in the country's channels
      const usedCategoryIds = new Set(countryChannels.flatMap((ch) => ch.categories))
      const relevantCategories = allCategories.filter((cat) => usedCategoryIds.has(cat.id))

      setChannels(countryChannels)
      setCategories(relevantCategories)
      setCountries(allCountries)

      // Load logos and streams in parallel (these are larger datasets, load after initial render)
      const [allLogos, allStreams] = await Promise.all([
        fetchTVLogos(signal),
        fetchTVStreams(signal),
      ])

      if (signal.aborted) return

      const logos = resolveLogosForChannels(countryChannels, allLogos)
      const streams = resolveStreamsForChannels(countryChannels, allStreams)

      setLogoMap(logos)
      setStreamMap(streams)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load TV channels. Please try again.')
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  // Filter channels by selected category
  const filteredChannels = selectedCategory
    ? getChannelsByCategory(selectedCategory, channels)
    : channels

  return {
    channels,
    filteredChannels,
    categories,
    countries,
    selectedCategory,
    setSelectedCategory,
    logoMap,
    streamMap,
    loading,
    error,
    countryName,
    countryFlag,
    loadTVData,
  }
}
