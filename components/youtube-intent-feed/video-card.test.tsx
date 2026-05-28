import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoCard } from './video-card'
import type { Video } from '@/types/video'

const mockVideo: Video = {
  id: 'abc123',
  title: 'React 18 Complete Guide',
  channelTitle: 'Fireship',
  publishedAt: '2024-01-15T00:00:00Z',
  thumbnailUrl: 'https://img.youtube.com/vi/abc123/mqdefault.jpg',
  description: 'Learn React 18 features in detail',
}

describe('VideoCard', () => {
  it('shows thumbnail, title, channel, date', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByAltText('React 18 Complete Guide')).toBeInTheDocument()
    expect(screen.getByText('React 18 Complete Guide')).toBeInTheDocument()
    expect(screen.getByText('Fireship')).toBeInTheDocument()
    // date is formatted, just check something is rendered
    expect(screen.getByTestId('published-date')).toBeInTheDocument()
  })

  it('shows 요약 보기 button', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByRole('button', { name: /요약 보기/ })).toBeInTheDocument()
  })

  it('card link opens youtube in new tab', () => {
    render(<VideoCard video={mockVideo} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc123')
    expect(link).toHaveAttribute('target', '_blank')
  })
})

describe('VideoCard — AI summary', () => {
  it('shows loading state when onSummarize is pending', () => {
    render(<VideoCard video={mockVideo} summarizing />)
    expect(screen.getByRole('button', { name: /생성 중/ })).toBeDisabled()
  })

  it('shows summary text and hides button when aiSummary is present', () => {
    const videoWithSummary = { ...mockVideo, aiSummary: 'React 18의 핵심 기능을 설명합니다.' }
    render(<VideoCard video={videoWithSummary} />)
    expect(screen.getByText('React 18의 핵심 기능을 설명합니다.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /요약 보기/ })).not.toBeInTheDocument()
  })

  it('calls onSummarize when 요약 보기 is clicked', async () => {
    const onSummarize = vi.fn()
    render(<VideoCard video={mockVideo} onSummarize={onSummarize} />)
    await userEvent.click(screen.getByRole('button', { name: /요약 보기/ }))
    expect(onSummarize).toHaveBeenCalled()
  })
})
