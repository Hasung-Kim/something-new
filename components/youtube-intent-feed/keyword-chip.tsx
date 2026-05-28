'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { Keyword, SortOrder } from '@/types/keyword'
import { SORT_LABELS } from '@/types/keyword'

type KeywordChipProps = {
  keyword: Keyword
  isFirst: boolean
  isLast: boolean
  onRemove: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onEdit: (id: string, label: string, sort: SortOrder) => void
}

export function KeywordChip({
  keyword,
  isFirst,
  isLast,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onEdit,
}: KeywordChipProps) {
  const [open, setOpen] = useState(false)
  const [editLabel, setEditLabel] = useState(keyword.label)
  const [editSort, setEditSort] = useState<SortOrder>(keyword.sort)

  function handleOpenChange(next: boolean) {
    if (next) {
      setEditLabel(keyword.label)
      setEditSort(keyword.sort)
    }
    setOpen(next)
  }

  function handleSave() {
    const trimmed = editLabel.trim()
    if (!trimmed) return
    onEdit(keyword.id, trimmed, editSort)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
        <PopoverTrigger asChild>
          <button
            className="px-1 font-medium cursor-pointer hover:underline underline-offset-2"
            aria-label={`${keyword.label} 수정`}
          >
            {keyword.label}
            <span className="text-xs text-muted-foreground ml-0.5">{SORT_LABELS[keyword.sort]}</span>
          </button>
        </PopoverTrigger>
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
      <PopoverContent className="w-64">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`edit-label-${keyword.id}`}>키워드</FieldLabel>
            <Input
              id={`edit-label-${keyword.id}`}
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel>정렬</FieldLabel>
            <Select value={editSort} onValueChange={v => setEditSort(v as SortOrder)}>
              <SelectTrigger>
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
          </Field>
          <Button onClick={handleSave} className="w-full">저장</Button>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  )
}
