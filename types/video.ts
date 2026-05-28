export type Video = {
  id: string
  title: string
  channelTitle: string
  publishedAt: string
  thumbnailUrl: string
  description: string
  duration?: string  // "4:13", "1:23:45" 형식
  aiSummary?: string
}
