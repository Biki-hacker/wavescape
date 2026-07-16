import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTime, fetchTimeByCoordinates } from './time.service'
import { fetchJson } from './api'

vi.mock('./api', () => ({
  fetchJson: vi.fn(),
}))

describe('time.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchTime', () => {
    it('returns time model when TimeAPI succeeds', async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({
        dateTime: '2026-07-16T12:00:00',
        timeZone: 'Asia/Tokyo',
      })

      const result = await fetchTime('Asia/Tokyo')

      expect(fetchJson).toHaveBeenCalledTimes(1)
      expect(result.timezone).toBe('Asia/Tokyo')
      expect(result.localTime).toBe('2026-07-16T12:00:00')
    })

    it('falls back to WorldTimeAPI and then Intl when TimeAPI fails', async () => {
      vi.mocked(fetchJson)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('WorldTimeAPI error'))

      const result = await fetchTime('Europe/London')

      expect(fetchJson).toHaveBeenCalledTimes(2)
      expect(result.timezone).toBe('Europe/London')
      expect(result.localTime).toBeDefined()
    })
  })

  describe('fetchTimeByCoordinates', () => {
    it('returns time model from TimeAPI coordinate endpoint', async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({
        dateTime: '2026-07-16T11:20:00',
        timeZone: 'Asia/Kolkata',
      })

      const result = await fetchTimeByCoordinates(22.5748, 88.3687)

      expect(fetchJson).toHaveBeenCalledTimes(1)
      const url = vi.mocked(fetchJson).mock.calls[0]![0] as string
      expect(url).toContain('timeapi.io/api/Time/current/coordinate')
      expect(result.timezone).toBe('Asia/Kolkata')
    })

    it('falls back to Open-Meteo when TimeAPI fails', async () => {
      vi.mocked(fetchJson)
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce({
          timezone: 'Asia/Kolkata',
          current: { time: '2026-07-16T11:25' },
        })

      const result = await fetchTimeByCoordinates(22.5748, 88.3687)

      expect(fetchJson).toHaveBeenCalledTimes(2)
      expect(result.timezone).toBe('Asia/Kolkata')
      expect(result.localTime).toBe('2026-07-16T11:25')
    })

    it('returns valid fallback values even if all network attempts fail', async () => {
      vi.mocked(fetchJson)
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))

      const result = await fetchTimeByCoordinates(22.5748, 88.3687)

      expect(fetchJson).toHaveBeenCalledTimes(3)
      expect(result.timezone).toBeDefined()
      expect(result.localTime).toBeDefined()
      expect(result.utcOffset).toBeDefined()
    })
  })
})
