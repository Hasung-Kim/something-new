import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('shows 3 or more example keyword chips', () => {
    render(<EmptyState onSelect={() => {}} />)
    const chips = screen.getAllByRole('button')
    expect(chips.length).toBeGreaterThanOrEqual(3)
  })

  it('calls onSelect with chip label when clicked', async () => {
    const onSelect = vi.fn()
    render(<EmptyState onSelect={onSelect} />)
    const firstChip = screen.getAllByRole('button')[0]
    await userEvent.click(firstChip)
    expect(onSelect).toHaveBeenCalledWith(expect.any(String))
  })
})
