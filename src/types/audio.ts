export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'

export interface AudioMetrics {
  volume: number
  peak: number
  rms: number
  bass: number
  mid: number
  treble: number
  dominantFrequency: number
  spectrum: Float32Array
  waveform: Float32Array
}

export interface StationModel {
  id: string
  name: string
  streamUrl: string
  country: string
  state?: string
  city?: string
  codec: string
  bitrate: number
  homepage?: string
  language?: string
  tags?: string[]
  favicon?: string
  geo_lat?: number
  geo_long?: number
  distance?: number
}
