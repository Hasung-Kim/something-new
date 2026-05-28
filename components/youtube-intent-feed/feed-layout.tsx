'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FeedColumn } from './feed-column'
import type { Keyword } from '@/types/keyword'

type FeedLayoutProps = {
  keywords: Keyword[]
}

export function FeedLayout({ keywords }: FeedLayoutProps) {
  const [activeId, setActiveId] = useState(keywords[0]?.id ?? '')

  useEffect(() => {
    if (!keywords.find(k => k.id === activeId) && keywords.length > 0) {
      setActiveId(keywords[keywords.length - 1].id)
    }
  }, [keywords, activeId])

  if (keywords.length === 0) return null

  const activeKeyword = keywords.find(k => k.id === activeId) ?? keywords[0]

  return (
    <div className="@container">
      {/* Mobile: 탭 바 */}
      <Tabs value={activeId} onValueChange={setActiveId} className="@md:hidden">
        <TabsList
          variant="line"
          className="w-full h-auto rounded-none border-b border-border bg-transparent pb-0 overflow-x-auto justify-start"
        >
          {keywords.map(kw => (
            <TabsTrigger key={kw.id} value={kw.id} className="whitespace-nowrap">
              {kw.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-3">
          <FeedColumn keyword={activeKeyword.label} showHeader={false} />
        </div>
      </Tabs>

      {/* Desktop: 모든 컬럼 나란히 */}
      <ScrollArea className="hidden @md:block w-full">
        <div className="flex gap-4 pb-4">
          {keywords.map(kw => (
            <div key={kw.id} className="min-w-64 w-72 flex-shrink-0">
              <FeedColumn keyword={kw.label} showHeader />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
