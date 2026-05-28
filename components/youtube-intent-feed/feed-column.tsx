'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCwIcon, WifiOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from './skeleton-card'
import { VideoCard } from './video-card'
import type { Video } from '@/types/video'

type FeedColumnProps = {
  keyword: string
  showHeader?: boolean
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; videos: Video[] }

export function FeedColumn({ keyword, showHeader = true }: FeedColumnProps) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [summarizing, setSummarizing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch(`/api/youtube?keyword=${encodeURIComponent(keyword)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ status: 'success', videos: data.videos })
    } catch {
      setState({ status: 'error' })
    }
  }, [keyword])

  useEffect(() => {
    load()
  }, [load])

  async function handleSummarize(video: Video) {
    setSummarizing(video.id)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: video.title, description: video.description }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (state.status === 'success') {
        setState({
          status: 'success',
          videos: state.videos.map(v =>
            v.id === video.id ? { ...v, aiSummary: data.summary } : v,
          ),
        })
      }
    } catch {
      // summary failed — button restores
    } finally {
      setSummarizing(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {showHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-sm font-bold">{keyword}</span>
          {state.status === 'success' && (
            <span className="text-xs text-muted-foreground">{state.videos.length}개</span>
          )}
          {state.status === 'error' && (
            <WifiOffIcon className="size-4 text-muted-foreground" />
          )}
        </div>
      )}

      {state.status === 'loading' && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col items-center justify-center py-10 border border-border rounded-lg text-center gap-3 bg-background">
          <WifiOffIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">영상을 불러오지 못했습니다</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCwIcon data-icon="inline-start" />
            다시 시도
          </Button>
        </div>
      )}

      {state.status === 'success' && (
        <>
          {state.videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              summarizing={summarizing === video.id}
              onSummarize={() => handleSummarize(video)}
            />
          ))}
        </>
      )}
    </div>
  )
}
