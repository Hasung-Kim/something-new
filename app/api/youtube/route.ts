import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { fetchYouTubeVideos } from '@/lib/youtube-api'
import type { SortOrder } from '@/types/keyword'

const VALID_SORTS: SortOrder[] = ['relevance', 'date', 'viewCount']

function getRatelimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'yt-feed:youtube',
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const trimmed = keyword?.trim() ?? ''

  if (!trimmed || trimmed.length > 100) {
    return NextResponse.json({ error: 'keyword parameter is required (max 100 chars)' }, { status: 400 })
  }

  const ratelimiter = getRatelimiter()
  if (ratelimiter) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous'
    const { success } = await ratelimiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: '요청 한도를 초과했습니다.' }, { status: 429 })
    }
  }

  const sortParam = searchParams.get('sort') ?? 'relevance'
  const sort: SortOrder = VALID_SORTS.includes(sortParam as SortOrder)
    ? (sortParam as SortOrder)
    : 'relevance'

  try {
    const videos = await fetchYouTubeVideos(trimmed, sort)
    return NextResponse.json({ videos })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
