'use client'

import { InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

export function NoticeDialog() {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" aria-label="공지 및 사용 안내">
              <InfoIcon className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>공지 및 사용 안내</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[30.8rem]">
        <DialogHeader>
          <DialogTitle>공지 및 사용 안내</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-semibold">사용 방법</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>상단 입력창에 원하는 키워드를 입력하고 추가합니다.</li>
              <li>키워드별 컬럼에 YouTube 영상이 자동으로 표시됩니다.</li>
              <li>영상 카드의 AI 요약 버튼으로 내용을 한 줄로 확인할 수 있습니다.</li>
              <li>키워드 순서는 좌우 화살표로 조정할 수 있습니다.</li>
              <li>새로고침 버튼으로 최신 영상을 다시 불러올 수 있습니다.</li>
            </ol>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="font-semibold">요청 제한 정책</h3>
            <p className="text-muted-foreground">
              서버 비용을 줄이기 위해 IP 기준으로 요청 횟수를 제한하고 있습니다.
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex justify-between">
                <span>YouTube 검색</span>
                <span className="font-medium text-foreground">IP당 20회 / 1시간</span>
              </li>
              <li className="flex justify-between">
                <span>AI 요약</span>
                <span className="font-medium text-foreground">IP당 20회 / 1일</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              한도 초과 시 잠시 후 다시 시도해 주세요.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
