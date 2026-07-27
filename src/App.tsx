import { useCallback, useEffect, useState, useRef } from 'react'
import { AppProvider, useAppState, useAppDispatch } from './context'
import { useLocation, useWeather, useRadio, useTuningTransition, useTV } from './hooks'
import { SearchBar, LocationDisplay, PlaybackControls, RadioDisplay, Footer, Header, LoadingScreen, ErrorDisplay, ServiceTabs, TVDisplay } from './components'
import type { ServiceTab } from './components/ServiceTabs'
import { audioEngine } from './audio/AudioEngine'

function WaveScapeContent() {
  const { activeLocation, searchedLocation, weather, weatherProfile, currentStation, playbackState, stations, theme, sceneState, error, timezone, audioMetrics } = useAppState()
  const dispatch = useAppDispatch()
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [landingComplete, setLandingComplete] = useState(false)
  const [isRadioHovered, setIsRadioHovered] = useState(false)
  const [activeTab, setActiveTab] = useState<ServiceTab>('radio')
  const searchInitRef = useRef(false)
  const previousTab = useRef<ServiceTab>(activeTab)

  const { suggestions, loading: searchLoading, search, clearSuggestions } = useLocation()
  const { weatherLoading } = useWeather()
  const { loadStations, selectStation, togglePlay, nextStation, prevStation } = useRadio()
  const tv = useTV()

  const handleSelectLocation = useCallback(async (suggestion: typeof suggestions[number]) => {
    dispatch({ type: 'SET_SCENE_STATE', payload: 'loading' })
    clearSuggestions()

    const loc = {
      name: suggestion.name,
      country: suggestion.country,
      countryCode: suggestion.countryCode,
      displayName: suggestion.displayName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }

    dispatch({ type: 'SET_SEARCHED_LOCATION', payload: loc })
    dispatch({ type: 'CLEAR_DATA' })

    // Load radio stations
    const stationsResult = await loadStations(loc.latitude, loc.longitude)

    if (stationsResult && stationsResult.length > 0) {
      const station = stationsResult[0]!
      selectStation(station)

      try {
        await audioEngine.play(station.streamUrl, station.id)
      } catch {
        dispatch({ type: 'SET_PLAYBACK_STATE', payload: 'error' })
      }
    }

    // Load TV channels for the country
    if (loc.countryCode) {
      tv.loadTVData(loc.countryCode)
    }

    dispatch({ type: 'SET_SCENE_STATE', payload: 'playing' })
  }, [dispatch, clearSuggestions, loadStations, selectStation, tv])

  const handleStationSelect = useCallback((station: typeof stations[number]) => {
    selectStation(station)
    audioEngine.play(station.streamUrl, station.id)
  }, [selectStation])

  const handleStationPlay = useCallback((station: typeof stations[number]) => {
    selectStation(station)
    if (audioEngine.currentStationId === station.id && playbackState === 'playing') {
      audioEngine.pause()
    } else if (audioEngine.currentStationId === station.id && playbackState === 'paused') {
      audioEngine.resume()
    } else {
      audioEngine.play(station.streamUrl, station.id)
    }
  }, [selectStation, playbackState])

  const handleSearch = useCallback((query: string) => {
    search(query)
  }, [search])

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value)
    audioEngine.setVolume(value)
  }, [])

  const handleToggleMute = useCallback(() => {
    audioEngine.toggleMute()
    setMuted((m) => !m)
  }, [])

  const isAudioPlaying = playbackState === 'playing'
  const isConnecting = playbackState === 'loading' || playbackState === 'buffering'
  const { isVisualConnecting, isVisualConnected } = useTuningTransition(
    currentStation?.id,
    isConnecting,
    isAudioPlaying
  )

  useEffect(() => {
    if (!landingComplete && !searchInitRef.current) {
      searchInitRef.current = true
      setTimeout(() => setLandingComplete(true), 1000)
    }
  }, [landingComplete])

  useEffect(() => {
    if (activeTab !== previousTab.current) {
      if (activeTab === 'tv' && playbackState === 'playing') {
        audioEngine.pause()
      }
      previousTab.current = activeTab
    }
  }, [activeTab, playbackState])

  if (!landingComplete) {
    return <LoadingScreen message="Waking up..." />
  }

  const isLoading = sceneState === 'loading'
  const soundEnergy = isAudioPlaying && audioMetrics ? (audioMetrics.rms * 0.55 + audioMetrics.bass * 0.45) : 0
  const hoverExtra = isRadioHovered ? 0.06 : 0
  const radioScale = 1 + hoverExtra + Math.min(soundEnergy * 0.4, 0.4)

  return (
    <div
      className="relative min-h-screen flex flex-col transition-colors duration-400"
      style={{
        '--background': theme?.colors.background ?? '#FFF8E7',
        '--surface': theme?.colors.surface ?? '#FFFFFF',
        '--text': theme?.colors.text ?? '#000000',
        '--muted-text': theme?.colors.mutedText ?? '#4A4A4A',
        '--accent': theme?.colors.accent ?? '#FFDE59',
        '--border': '#000000',
      } as React.CSSProperties}
    >
      {/* Decorative Neobrutalist Geometric Accents (No Text Boxes) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
        {/* Top-left shape cluster */}
        <div className="absolute top-24 left-6 md:left-12 opacity-85 hidden md:flex items-center gap-3">
          <div className="w-12 h-12 border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-xl font-black animate-float">
            ★
          </div>
          <div className="w-10 h-10 border-3 border-black bg-[var(--surface)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-mono text-lg font-black">
            ■
          </div>
          <div className="w-10 h-10 border-3 border-black bg-[var(--surface)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center font-mono text-lg font-black">
            ●
          </div>
        </div>

        {/* Top-right rotated diamond & crosshairs */}
        <div className="absolute top-24 right-6 md:right-12 opacity-80 hidden md:flex flex-col items-end gap-3">
          <div className="w-14 h-14 border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center font-space text-2xl font-black transform rotate-12">
            ◆
          </div>
          <div className="font-mono font-bold text-2xl text-[var(--text)] tracking-widest">
            + + +
          </div>
        </div>

        {/* Mid-upper left wireframe ring & center block */}
        <div className="absolute top-[28%] left-8 md:left-16 opacity-75 hidden lg:flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-black opacity-35 animate-spin" style={{ animationDuration: '30s' }} />
          <div className="w-12 h-12 border-3 border-black bg-black text-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-2xl font-black">
            +
          </div>
        </div>

        {/* Mid-upper right vertical totem */}
        <div className="absolute top-[30%] right-8 md:right-16 opacity-85 hidden lg:flex flex-col gap-3 items-center animate-float">
          <div className="w-12 h-12 border-3 border-black bg-[var(--surface)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center font-space text-xl font-black">
            ●
          </div>
          <div className="w-14 h-14 border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-2xl font-black">
            ✦
          </div>
          <div className="w-12 h-12 border-3 border-black bg-[var(--surface)] shadow-[3px_3px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-xl font-black">
            ▲
          </div>
        </div>

        {/* Mid-lower left tilted checker grid block */}
        <div className="absolute top-[60%] left-8 md:left-20 opacity-80 hidden xl:grid grid-cols-2 gap-2 p-2.5 border-3 border-black bg-[var(--surface)] shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-xl transform -rotate-6">
          <div className="w-7 h-7 rounded border-2 border-black bg-[var(--accent)]" />
          <div className="w-7 h-7 rounded border-2 border-black bg-black" />
          <div className="w-7 h-7 rounded border-2 border-black bg-black" />
          <div className="w-7 h-7 rounded border-2 border-black bg-[var(--accent)]" />
        </div>

        {/* Mid-lower right double target circle */}
        <div className="absolute top-[62%] right-10 md:right-20 opacity-85 hidden xl:flex items-center justify-center w-16 h-16 rounded-full border-4 border-black bg-[var(--surface)] shadow-[5px_5px_0px_rgba(0,0,0,1)] animate-pulse">
          <div className="w-7 h-7 rounded-full border-3 border-black bg-[var(--accent)] flex items-center justify-center font-black text-xs">
            ●
          </div>
        </div>

        {/* Bottom-left shape row */}
        <div className="absolute bottom-24 left-8 md:left-14 opacity-80 hidden md:flex items-center gap-3">
          <div className="w-12 h-12 border-3 border-black bg-[var(--surface)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-mono text-2xl font-black">
            +
          </div>
          <div className="w-12 h-12 border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center font-space text-xl font-black">
            ★
          </div>
          <div className="w-12 h-12 rounded-full border-3 border-black bg-[var(--surface)] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center font-mono text-xl font-black">
            ◎
          </div>
        </div>

        {/* Bottom-right circle bar */}
        <div className="absolute bottom-24 right-8 md:right-16 opacity-80 hidden md:flex items-center gap-3 px-5 py-2.5 border-3 border-black bg-[var(--surface)] shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-full">
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[var(--accent)]" />
          <span className="w-4 h-4 rounded-full border-2 border-black bg-black" />
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[var(--accent)]" />
          <span className="w-4 h-4 rounded-full border-2 border-black bg-black" />
        </div>

        {/* Mobile / Tablet subtle side accents */}
        <div className="absolute top-1/3 left-3 opacity-60 md:hidden font-mono font-black text-2xl text-[var(--accent)]">
          ★
        </div>
        <div className="absolute top-2/3 right-3 opacity-60 md:hidden font-mono font-black text-2xl text-black">
          ✦
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header playbackState={playbackState} isVisualConnecting={isVisualConnecting} isVisualConnected={isVisualConnected} />

        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 pt-6 md:pt-10 gap-8 md:gap-12 pb-12">
          <div className="w-full max-w-2xl mt-2 md:mt-4">
            <SearchBar
              onSelect={handleSelectLocation}
              onSearch={handleSearch}
              suggestions={suggestions}
              loading={searchLoading}
              disabled={isLoading}
            />
            <ServiceTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {activeLocation && (
            <LocationDisplay location={activeLocation} />
          )}

          {/* === RADIO TAB CONTENT === */}
          <div className={`w-full flex flex-col items-center gap-8 md:gap-12 ${activeTab === 'radio' ? 'flex' : 'hidden'}`}>
            <>
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-36 h-36 md:w-44 md:h-44 my-2 animate-float flex items-center justify-center cursor-pointer transition-all duration-500 ${isVisualConnecting ? 'animate-pulse' : ''}`}
                  onMouseEnter={() => setIsRadioHovered(true)}
                  onMouseLeave={() => setIsRadioHovered(false)}
                  onClick={() => {
                    if (currentStation) togglePlay()
                  }}
                  title={currentStation ? (isVisualConnecting ? 'Tuning stream... (Click to cancel)' : isAudioPlaying ? 'Click to Pause' : 'Click to Play') : 'Select a station below'}
                >
                  {(isVisualConnecting || isVisualConnected) && (
                    <div
                      className={`absolute inset-0 rounded-full border-4 border-dashed border-black pointer-events-none transition-all duration-700 ease-out ${
                        isVisualConnected
                          ? 'opacity-0 scale-125'
                          : 'opacity-60 scale-100 animate-spin'
                      }`}
                      style={{ animationDuration: '6s' }}
                    />
                  )}
                  <img
                    src="/icons/radio.svg"
                    alt="Retro Radio"
                    style={{
                      transform: `scale(${radioScale})`,
                      transition: isAudioPlaying ? 'transform 60ms ease-out' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    className="w-full h-full drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] select-none"
                  />
                </div>
                {(isVisualConnecting || isVisualConnected) && currentStation && (
                  <div
                    className={`mt-3 px-4 py-2 border-3 border-black rounded-lg font-mono text-xs font-bold flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                      isVisualConnected
                        ? 'bg-emerald-400 text-black'
                        : 'bg-[var(--accent)] text-black animate-pulse'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 border border-black rounded-full ${
                        isVisualConnected ? 'bg-black' : 'bg-black animate-ping'
                      }`}
                    />
                    <span>{isVisualConnected ? '✦ SIGNAL LOCKED · LIVE' : 'TUNING TO LIVE STREAM...'}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                <RadioDisplay
                  station={currentStation}
                  playbackState={playbackState}
                  weather={weather}
                  weatherProfile={weatherProfile}
                  timezone={timezone || undefined}
                  onStationSelect={handleStationSelect}
                  onStationPlay={handleStationPlay}
                  stations={stations}
                  searchedLocation={searchedLocation}
                  isVisualConnecting={isVisualConnecting}
                  isVisualConnected={isVisualConnected}
                />

                {stations.length > 0 && (
                  <PlaybackControls
                    playbackState={playbackState}
                    onTogglePlay={togglePlay}
                    onNext={nextStation}
                    onPrev={prevStation}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={handleToggleMute}
                    volume={volume}
                    muted={muted}
                    disabled={stations.length === 0}
                    isVisualConnecting={isVisualConnecting}
                  />
                )}

                {error && (
                  <ErrorDisplay
                    message={error.friendlyMessage}
                    onRetry={error.retry}
                  />
                )}
              </div>

              {!searchedLocation && (
                <div className="text-center mt-8">
                  <p className="font-mono text-lg text-[var(--muted-text)]">
                    Search a city to discover nearby radio stations and their atmosphere
                  </p>
                </div>
              )}

              {searchedLocation && stations.length === 0 && !weatherLoading && (
                <ErrorDisplay
                  message="No radio stations found for this location."
                  actionLabel="Search Again"
                  onAction={() => dispatch({ type: 'SET_SCENE_STATE', payload: 'landing' })}
                />
              )}
            </>
          </div>

          {/* === TV TAB CONTENT === */}
          <div className={`w-full flex flex-col items-center ${activeTab === 'tv' ? 'flex' : 'hidden'}`}>
            <TVDisplay
              channels={tv.channels}
              filteredChannels={tv.filteredChannels}
              categories={tv.categories}
              selectedCategory={tv.selectedCategory}
              onCategorySelect={tv.setSelectedCategory}
              logoMap={tv.logoMap}
              streamMap={tv.streamMap}
              loading={tv.loading}
              error={tv.error}
              countryName={tv.countryName}
              countryFlag={tv.countryFlag}
              hasSearched={!!searchedLocation}
              timezone={timezone}
              isActive={activeTab === 'tv'}
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <WaveScapeContent />
    </AppProvider>
  )
}
