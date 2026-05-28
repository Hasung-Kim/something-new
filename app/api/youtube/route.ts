import { NextResponse } from 'next/server'
import { fetchYouTubeVideos } from '@/lib/youtube-api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')

  if (!keyword) {
    return NextResponse.json({ error: 'keyword parameter is required' }, { status: 400 })
  }

  try {
    const videos = await fetchYouTubeVideos(keyword)
    return NextResponse.json({ videos })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
