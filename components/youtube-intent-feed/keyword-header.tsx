'use client'

import { useState } from 'react'
import { PlusIcon, InfoIcon } from 'lucide-react'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeywordChip } from './keyword-chip'
import type { Keyword, SortOrder } from '@/types/keyword'
import { SORT_LABELS } from '@/types/keyword'

const MAX_KEYWORDS = 6

type KeywordHeaderProps = {
  keywords: Keyword[]
  onAdd: (label: string, sort: SortOrder) => void
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
  const [sort, setSort] = useState<SortOrder>('relevance')
  const isMax = keywords.length >= MAX_KEYWORDS

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed, sort)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-background flex flex-col gap-2">
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
        <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)} disabled={isMax}>
          <SelectTrigger className="w-28 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.entries(SORT_LABELS) as [SortOrder, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <InputGroup className="flex-1">
          <InputGroupInput
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="관심 키워드 입력 (예: React, 주식)"
            disabled={isMax}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={handleAdd}
              disabled={isMax}
              variant="default"
              size="xs"
            >
              <PlusIcon data-icon="inline-start" />
              추가
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {isMax && (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            최대 6개까지 추가할 수 있습니다. 기존 키워드를 삭제하면 추가할 수 있어요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
