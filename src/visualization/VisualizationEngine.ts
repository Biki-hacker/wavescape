import type { Theme } from '../types'
import type { AudioMetrics } from '../types'
import type { WeatherProfile } from '../types'

export class VisualizationEngine {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationId: number | null = null
  private theme: Theme | null = null
  private audioMetrics: AudioMetrics | null = null
  private weatherProfile: WeatherProfile | null = null
  private time: number = 0
  private noiseCanvas: HTMLCanvasElement | null = null

  private particles: Particle[] = []
  private readonly maxParticles: number = 80

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.noiseCanvas = document.createElement('canvas')
    this.noiseCanvas.width = 64
    this.noiseCanvas.height = 36
    this.resize()
    this.startLoop()
  }

  resize(): void {
    if (!this.canvas) return
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  updateTheme(theme: Theme): void {
    this.theme = theme
  }

  updateAudio(metrics: AudioMetrics): void {
    this.audioMetrics = metrics
  }

  updateWeather(profile: WeatherProfile): void {
    this.weatherProfile = profile
    this.updateParticles()
  }

  startLoop(): void {
    const loop = (timestamp: number) => {
      this.time = timestamp / 1000
      this.render()
      this.animationId = requestAnimationFrame(loop)
    }
    this.animationId = requestAnimationFrame(loop)
  }

  stopLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private render(): void {
    const ctx = this.ctx
    const canvas = this.canvas
    if (!ctx || !canvas || !this.theme) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.renderBackground(ctx, canvas)
    this.renderNoise(ctx, canvas)
    this.renderParticles(ctx, canvas)
    this.renderWaveform(ctx, canvas)
  }

  private renderBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    if (!this.theme) return
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    )

    const bg = this.theme.colors.background
    const surface = this.theme.colors.surface

    gradient.addColorStop(0, bg)
    gradient.addColorStop(1, surface)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  private renderNoise(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const noiseCtx = this.noiseCanvas?.getContext('2d')
    if (!noiseCtx || !this.noiseCanvas) return

    const imageData = noiseCtx.createImageData(64, 36)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 20
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 15
    }

    noiseCtx.putImageData(imageData, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.noiseCanvas, 0, 0, canvas.width, canvas.height)
  }

  private updateParticles(): void {
    if (!this.weatherProfile) return

    const profile = this.weatherProfile.particleProfile
    const targetCount = Math.min(profile.density, this.maxParticles)

    while (this.particles.length < targetCount) {
      this.particles.push(this.createParticle(profile))
    }

    while (this.particles.length > targetCount) {
      this.particles.pop()
    }
  }

  private createParticle(profile: ParticleProfile): Particle {
    if (!this.canvas) return createDefaultParticle(profile)

    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: profile.direction + (Math.random() - 0.5) * profile.spread,
      vy: profile.speed * (0.5 + Math.random()),
      size: profile.size[0] + Math.random() * (profile.size[1] - profile.size[0]),
      opacity: profile.opacity[0] + Math.random() * (profile.opacity[1] - profile.opacity[0]),
      life: 1,
      type: profile.type,
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    if (!this.weatherProfile) return

    const profile = this.weatherProfile.particleProfile
    const audioEnergy = this.audioMetrics?.rms ?? 0
    const time = this.time

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      p.x += p.vx + audioEnergy * 0.5
      p.y += p.vy
      p.opacity -= 0.001

      if (p.opacity <= 0 || p.y > canvas.height || p.x < -10 || p.x > canvas.width + 10) {
        this.particles[i] = this.createParticle(profile)
        continue
      }

      const opacity = Math.min(p.opacity, 1)
      ctx.globalAlpha = opacity * (this.theme?.brightness ?? 1)

      if (p.type === 'rain' || p.type === 'snow') {
        const len = p.size * 3
        ctx.fillStyle = this.getParticleColor(p.type, audioEnergy)
        ctx.fillRect(p.x, p.y, 1, len)
      } else if (p.type === 'stars') {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + i)
        ctx.globalAlpha = opacity * twinkle
        ctx.fillStyle = this.getParticleColor(p.type, audioEnergy)
        ctx.fillRect(p.x, p.y, p.size, p.size)
      } else {
        ctx.fillStyle = this.getParticleColor(p.type, audioEnergy)
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
    }

    ctx.globalAlpha = 1
  }

  private getParticleColor(type: string, energy: number): string {
    if (!this.theme) return '#ffffff'
    switch (type) {
      case 'rain':
        return '#6080b0'
      case 'snow':
        return '#d0d8e8'
      case 'stars':
        return '#e0e8ff'
      case 'haze':
        return this.theme.colors.mutedText
      case 'sparks':
        return `rgba(255, ${200 + Math.floor(energy * 55)}, 100, 1)`
      default:
        return this.theme.colors.accent
    }
  }

  private renderWaveform(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const waveform = this.audioMetrics?.waveform
    if (!waveform || waveform.length === 0 || !this.theme) return

    const width = canvas.width * 0.6
    const height = canvas.height * 0.12
    const centerX = (canvas.width - width) / 2
    const centerY = canvas.height * 0.45
    const step = waveform.length / 128

    ctx.strokeStyle = this.theme.colors.accent
    ctx.lineWidth = 2
    ctx.beginPath()

    const glow = this.audioMetrics?.bass ?? 0
    ctx.shadowColor = this.theme.colors.accent
    ctx.shadowBlur = 8 + glow * 12

    for (let i = 0; i < 128; i++) {
      const idx = Math.floor(i * step)
      const sample = waveform[idx] ?? 0
      const x = centerX + (i / 128) * width
      const y = centerY + sample * height

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.shadowBlur = 0
  }

  getMetrics(): { particleCount: number } {
    return { particleCount: this.particles.length }
  }
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  type: string
}

interface ParticleProfile {
  type: string
  density: number
  speed: number
  size: [number, number]
  opacity: [number, number]
  direction: number
  spread: number
}

function createDefaultParticle(profile: ParticleProfile): Particle {
  return {
    x: Math.random() * 1920,
    y: Math.random() * 1080,
    vx: profile.direction + (Math.random() - 0.5) * profile.spread,
    vy: profile.speed * (0.5 + Math.random()),
    size: profile.size[0] + Math.random() * (profile.size[1] - profile.size[0]),
    opacity: profile.opacity[0] + Math.random() * (profile.opacity[1] - profile.opacity[0]),
    life: 1,
    type: profile.type,
  }
}

export const visualizationEngine = new VisualizationEngine()
