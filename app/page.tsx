'use client'

import { useKeywordStore } from '@/hooks/use-keyword-store'
import { KeywordHeader } from '@/components/youtube-intent-feed/keyword-header'
import { FeedLayout } from '@/components/youtube-intent-feed/feed-layout'
import { EmptyState } from '@/components/youtube-intent-feed/empty-state'

export default function Page() {
  const { keywords, add, remove, moveLeft, moveRight } = useKeywordStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="@container max-w-screen-2xl mx-auto p-4">
        <header className="mb-4">
          <KeywordHeader
            keywords={keywords}
            onAdd={add}
            onRemove={remove}
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
          />
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
