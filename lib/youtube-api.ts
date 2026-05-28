import { unstable_cache } from 'next/cache'
import type { Video } from '@/types/video'

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

async function searchYouTube(keyword: string): Promise<Video[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '8')
  url.searchParams.set('order', 'relevance')
  url.searchParams.set('q', keyword)
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)

  const data: YouTubeSearchResponse = await res.json()
  if (data.error) throw new Error(data.error.message)

  return (data.items ?? []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      '',
    description: item.snippet.description,
  }))
}

export const fetchYouTubeVideos = unstable_cache(
  searchYouTube,
  ['youtube-videos'],
  { revalidate: 3600 },
)
