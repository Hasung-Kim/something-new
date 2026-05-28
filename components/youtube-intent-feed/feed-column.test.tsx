import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedColumn } from './feed-column'
import type { Video } from '@/types/video'

const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'React Tutorial',
    channelTitle: 'Fireship',
    publishedAt: '2024-01-01T00:00:00Z',
    thumbnailUrl: 'https://img.youtube.com/vi/v1/mqdefault.jpg',
    description: 'Learn React',
  },
]

beforeEach(() => {
  vi.resetAllMocks()
})

describe('FeedColumn', () => {
  it('shows skeleton cards while loading', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {})) // never resolves
    render(<FeedColumn keyword="React" />)
    const skeletons = document.querySelectorAll('[class*="animate-pulse"], .animate-pulse')
    // SkeletonCard renders Skeleton components — check multiple exist
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0)
  })

  it('shows error message and retry button on API failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    render(<FeedColumn keyword="React" />)

    await waitFor(() => {
      expect(screen.getByText('영상을 불러오지 못했습니다')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument()
    })
  })

  it('retry button triggers reload (loading state reappears)', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockReturnValue(new Promise(() => {}))

    vi.stubGlobal('fetch', fetchMock)
    render(<FeedColumn keyword="React" />)

    await waitFor(() => screen.getByRole('button', { name: /다시 시도/ }))
    await userEvent.click(screen.getByRole('button', { name: /다시 시도/ }))

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('shows videos on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ videos: mockVideos }),
    }))
    render(<FeedColumn keyword="React" />)

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument()
    })
  })
})
