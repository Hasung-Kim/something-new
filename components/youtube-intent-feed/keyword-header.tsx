'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeywordChip } from './keyword-chip'
import type { Keyword } from '@/types/keyword'

const MAX_KEYWORDS = 6

type KeywordHeaderProps = {
  keywords: Keyword[]
  onAdd: (label: string) => void
  onRemove: (id: string) => void
  onMoveLeft: (id: string) => void
  onMoveRight: (id: string) => void
}

export function KeywordHeader({
  keywords,
  onAdd,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: KeywordHeaderProps) {
  const [input, setInput] = useState('')
  const isMax = keywords.length >= MAX_KEYWORDS

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-background">
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keywords.map((kw, idx) => (
            <KeywordChip
              key={kw.id}
              keyword={kw}
              isFirst={idx === 0}
              isLast={idx === keywords.length - 1}
              onRemove={() => onRemove(kw.id)}
              onMoveLeft={() => onMoveLeft(kw.id)}
              onMoveRight={() => onMoveRight(kw.id)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="관심 키워드 입력 (예: React, 주식)"
          disabled={isMax}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={isMax}
          aria-label="추가"
        >
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
      </div>

      {isMax && (
        <p className="text-xs text-muted-foreground mt-2">
          최대 6개까지 추가할 수 있습니다. 기존 키워드를 삭제하면 추가할 수 있어요.
        </p>
      )}
    </div>
  )
}
