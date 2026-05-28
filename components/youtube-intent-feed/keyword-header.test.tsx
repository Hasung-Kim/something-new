import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeywordHeader } from './keyword-header'
import type { Keyword } from '@/types/keyword'

function makeKeyword(label: string, idx: number): Keyword {
  return { id: `id-${idx}`, label, order: idx, sort: 'relevance' }
}

const noop = () => {}

describe('KeywordHeader', () => {
  it('adds chip on Enter', async () => {
    const onAdd = vi.fn()
    render(<KeywordHeader keywords={[]} onAdd={onAdd} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    await userEvent.type(screen.getByRole('textbox'), 'React{Enter}')
    expect(onAdd).toHaveBeenCalledWith('React', 'relevance')
  })

  it('adds chip on button click', async () => {
    const onAdd = vi.fn()
    render(<KeywordHeader keywords={[]} onAdd={onAdd} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    await userEvent.type(screen.getByRole('textbox'), 'React')
    await userEvent.click(screen.getByRole('button', { name: /추가/ }))
    expect(onAdd).toHaveBeenCalledWith('React', 'relevance')
  })

  it('clears input after add', async () => {
    const onAdd = vi.fn()
    render(<KeywordHeader keywords={[]} onAdd={onAdd} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'React{Enter}')
    expect(input).toHaveValue('')
  })

  it('shows max message when 6 keywords', () => {
    const keywords = Array.from({ length: 6 }, (_, i) => makeKeyword(`k${i}`, i))
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    expect(screen.getByText(/최대 6개/)).toBeInTheDocument()
  })

  it('disables add button when 6 keywords', () => {
    const keywords = Array.from({ length: 6 }, (_, i) => makeKeyword(`k${i}`, i))
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    expect(screen.getByRole('button', { name: /추가/ })).toBeDisabled()
  })

  it('disables input when 6 keywords', () => {
    const keywords = Array.from({ length: 6 }, (_, i) => makeKeyword(`k${i}`, i))
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('calls onRemove when × is clicked', async () => {
    const onRemove = vi.fn()
    const keywords = [makeKeyword('React', 0)]
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={onRemove} onMoveLeft={noop} onMoveRight={noop} />)
    await userEvent.click(screen.getByRole('button', { name: /React 삭제/ }))
    expect(onRemove).toHaveBeenCalledWith('id-0')
  })

  it('calls onMoveLeft when ← is clicked', async () => {
    const onMoveLeft = vi.fn()
    const keywords = [makeKeyword('React', 0), makeKeyword('주식', 1)]
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={onMoveLeft} onMoveRight={noop} />)
    await userEvent.click(screen.getByRole('button', { name: /주식 왼쪽으로/ }))
    expect(onMoveLeft).toHaveBeenCalledWith('id-1')
  })

  it('disables left arrow for first keyword', () => {
    const keywords = [makeKeyword('React', 0), makeKeyword('주식', 1)]
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    expect(screen.getByRole('button', { name: /React 왼쪽으로/ })).toBeDisabled()
  })

  it('disables right arrow for last keyword', () => {
    const keywords = [makeKeyword('React', 0), makeKeyword('주식', 1)]
    render(<KeywordHeader keywords={keywords} onAdd={noop} onRemove={noop} onMoveLeft={noop} onMoveRight={noop} />)
    expect(screen.getByRole('button', { name: /주식 오른쪽으로/ })).toBeDisabled()
  })
})
