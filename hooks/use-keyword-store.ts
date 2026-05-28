import { useState, useEffect } from 'react'
import type { Keyword } from '@/types/keyword'

const STORAGE_KEY = 'youtube-intent-feed-keywords'
const MAX_KEYWORDS = 6

function loadFromStorage(): Keyword[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Keyword[]) : []
  } catch {
    return []
  }
}

export function useKeywordStore() {
  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    if (typeof window === 'undefined') return []
    return loadFromStorage()
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords))
  }, [keywords])

  function add(label: string) {
    const trimmed = label.trim()
    if (!trimmed) return
    setKeywords(prev => {
      if (prev.some(k => k.label === trimmed)) return prev
      if (prev.length >= MAX_KEYWORDS) return prev
      return [...prev, { id: crypto.randomUUID(), label: trimmed, order: prev.length }]
    })
  }

  function remove(id: string) {
    setKeywords(prev => prev.filter(k => k.id !== id))
  }

  function moveLeft(id: string) {
    setKeywords(prev => {
      const idx = prev.findIndex(k => k.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveRight(id: string) {
    setKeywords(prev => {
      const idx = prev.findIndex(k => k.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  return { keywords, add, remove, moveLeft, moveRight }
}
