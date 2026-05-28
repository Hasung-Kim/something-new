'use client'

import Image from 'next/image'
import { LoaderIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Video } from '@/types/video'

type VideoCardProps = {
  video: Video
  summarizing?: boolean
  onSummarize?: () => void
}

export function VideoCard({ video, summarizing = false, onSummarize }: VideoCardProps) {
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`

  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(video.publishedAt))

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>
        <div className="p-3">
          <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">{video.title}</p>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{video.channelTitle}</span>
            <span data-testid="published-date">{formattedDate}</span>
          </div>
        </div>
      </a>

      <div className="px-3 pb-3">
        {video.aiSummary ? (
          <div className="text-xs p-2 rounded-md border border-border bg-muted/50 flex gap-1.5">
            <SparklesIcon className="size-3 mt-0.5 shrink-0 text-muted-foreground" />
            <span>{video.aiSummary}</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={summarizing}
            onClick={onSummarize}
          >
            {summarizing ? (
              <>
                <LoaderIcon data-icon="inline-start" className="animate-spin" />
                생성 중...
              </>
            ) : (
              '요약 보기'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
