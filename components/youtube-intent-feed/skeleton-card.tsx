'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-8 w-full mt-1" />
      </div>
    </div>
  )
}
