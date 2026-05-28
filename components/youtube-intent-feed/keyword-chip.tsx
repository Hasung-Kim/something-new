'use client'

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Keyword } from '@/types/keyword'

type KeywordChipProps = {
  keyword: Keyword
  isFirst: boolean
  isLast: boolean
  onRemove: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}

export function KeywordChip({
  keyword,
  isFirst,
  isLast,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: KeywordChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-2 py-1 rounded-md border border-border bg-muted text-sm',
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="size-5"
        disabled={isFirst}
        onClick={onMoveLeft}
        aria-label={`${keyword.label} 왼쪽으로`}
      >
        <ChevronLeftIcon data-icon />
      </Button>
      <span className="px-1 font-medium">{keyword.label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-5"
        disabled={isLast}
        onClick={onMoveRight}
        aria-label={`${keyword.label} 오른쪽으로`}
      >
        <ChevronRightIcon data-icon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-5"
        onClick={onRemove}
        aria-label={`${keyword.label} 삭제`}
      >
        <XIcon data-icon />
      </Button>
    </span>
  )
}
