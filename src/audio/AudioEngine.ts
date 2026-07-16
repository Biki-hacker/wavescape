import type { AudioMetrics, PlaybackState } from '../types'
import { APP_CONFIG } from '../constants'

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private audioElement: HTMLAudioElement | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private analyserNode: AnalyserNode | null = null
  private gainNode: GainNode | null = null

  private _state: PlaybackState = 'idle'
  private _volume: number = 0.8
  private _muted: boolean = false
  private _currentStationId: string | null = null
  private currentPlayId: number = 0

  private frequencyData: Uint8Array
  private waveformData: Uint8Array
  private metrics: AudioMetrics

  private animationId: number | null = null
  private listeners: Set<(metrics: AudioMetrics) => void> = new Set()
  private stateListeners: Set<(state: PlaybackState) => void> = new Set()

  constructor() {
    const bins = APP_CONFIG.fftSize / 2
    this.frequencyData = new Uint8Array(bins) as Uint8Array
    this.waveformData = new Uint8Array(APP_CONFIG.fftSize) as Uint8Array
    this.metrics = this.createEmptyMetrics()
  }

  get state(): PlaybackState {
    return this._state
  }

  get volume(): number {
    return this._volume
  }

  get muted(): boolean {
    return this._muted
  }

  get currentStationId(): string | null {
    return this._currentStationId
  }

  async init(): Promise<void> {
    if (this.audioContext) return

    this.audioContext = new AudioContext()
    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = this._volume
    this.gainNode.connect(this.audioContext.destination)

    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = APP_CONFIG.fftSize
    this.analyserNode.smoothingTimeConstant = APP_CONFIG.smoothingConstant
    this.analyserNode.connect(this.gainNode)
  }

  private cleanupNodes(): void {
    this.stopAnalysis()

    if (this.audioElement) {
      const el = this.audioElement
      this.audioElement = null
      el.pause()
      el.removeAttribute('src')
      el.load()
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect()
      } catch {
        // Ignore if already disconnected
      }
      this.sourceNode = null
    }
  }

  async play(streamUrl: string, stationId: string): Promise<void> {
    const playId = ++this.currentPlayId

    await this.init()

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }

    if (playId !== this.currentPlayId) return

    if (this.gainNode && this.audioContext && this._state === 'playing') {
      const now = this.audioContext.currentTime
      this.gainNode.gain.cancelScheduledValues(now)
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.linearRampToValueAtTime(0, now + 0.04)
      await new Promise((resolve) => setTimeout(resolve, 45))
    }

    if (playId !== this.currentPlayId) return

    this.cleanupNodes()

    this._currentStationId = stationId
    this.setState('loading')

    try {
      const audio = new Audio(streamUrl)
      this.audioElement = audio
      audio.crossOrigin = 'anonymous'
      audio.preload = 'none'

      const source = this.audioContext!.createMediaElementSource(audio)
      this.sourceNode = source
      source.connect(this.analyserNode!)

      audio.addEventListener('canplay', () => {
        if (playId !== this.currentPlayId || this.audioElement !== audio) return
        if (this.gainNode && this.audioContext) {
          const now = this.audioContext.currentTime
          const targetVolume = this._muted ? 0 : this._volume
          this.gainNode.gain.cancelScheduledValues(now)
          this.gainNode.gain.setValueAtTime(0, now)
          this.gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.3)
        }
        this.setState('playing')
        this.startAnalysis()
      })

      audio.addEventListener('waiting', () => {
        if (playId !== this.currentPlayId || this.audioElement !== audio) return
        this.setState('buffering')
      })

      audio.addEventListener('error', () => {
        if (playId !== this.currentPlayId || this.audioElement !== audio) return
        this.setState('error')
      })

      audio.addEventListener('ended', () => {
        if (playId !== this.currentPlayId || this.audioElement !== audio) return
        this.setState('ended')
      })

      await audio.play()
    } catch {
      if (playId !== this.currentPlayId) return
      this.setState('error')
    }
  }

  pause(): void {
    if (this.audioElement && this._state === 'playing') {
      this.audioElement.pause()
      this.setState('paused')
      this.stopAnalysis()
    }
  }

  resume(): void {
    if (this.audioElement && this._state === 'paused') {
      this.audioElement.play()
      this.setState('playing')
      this.startAnalysis()
    }
  }

  stop(): void {
    this.currentPlayId++
    this.cleanupNodes()
    this._currentStationId = null
    this.setState('idle')
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value))
    if (this.gainNode) {
      this.gainNode.gain.value = this._muted ? 0 : this._volume
    }
  }

  toggleMute(): void {
    this._muted = !this._muted
    if (this.gainNode) {
      this.gainNode.gain.value = this._muted ? 0 : this._volume
    }
  }

  subscribe(callback: (metrics: AudioMetrics) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  onStateChange(callback: (state: PlaybackState) => void): () => void {
    this.stateListeners.add(callback)
    return () => this.stateListeners.delete(callback)
  }

  dispose(): void {
    this.stop()
    if (this.gainNode) this.gainNode.disconnect()
    if (this.analyserNode) this.analyserNode.disconnect()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.listeners.clear()
    this.stateListeners.clear()
  }

  private startAnalysis(): void {
    const analyse = () => {
      if (!this.analyserNode) return

      this.analyserNode.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>)
      this.analyserNode.getByteTimeDomainData(this.waveformData as Uint8Array<ArrayBuffer>)

      this.updateMetrics()
      this.notify()

      this.animationId = requestAnimationFrame(analyse)
    }

    this.animationId = requestAnimationFrame(analyse)
  }

  private stopAnalysis(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private updateMetrics(): void {
    const data = this.frequencyData
    const len = data.length
    if (len === 0) return

    let sum = 0
    let bassSum = 0
    let midSum = 0
    let trebleSum = 0
    let peak = 0

    const bassEnd = Math.floor(len * 0.1)
    const midEnd = Math.floor(len * 0.5)

    for (let i = 0; i < len; i++) {
      const val = data[i]!
      sum += val
      if (val > peak) peak = val
      if (i < bassEnd) bassSum += val
      else if (i < midEnd) midSum += val
      else trebleSum += val
    }

    const avg = sum / len
    const bassCount = bassEnd
    const midCount = midEnd - bassEnd
    const trebleCount = len - midEnd

    this.metrics.volume = this._volume
    this.metrics.peak = peak / 255
    this.metrics.rms = avg / 255
    this.metrics.bass = bassCount > 0 ? bassSum / bassCount / 255 : 0
    this.metrics.mid = midCount > 0 ? midSum / midCount / 255 : 0
    this.metrics.treble = trebleCount > 0 ? trebleSum / trebleCount / 255 : 0

    for (let i = 0; i < len && i < this.metrics.spectrum.length; i++) {
      this.metrics.spectrum[i] = data[i]! / 255
    }

    for (let i = 0; i < this.waveformData.length && i < this.metrics.waveform.length; i++) {
      this.metrics.waveform[i] = (this.waveformData[i]! - 128) / 128
    }
  }

  private createEmptyMetrics(): AudioMetrics {
    const bins = APP_CONFIG.fftSize / 2
    return {
      volume: 0,
      peak: 0,
      rms: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      dominantFrequency: 0,
      spectrum: new Float32Array(bins),
      waveform: new Float32Array(APP_CONFIG.fftSize),
    }
  }

  private setState(state: PlaybackState): void {
    this._state = state
    for (const listener of this.stateListeners) {
      listener(state)
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.metrics)
    }
  }
}

export const audioEngine = new AudioEngine()
