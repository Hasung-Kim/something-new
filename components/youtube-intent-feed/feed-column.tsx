'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCwIcon, WifiOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { SkeletonCard } from './skeleton-card'
import { VideoCard } from './video-card'
import type { Video } from '@/types/video'
import type { SortOrder } from '@/types/keyword'
import { SORT_LABELS } from '@/types/keyword'

type FeedColumnProps = {
  keyword: string
  sort?: SortOrder
  showHeader?: boolean
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; videos: Video[] }

export function FeedColumn({ keyword, sort = 'relevance', showHeader = true }: FeedColumnProps) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [summarizing, setSummarizing] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: 'loading' })
    try {
      const res = await fetch(
        `/api/youtube?keyword=${encodeURIComponent(keyword)}&sort=${sort}`,
        { signal }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ status: 'success', videos: data.videos })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setState({ status: 'error' })
    }
  }, [keyword, sort])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
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
      setState(prev =>
        prev.status === 'success'
          ? { status: 'success', videos: prev.videos.map(v => v.id === video.id ? { ...v, aiSummary: data.summary } : v) }
          : prev
      )
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
          <div>
            <span className="text-sm font-bold">{keyword}</span>
            <span className="text-xs text-muted-foreground ml-1.5">{SORT_LABELS[sort]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {state.status === 'success' && (
              <Badge variant="secondary">{state.videos.length}개</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => load()}
              disabled={state.status === 'loading'}
              aria-label={`${keyword} 재검색`}
            >
              <RefreshCwIcon className={cn('size-3.5', state.status === 'loading' && 'animate-spin')} />
            </Button>
          </div>
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
        <Alert>
          <WifiOffIcon />
          <AlertTitle>영상을 불러오지 못했습니다</AlertTitle>
          <AlertDescription>잠시 후 다시 시도해 주세요.</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => load()}>
              <RefreshCwIcon data-icon="inline-start" />
              다시 시도
            </Button>
          </AlertAction>
        </Alert>
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
