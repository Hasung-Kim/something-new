'use client'

import { LayoutGridIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const EXAMPLE_KEYWORDS = ['React', '주식 투자', '헬스 운동', '요리 레시피', '영어 회화', 'AI 뉴스']

type EmptyStateProps = {
  onSelect: (keyword: string) => void
}

export function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center px-4">
      <LayoutGridIcon className="size-12 mb-4 text-muted-foreground" />
      <p className="text-base font-medium mb-1">여러 관심사를 한 화면에서 보세요</p>
      <p className="text-sm text-muted-foreground mb-8">
        키워드를 추가하면 YouTube 영상이 컬럼별로 표시됩니다
      </p>
      <p className="text-xs font-semibold text-muted-foreground mb-3">이런 키워드는 어떠세요?</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {EXAMPLE_KEYWORDS.map(keyword => (
          <Button
            key={keyword}
            variant="outline"
            size="sm"
            onClick={() => onSelect(keyword)}
          >
            {keyword}
          </Button>
        ))}
      </div>
    </div>
  )
}
