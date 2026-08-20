import { useState, useEffect } from 'react'
import { Tv, Loader2, AlertCircle } from 'lucide-react'
import type { TVChannel, TVCategory, TVStream } from '../types'
import { TVCategoryFilter } from './TVCategoryFilter'
import { TVChannelCard } from './TVChannelCard'
import { TVPlayer } from './TVPlayer'

interface TVDisplayProps {
  channels: TVChannel[]
  filteredChannels: TVChannel[]
  categories: TVCategory[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  logoMap: Map<string, string>
  streamMap: Map<string, TVStream>
  loading: boolean
  error: string | null
  countryName: string | null
  countryFlag: string | null
  hasSearched: boolean
  timezone: string | null
  isActive?: boolean
}

const PAGE_SIZE = 24

export function TVDisplay({
  filteredChannels,
  categories,
  selectedCategory,
  onCategorySelect,
  logoMap,
  streamMap,
  loading,
  error,
  countryName,
  countryFlag,
  hasSearched,
  timezone,
  isActive = true,
}: TVDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [activeChannel, setActiveChannel] = useState<TVChannel | null>(null)
  const [activeStream, setActiveStream] = useState<TVStream | null>(null)
  const [showOnlyStreaming, setShowOnlyStreaming] = useState(false)

  const finalFilteredChannels = showOnlyStreaming
    ? filteredChannels.filter((channel) => streamMap.has(channel.id))
    : filteredChannels

  const visibleChannels = finalFilteredChannels.slice(0, visibleCount)
  const hasMore = visibleCount < finalFilteredChannels.length

  const handlePlayChannel = (channel: TVChannel, stream: TVStream) => {
    setActiveChannel(channel)
    setActiveStream(stream)
    // Smooth scroll up to player when selected
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleClosePlayer = () => {
    setActiveChannel(null)
    setActiveStream(null)
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const handleToggleStreaming = (checked: boolean) => {
    setShowOnlyStreaming(checked)
    setVisibleCount(PAGE_SIZE) // Reset pagination
  }

  // Clear player when a new search begins
  useEffect(() => {
    if (loading) {
      setActiveChannel(null)
      setActiveStream(null)
    }
  }, [loading])

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 border-4 border-black rounded-lg bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
        </div>
        <p className="font-mono font-bold text-sm text-[var(--muted-text)] animate-pulse">
          Loading TV channels...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 border-4 border-black rounded-lg bg-red-100 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <p className="font-mono font-bold text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // Empty / pre-search state
  if (!hasSearched) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-20 h-20 border-4 border-black rounded-xl bg-[var(--surface)] shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center justify-center">
          <Tv className="w-10 h-10 text-[var(--muted-text)]" />
        </div>
        <p className="font-mono text-lg text-[var(--muted-text)] text-center max-w-md">
          Search a city to discover TV channels broadcasting in that country
        </p>
      </div>
    )
  }

  // No channels found
  if (finalFilteredChannels.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Country header with controls even when empty */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] border-3 border-black rounded-lg px-5 py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            {countryFlag && <span className="text-3xl">{countryFlag}</span>}
            <div>
              <h2 className="font-space text-lg font-bold text-[var(--text)]">
                {countryName} TV Channels
              </h2>
              <p className="font-mono text-xs font-medium text-[var(--muted-text)]">
                0 channels available
              </p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className={`relative w-12 h-6 border-2 border-black rounded-full transition-colors duration-200 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
              showOnlyStreaming ? 'bg-[var(--accent)]' : 'bg-gray-200'
            }`}>
              <input
                type="checkbox"
                className="absolute opacity-0 cursor-pointer w-full h-full z-10"
                checked={showOnlyStreaming}
                onChange={(e) => handleToggleStreaming(e.target.checked)}
              />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full border-2 border-black transition-transform duration-200 ${
                showOnlyStreaming ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)] select-none">
              Currently Streaming
            </span>
          </label>
        </div>

        {/* Category filter still shown if categories exist */}
        {categories.length > 0 && (
          <TVCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={onCategorySelect}
          />
        )}
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 border-4 border-black rounded-lg bg-[var(--surface)] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <Tv className="w-8 h-8 text-[var(--muted-text)]" />
          </div>
          <p className="font-mono font-bold text-sm text-[var(--muted-text)] text-center">
            {showOnlyStreaming && filteredChannels.length > 0
              ? 'No streaming channels found for this category'
              : selectedCategory
              ? 'No channels found in this category'
              : 'No TV channels found for this country'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* INLINE TV PLAYER WITH RETRO PIXEL TV FRAME */}
      {activeChannel && activeStream && (
        <TVPlayer
          channel={activeChannel}
          stream={activeStream}
          logoUrl={logoMap.get(activeChannel.id)}
          onClose={handleClosePlayer}
          isActive={isActive}
        />
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] border-3 border-black rounded-lg px-5 py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          {countryFlag && (
            <span className="text-3xl">{countryFlag}</span>
          )}
          <div>
            <h2 className="font-space text-lg font-bold text-[var(--text)]">
              {countryName} TV Channels
            </h2>
            <p className="font-mono text-xs font-medium text-[var(--muted-text)]">
              {finalFilteredChannels.length} channel{finalFilteredChannels.length !== 1 ? 's' : ''}
              {selectedCategory ? ` in ${selectedCategory}` : ' available'}
            </p>
          </div>
        </div>

        {/* Toggle for streaming only */}
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <div className={`relative w-12 h-6 border-2 border-black rounded-full transition-colors duration-200 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
            showOnlyStreaming ? 'bg-[var(--accent)]' : 'bg-gray-200'
          }`}>
            <input
              type="checkbox"
              className="absolute opacity-0 cursor-pointer w-full h-full z-10"
              checked={showOnlyStreaming}
              onChange={(e) => handleToggleStreaming(e.target.checked)}
            />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full border-2 border-black transition-transform duration-200 ${
              showOnlyStreaming ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)] select-none">
            Currently Streaming
          </span>
        </label>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <TVCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(cat) => {
            onCategorySelect(cat)
            setVisibleCount(PAGE_SIZE) // Reset pagination on filter change
          }}
        />
      )}

      {/* Channel grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleChannels.map((channel) => {
          const stream = streamMap.get(channel.id)
          return (
            <TVChannelCard
              key={channel.id}
              channel={channel}
              logoUrl={logoMap.get(channel.id)}
              stream={stream}
              timezone={timezone || undefined}
              onPlay={() => {
                if (stream) {
                  handlePlayChannel(channel, stream)
                }
              }}
            />
          )
        })}
      </div>

      {/* Show more button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleShowMore}
            className="px-8 py-3 font-space font-bold uppercase text-sm text-[var(--text)] bg-[var(--surface)] border-3 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)] hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
          >
            Show More ({finalFilteredChannels.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
