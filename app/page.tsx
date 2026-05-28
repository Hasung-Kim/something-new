'use client'

import { useKeywordStore } from '@/hooks/use-keyword-store'
import { KeywordHeader } from '@/components/youtube-intent-feed/keyword-header'
import { FeedLayout } from '@/components/youtube-intent-feed/feed-layout'
import { EmptyState } from '@/components/youtube-intent-feed/empty-state'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Page() {
  const { keywords, add, remove, moveLeft, moveRight } = useKeywordStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="@container max-w-screen-2xl mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">YouTube Multi Search</h1>
          <p className="text-sm text-muted-foreground mt-1">
            관심 키워드를 추가하면 YouTube 영상을 한 화면에서 병렬로 탐색할 수 있습니다
          </p>
        </div>
        <header className="mb-4 flex gap-2 items-start">
          <div className="flex-1">
            <KeywordHeader
              keywords={keywords}
              onAdd={add}
              onRemove={remove}
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
            />
          </div>
          <ThemeToggle />
        </header>

        <main>
          {keywords.length === 0 ? (
            <EmptyState onSelect={add} />
          ) : (
            <FeedLayout keywords={keywords} />
          )}
        </main>
      </div>
    </div>
  )
}
