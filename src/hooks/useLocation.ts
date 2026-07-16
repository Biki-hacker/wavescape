import { useState, useCallback, useRef } from 'react'
import type { LocationSuggestion, LocationModel } from '../types'
import { searchLocations, resolveLocation } from '../services/location.service'

interface UseLocationReturn {
  suggestions: LocationSuggestion[]
  loading: boolean
  search: (query: string) => Promise<void>
  resolve: (query: string) => Promise<LocationModel | null>
  clearSuggestions: () => void
}

export function useLocation(): UseLocationReturn {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const lastQueryRef = useRef<string>('')

  const search = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort()
    if (!query.trim() || query === lastQueryRef.current) return

    lastQueryRef.current = query
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const results = await searchLocations(query, abortRef.current.signal)
      setSuggestions(results)
    } catch {
      if (!abortRef.current?.signal.aborted) {
        setSuggestions([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const resolve = useCallback(async (query: string): Promise<LocationModel | null> => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const result = await resolveLocation(query, abortRef.current.signal)
      return result
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  return { suggestions, loading, search, resolve, clearSuggestions }
}
