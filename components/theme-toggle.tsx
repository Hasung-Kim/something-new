'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="다크모드 전환"
        >
          <SunIcon className="size-4 dark:hidden" />
          <MoonIcon className="size-4 hidden dark:block" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      </TooltipContent>
    </Tooltip>
  )
}
