import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Maximize, Play, Pause, X, Radio, AlertTriangle } from 'lucide-react'
import Hls from 'hls.js'
import type { TVChannel, TVStream } from '../types'

interface TVPlayerProps {
  channel: TVChannel | null
  stream: TVStream | null
  logoUrl?: string
  onClose?: () => void
  isActive?: boolean
}

export function TVPlayer({ channel, stream, logoUrl, onClose, isActive = true }: TVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize and attach video stream (HLS or native)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream?.url) return

    setLoading(true)
    setError(null)
    setIsPlaying(false)

    // Clean up previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const streamUrl = stream.url

    // Check HLS support via Hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })

      hlsRef.current = hls
      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false)
        video.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(false)
        })
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Stream network error / Geo-blocked')
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              setError('Stream unavailable or format unsupported')
              hls.destroy()
              break
          }
          setLoading(false)
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari / iOS)
      video.src = streamUrl
      video.addEventListener('loadedmetadata', () => {
        setLoading(false)
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      })
      video.addEventListener('error', () => {
        setError('Failed to play stream')
        setLoading(false)
      })
    } else {
      // Direct stream fallback
      video.src = streamUrl
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [stream])

  useEffect(() => {
    if (!isActive && isPlaying) {
      const video = videoRef.current
      if (video && !video.paused) {
        video.pause()
        setIsPlaying(false)
      }
    }
  }, [isActive, isPlaying])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (video) {
      video.volume = val
      video.muted = val === 0
      setIsMuted(val === 0)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }, [])

  if (!channel || !stream) {
    return null
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center bg-[var(--surface)] border-4 border-black rounded-xl p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-8">
      {/* Header bar */}
      <div className="w-full flex items-center justify-between gap-4 mb-4 pb-3 border-b-3 border-black">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={channel.name}
              className="w-10 h-10 rounded border-2 border-black object-contain p-0.5 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          ) : (
            <div className="w-10 h-10 rounded border-2 border-black bg-[var(--accent)] shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center font-space font-bold">
              📺
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-space text-lg font-bold text-[var(--text)] truncate">
              {channel.name}
            </h2>
            <p className="font-mono text-xs font-semibold text-[var(--muted-text)] truncate">
              {[channel.network, stream.quality || 'LIVE STREAM'].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white font-mono font-bold text-xs border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            LIVE TV
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-[var(--surface)] hover:bg-[var(--accent)] border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Close Player"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          )}
        </div>
      </div>

      {/* RETRO PIXEL TV FRAME CONTAINER */}
      <div className="relative w-full aspect-[4/3] max-w-[640px] select-none bg-[var(--surface)] overflow-hidden rounded-lg">
        {/* SCREEN AREA (Positioned precisely within the TV frame cutout) */}
        <div
          className="absolute z-10 overflow-hidden bg-black flex items-center justify-center rounded-[3px]"
          style={{
            left: '13.5%',
            top: '27.33%',
            width: '59%',
            height: '55.33%',
          }}
        >
          {/* HTML5 VIDEO PLAYER SCALED TO FIT CRT SCREEN PERFECTLY */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            playsInline
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* RETRO LOADING SCANLINES OVERLAY */}
          {loading && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-30">
              <div className="w-10 h-10 border-4 border-dashed border-[var(--accent)] rounded-full animate-spin mb-2" />
              <p className="font-mono text-xs font-bold text-[var(--accent)] animate-pulse">
                TUNING FREQUENCY...
              </p>
            </div>
          )}

          {/* RETRO ERROR OVERLAY */}
          {error && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 text-center z-30 space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
              <p className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                {error}
              </p>
              <button
                onClick={() => window.open(stream.url, '_blank')}
                className="px-3 py-1 bg-[var(--accent)] text-black font-mono font-bold text-[10px] border border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                OPEN EXTERNAL STREAM
              </button>
            </div>
          )}

          {/* CRT SCANLINES & GLASS GLARE OVERLAY */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
              backgroundSize: '100% 3px, 6px 100%',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 z-25" />
        </div>

        {/* SVG RETRO TV FRAME OVERLAY (Front Cabinet & Controls) */}
        <img
          src="/icons/tv-frame.svg"
          alt="Retro TV Frame"
          className="w-full h-full object-contain pointer-events-none z-20 relative drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {/* VIDEO CONTROLS BAR (NEOBRUTALIST STYLE) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t-3 border-black bg-[var(--surface)] px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={loading || !!error}
            className="p-2.5 bg-[var(--accent)] text-black border-2 border-black rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 bg-[var(--surface)] border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)]/30 transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 md:w-28 accent-[var(--accent)] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[var(--surface)] border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)]/30 transition-all"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
