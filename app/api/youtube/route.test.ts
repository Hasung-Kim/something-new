import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

// youtube-api 모듈 전체를 mock
vi.mock('@/lib/youtube-api', () => ({
  fetchYouTubeVideos: vi.fn(),
}))

import { fetchYouTubeVideos } from '@/lib/youtube-api'
const mockFetch = vi.mocked(fetchYouTubeVideos)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/youtube', () => {
  it('returns 400 when keyword param is missing', async () => {
    const req = new Request('http://localhost/api/youtube')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns videos array for valid keyword', async () => {
    const videos = [
      {
        id: 'abc123',
        title: 'React Tutorial',
        channelTitle: 'Fireship',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/mqdefault.jpg',
        description: 'Learn React',
      },
    ]
    mockFetch.mockResolvedValue(videos)

    const req = new Request('http://localhost/api/youtube?keyword=React')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.videos).toHaveLength(1)
    expect(body.videos[0].id).toBe('abc123')
  })

  it('returns 500 when fetchYouTubeVideos throws', async () => {
    mockFetch.mockRejectedValue(new Error('API quota exceeded'))

    const req = new Request('http://localhost/api/youtube?keyword=React')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })

  it('response JSON does not contain YOUTUBE_API_KEY string', async () => {
    mockFetch.mockResolvedValue([])
    process.env.YOUTUBE_API_KEY = 'secret-key-12345'

    const req = new Request('http://localhost/api/youtube?keyword=React')
    const res = await GET(req)
    const text = await res.text()

    expect(text).not.toContain('secret-key-12345')
  })
})
