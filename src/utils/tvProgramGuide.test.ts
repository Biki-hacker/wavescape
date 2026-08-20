import { describe, it, expect } from 'vitest'
import { getOngoingProgram } from './tvProgramGuide'
import type { TVChannel, TVStream } from '../types'

describe('tvProgramGuide', () => {
  const sampleChannel: TVChannel = {
    id: 'bbc-news',
    name: 'BBC News',
    alt_names: [],
    network: 'BBC',
    owners: [],
    country: 'GB',
    categories: ['news'],
    is_nsfw: false,
    launched: null,
    closed: null,
    replaced_by: null,
    website: null,
  }

  const sampleStream: TVStream = {
    channel: 'bbc-news',
    feed: null,
    title: 'BBC News 1080p',
    url: 'https://example.com/stream.m3u8',
    referrer: null,
    user_agent: null,
    quality: '1080p',
    label: null,
  }

  it('should return a valid ongoing program with title, genre, and time range', () => {
    const program = getOngoingProgram(sampleChannel, sampleStream, 'Europe/London')
    expect(program.title).toBeTruthy()
    expect(program.genre).toBeTruthy()
    expect(program.startTime).toMatch(/^\d{2}:\d{2}$/)
    expect(program.endTime).toMatch(/^\d{2}:\d{2}$/)
    expect(program.progress).toBeGreaterThanOrEqual(0)
    expect(program.progress).toBeLessThanOrEqual(100)
    expect(program.remainingMinutes).toBeGreaterThan(0)
    expect(program.upNextTitle).toBeTruthy()
    expect(program.upNextTime).toMatch(/^\d{2}:\d{2}$/)
  })

  it('should handle invalid timezone gracefully', () => {
    const program = getOngoingProgram(sampleChannel, sampleStream, 'Invalid/Timezone_123')
    expect(program.title).toBeTruthy()
    expect(program.startTime).toMatch(/^\d{2}:\d{2}$/)
  })

  it('should handle sports channel appropriately', () => {
    const sportsChannel: TVChannel = {
      ...sampleChannel,
      id: 'sky-sports',
      name: 'Sky Sports',
      categories: ['sports'],
    }
    const program = getOngoingProgram(sportsChannel)
    expect(program.title).toBeTruthy()
  })
})
