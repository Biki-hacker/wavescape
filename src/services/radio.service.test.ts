import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchStationsByCoordinates } from './radio.service'
import { fetchJson } from './api'

vi.mock('./api', () => ({
  fetchJson: vi.fn(),
}))

describe('radio.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchStationsByCoordinates', () => {
    it('queries the radio browser api with the correct parameters and stops at tier 1 when enough stations are found', async () => {
      const mockStations = [
        {
          stationuuid: 'uuid1',
          name: 'Station One',
          url_resolved: 'http://station1.mp3',
          url: 'http://station1.mp3',
          country: 'Japan',
          codec: 'mp3',
          bitrate: 128,
          geo_lat: 35.0116,
          geo_long: 135.7681,
        },
        {
          stationuuid: 'uuid2',
          name: 'Station Two',
          url_resolved: 'http://station2.mp3',
          url: 'http://station2.mp3',
          country: 'Japan',
          codec: 'mp3',
          bitrate: 128,
          geo_lat: 35.0216,
          geo_long: 135.7781,
        },
        {
          stationuuid: 'uuid3',
          name: 'Station Three',
          url_resolved: 'http://station3.mp3',
          url: 'http://station3.mp3',
          country: 'Japan',
          codec: 'mp3',
          bitrate: 128,
          geo_lat: 35.0316,
          geo_long: 135.7881,
        },
        {
          stationuuid: 'uuid4',
          name: 'Station Four',
          url_resolved: 'http://station4.mp3',
          url: 'http://station4.mp3',
          country: 'Japan',
          codec: 'mp3',
          bitrate: 128,
          geo_lat: 35.0416,
          geo_long: 135.7981,
        },
        {
          stationuuid: 'uuid5',
          name: 'Station Five',
          url_resolved: 'http://station5.mp3',
          url: 'http://station5.mp3',
          country: 'Japan',
          codec: 'mp3',
          bitrate: 128,
          geo_lat: 35.0516,
          geo_long: 135.8081,
        },
      ]

      vi.mocked(fetchJson).mockResolvedValue(mockStations)

      const result = await fetchStationsByCoordinates(35.0116, 135.7681)

      expect(fetchJson).toHaveBeenCalledTimes(1)
      const calledUrl = vi.mocked(fetchJson).mock.calls[0]![0] as string
      
      // Verify query parameters
      expect(calledUrl).toContain('geo_lat=35.0116')
      expect(calledUrl).toContain('geo_long=135.7681')
      expect(calledUrl).toContain('geo_distance=500000')
      expect(calledUrl).toContain('has_geo_info=true')
      expect(calledUrl).toContain('hidebroken=true')
      expect(calledUrl).toContain('order=votes')
      expect(calledUrl).toContain('reverse=true')
      expect(calledUrl).toContain('limit=200')

      // Verify mapping and distance sorting
      expect(result).toHaveLength(5)
      expect(result[0]).toEqual({
        id: 'uuid1',
        name: 'Station One',
        streamUrl: 'http://station1.mp3',
        country: 'Japan',
        state: undefined,
        codec: 'mp3',
        bitrate: 128,
        homepage: undefined,
        language: undefined,
        tags: [],
        favicon: undefined,
        geo_lat: 35.0116,
        geo_long: 135.7681,
      })
    })

    it('expands search radius to tier 2 and tier 3 when local stations are fewer than 5', async () => {
      const mockStation1 = {
        stationuuid: 'uuid1',
        name: 'Station One',
        url_resolved: 'http://station1.mp3',
        url: 'http://station1.mp3',
        country: 'Japan',
        codec: 'mp3',
        bitrate: 128,
        geo_lat: 35.0116,
        geo_long: 135.7681,
      }

      // Tier 1 returns 1 station, Tier 2 returns same + 1 more, Tier 3 returns more
      vi.mocked(fetchJson)
        .mockResolvedValueOnce([mockStation1])
        .mockResolvedValueOnce([
          mockStation1,
          {
            stationuuid: 'uuid2',
            name: 'Station Two',
            url_resolved: 'http://station2.mp3',
            url: 'http://station2.mp3',
            country: 'Japan',
            codec: 'mp3',
            bitrate: 128,
            geo_lat: 36.0116,
            geo_long: 136.7681,
          },
        ])
        .mockResolvedValueOnce([
          {
            stationuuid: 'uuid3',
            name: 'Station Three',
            url_resolved: 'http://station3.mp3',
            url: 'http://station3.mp3',
            country: 'Japan',
            codec: 'mp3',
            bitrate: 128,
            geo_lat: 37.0116,
            geo_long: 137.7681,
          },
        ])

      const result = await fetchStationsByCoordinates(35.0116, 135.7681)

      expect(fetchJson).toHaveBeenCalledTimes(3)
      const url1 = vi.mocked(fetchJson).mock.calls[0]![0] as string
      const url2 = vi.mocked(fetchJson).mock.calls[1]![0] as string
      const url3 = vi.mocked(fetchJson).mock.calls[2]![0] as string

      expect(url1).toContain('geo_distance=500000')
      expect(url2).toContain('geo_distance=3000000')
      expect(url3).toContain('limit=500')
      expect(result).toHaveLength(3)
    })
  })
})
