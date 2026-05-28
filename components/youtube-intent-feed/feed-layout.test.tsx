import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedLayout } from './feed-layout'
import type { Keyword } from '@/types/keyword'

// FeedColumn이 fetch를 호출하므로 mock
vi.mock('./feed-column', () => ({
  FeedColumn: ({ keyword }: { keyword: string }) => (
    <div data-testid={`column-${keyword}`}>{keyword} column</div>
  ),
}))

function makeKeywords(labels: string[]): Keyword[] {
  return labels.map((label, i) => ({ id: `id-${i}`, label, order: i }))
}

describe('FeedLayout — renders all keywords', () => {
  it('renders desktop columns for all keywords', () => {
    const keywords = makeKeywords(['React', '주식', '운동'])
    render(<FeedLayout keywords={keywords} />)
    // All 3 keywords render in the desktop section
    // Active tab (React) also renders in the mobile section
    expect(screen.getAllByTestId('column-React').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('column-주식').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('column-운동').length).toBeGreaterThanOrEqual(1)
  })
})

describe('FeedLayout — tab UI', () => {
  it('shows tab bar with all keywords', () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    expect(screen.getByRole('tab', { name: 'React' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '주식' })).toBeInTheDocument()
  })

  it('first tab is active by default', () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    expect(screen.getByRole('tab', { name: 'React' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '주식' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches active tab on click', async () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    await userEvent.click(screen.getByRole('tab', { name: '주식' }))
    expect(screen.getByRole('tab', { name: '주식' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'React' })).toHaveAttribute('aria-selected', 'false')
  })

  it('only renders active tab column in mobile section', () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    // Mobile section: only active tab (React) is mounted
    // 주식 appears only in desktop section (1 instance total)
    expect(screen.getAllByTestId('column-주식')).toHaveLength(1)
  })

  it('both columns render — error isolation per column', () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    expect(screen.getAllByTestId('column-React').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('column-주식').length).toBeGreaterThan(0)
  })
})
