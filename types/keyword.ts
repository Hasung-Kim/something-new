export type SortOrder = 'relevance' | 'date' | 'viewCount'

export const SORT_LABELS: Record<SortOrder, string> = {
  relevance: '관련도순',
  date: '최신순',
  viewCount: '조회수순',
}

export type Keyword = {
  id: string
  label: string
  order: number
  sort: SortOrder
}
