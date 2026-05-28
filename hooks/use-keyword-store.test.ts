import { renderHook, act } from '@testing-library/react'
import { useKeywordStore } from './use-keyword-store'

const STORAGE_KEY = 'youtube-intent-feed-keywords'

beforeEach(() => {
  localStorage.clear()
})

describe('add', () => {
  it('adds a keyword', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => result.current.add('React'))
    expect(result.current.keywords.map(k => k.label)).toContain('React')
  })

  it('rejects empty string', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => result.current.add(''))
    expect(result.current.keywords).toHaveLength(0)
  })

  it('rejects whitespace-only string', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => result.current.add('   '))
    expect(result.current.keywords).toHaveLength(0)
  })

  it('rejects duplicate keyword', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => { result.current.add('React'); result.current.add('React') })
    expect(result.current.keywords).toHaveLength(1)
  })

  it('rejects when 6 keywords exist', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => {
      result.current.add('A')
      result.current.add('B')
      result.current.add('C')
      result.current.add('D')
      result.current.add('E')
      result.current.add('F')
      result.current.add('G')
    })
    expect(result.current.keywords).toHaveLength(6)
  })
})

describe('remove', () => {
  it('removes a keyword by id', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => result.current.add('React'))
    const id = result.current.keywords[0].id
    act(() => result.current.remove(id))
    expect(result.current.keywords.map(k => k.label)).not.toContain('React')
  })
})

describe('moveLeft / moveRight', () => {
  it('moves keyword right', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => { result.current.add('A'); result.current.add('B') })
    const id = result.current.keywords[0].id
    act(() => result.current.moveRight(id))
    expect(result.current.keywords[1].label).toBe('A')
  })

  it('does not move left when at beginning', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => { result.current.add('A'); result.current.add('B') })
    const id = result.current.keywords[0].id
    act(() => result.current.moveLeft(id))
    expect(result.current.keywords[0].label).toBe('A')
  })

  it('does not move right when at end', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => { result.current.add('A'); result.current.add('B') })
    const id = result.current.keywords[1].id
    act(() => result.current.moveRight(id))
    expect(result.current.keywords[1].label).toBe('B')
  })

  it('moves keyword left', () => {
    const { result } = renderHook(() => useKeywordStore())
    act(() => { result.current.add('A'); result.current.add('B') })
    const id = result.current.keywords[1].id
    act(() => result.current.moveLeft(id))
    expect(result.current.keywords[0].label).toBe('B')
  })
})

describe('localStorage persistence', () => {
  it('loads keywords from localStorage on initialization', () => {
    const stored = [{ id: '1', label: 'React', order: 0 }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const { result } = renderHook(() => useKeywordStore())
    expect(result.current.keywords).toHaveLength(1)
    expect(result.current.keywords[0].label).toBe('React')
  })
})
