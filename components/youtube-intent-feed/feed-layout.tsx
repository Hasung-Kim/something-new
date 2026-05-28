'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FeedColumn } from './feed-column'
import type { Keyword } from '@/types/keyword'

type FeedLayoutProps = {
  keywords: Keyword[]
}

export function FeedLayout({ keywords }: FeedLayoutProps) {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (activeTab >= keywords.length) {
      setActiveTab(Math.max(0, keywords.length - 1))
    }
  }, [keywords.length, activeTab])

  if (keywords.length === 0) return null

  return (
    <div className="@container">
      {/* Mobile: 탭 바 */}
      <div className="flex border-b border-border mb-4 overflow-x-auto @md:hidden" role="tablist">
        {keywords.map((kw, idx) => (
          <button
            key={kw.id}
            role="tab"
            aria-selected={idx === activeTab}
            onClick={() => setActiveTab(idx)}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap transition-colors',
              idx === activeTab
                ? 'border-b-2 border-foreground font-semibold'
                : 'text-muted-foreground',
            )}
          >
            {kw.label}
          </button>
        ))}
      </div>

      {/* Mobile: 활성 탭 컬럼만 렌더 */}
      <div className="@md:hidden">
        {keywords[activeTab] && (
          <FeedColumn keyword={keywords[activeTab].label} showHeader={false} />
        )}
      </div>

      {/* Desktop: 모든 컬럼 나란히 */}
      <div className="hidden @md:flex gap-4 overflow-x-auto pb-4">
        {keywords.map(kw => (
          <div key={kw.id} className="min-w-64 w-72 flex-shrink-0">
            <FeedColumn keyword={kw.label} showHeader />
          </div>
        ))}
      </div>
    </div>
  )
}
