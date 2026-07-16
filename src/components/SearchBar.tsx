import { useState, useCallback, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import type { LocationSuggestion } from '../types'

interface SearchBarProps {
  onSelect: (suggestion: LocationSuggestion) => void
  onSearch: (query: string) => void
  suggestions: LocationSuggestion[]
  loading: boolean
  disabled?: boolean
}

export function SearchBar({ onSelect, onSearch, suggestions, loading, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const suppressSearchRef = useRef(false)

  // Debounced search on query change (unless suppressed by selecting a suggestion)
  useEffect(() => {
    if (disabled || suppressSearchRef.current) {
      if (suppressSearchRef.current) suppressSearchRef.current = false
      return
    }
    const timer = setTimeout(() => {
      onSearch(query)
      if (query.trim()) {
        setIsOpen(true)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, onSearch, disabled])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((suggestion: LocationSuggestion) => {
    suppressSearchRef.current = true
    setIsOpen(false)
    setFocusedIndex(-1)
    setQuery(suggestion.name)
    onSelect(suggestion)
  }, [onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        e.preventDefault()
        handleSelect(suggestions[focusedIndex]!)
      } else if (suggestions.length > 0 && suggestions[0] && isOpen) {
        e.preventDefault()
        handleSelect(suggestions[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }, [suggestions, focusedIndex, isOpen, handleSelect])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    suppressSearchRef.current = false
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleFocus = () => {
    if (suggestions.length > 0 && query.trim() && !suppressSearchRef.current) {
      setIsOpen(true)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl mx-auto"
      role="combobox"
      aria-expanded={isOpen && suggestions.length > 0}
      aria-haspopup="listbox"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-current opacity-50" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search any city, region or country..."
          disabled={disabled}
          aria-label="Search location"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          className="w-full h-14 pl-12 pr-4 bg-[var(--surface)] text-[var(--text)] text-lg font-mono font-bold border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] focus:shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-text)] placeholder:font-normal disabled:opacity-50 transition-all duration-200"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden z-50 max-h-80 overflow-y-auto divide-y-2 divide-black"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
              role="option"
              aria-selected={index === focusedIndex}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                index === focusedIndex ? 'bg-[var(--accent)] text-black font-bold' : 'hover:bg-[var(--accent)] hover:text-black hover:font-bold'
              }`}
            >
              <span className="block font-space text-lg font-bold">{suggestion.name}</span>
              <span className="block font-mono text-sm opacity-80 font-medium">{suggestion.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
