import { unstable_cache } from 'next/cache'
import type { Video } from '@/types/video'
import type { SortOrder } from '@/types/keyword'

type YouTubeSearchItem = {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    thumbnails: { medium?: { url: string }; default?: { url: string } }
    description: string
  }
}

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[]
  error?: { message: string }
}

type YouTubeVideoItem = {
  id: string
  contentDetails: { duration: string }
}

type YouTubeVideosResponse = {
  items?: YouTubeVideoItem[]
}

// ISO 8601 duration (PT4M13S) → "4:13", "1:23:45"
function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ''
  const h = parseInt(m[1] ?? '0')
  const min = parseInt(m[2] ?? '0')
  const sec = parseInt(m[3] ?? '0')
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${min}:${String(sec).padStart(2, '0')}`
}

async function fetchDurations(ids: string[], apiKey: string): Promise<Record<string, string>> {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'contentDetails')
  url.searchParams.set('id', ids.join(','))
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return {}

  const data: YouTubeVideosResponse = await res.json()
  return Object.fromEntries(
    (data.items ?? []).map(item => [item.id, parseDuration(item.contentDetails.duration)])
  )
}

async function searchYouTube(keyword: string, sort: SortOrder = 'relevance'): Promise<Video[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '8')
  url.searchParams.set('order', sort)
  url.searchParams.set('q', keyword)
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)

  const data: YouTubeSearchResponse = await res.json()
  if (data.error) throw new Error(data.error.message)

  const items = data.items ?? []
  const ids = items.map(item => item.id.videoId)
  const durations = ids.length > 0 ? await fetchDurations(ids, apiKey) : {}

  return items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      '',
    description: item.snippet.description,
    duration: durations[item.id.videoId],
  }))
}

export const fetchYouTubeVideos = unstable_cache(
  searchYouTube,
  ['youtube-videos'],
  { revalidate: 3600 },
)
