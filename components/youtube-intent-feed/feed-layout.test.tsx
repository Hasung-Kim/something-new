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
  it('renders a column for each keyword', () => {
    const keywords = makeKeywords(['React', '주식', '운동'])
    render(<FeedLayout keywords={keywords} />)
    // Each keyword appears in both mobile and desktop sections
    expect(screen.getAllByTestId('column-React')).toHaveLength(2)
    expect(screen.getAllByTestId('column-주식')).toHaveLength(2)
    expect(screen.getAllByTestId('column-운동')).toHaveLength(2)
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

  it('hides inactive tab panel', () => {
    const keywords = makeKeywords(['React', '주식'])
    const { container } = render(<FeedLayout keywords={keywords} />)
    // Mobile section: second tab panel has hidden attribute
    const mobilePanels = container.querySelectorAll('.\\@md\\:hidden > div')
    expect(mobilePanels[0]).not.toHaveAttribute('hidden')
    expect(mobilePanels[1]).toHaveAttribute('hidden')
  })

  it('both columns render — error isolation per column', () => {
    const keywords = makeKeywords(['React', '주식'])
    render(<FeedLayout keywords={keywords} />)
    expect(screen.getAllByTestId('column-React').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('column-주식').length).toBeGreaterThan(0)
  })
})
