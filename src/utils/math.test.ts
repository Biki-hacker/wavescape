import { describe, it, expect } from 'vitest'
import { clamp, lerp, normalize, smoothstep } from './math'

describe('clamp', () => {
  it('clamps values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('lerp', () => {
  it('linearly interpolates', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
  })
})

describe('normalize', () => {
  it('normalizes values to 0-1', () => {
    expect(normalize(5, 0, 10)).toBe(0.5)
    expect(normalize(0, 0, 10)).toBe(0)
    expect(normalize(10, 0, 10)).toBe(1)
  })
})

describe('smoothstep', () => {
  it('produces smooth transition', () => {
    expect(smoothstep(0, 1, 0)).toBe(0)
    expect(smoothstep(0, 1, 0.5)).toBe(0.5)
    expect(smoothstep(0, 1, 1)).toBe(1)
  })
})
