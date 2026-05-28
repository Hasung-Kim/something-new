import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate, mockLimit } = vi.hoisted(() => ({
  mockCreate: vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'React 18의 핵심 기능을 설명합니다.' }],
  }),
  mockLimit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@anthropic-ai/sdk', () => {
  class Anthropic {
    messages = { create: mockCreate }
    constructor(_opts: unknown) {}
  }
  return { default: Anthropic }
})

vi.mock('@upstash/ratelimit', () => {
  function Ratelimit(this: any) { this.limit = mockLimit }
  Ratelimit.slidingWindow = () => ({})
  return { Ratelimit }
})

vi.mock('@upstash/redis', () => ({ Redis: vi.fn() }))

import { POST } from './route'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ANTHROPIC_API_KEY = 'test-key'
  process.env.UPSTASH_REDIS_REST_URL = ''
  process.env.UPSTASH_REDIS_REST_TOKEN = ''
})

describe('POST /api/summarize', () => {
  it('returns 400 when title is missing', async () => {
    const req = new Request('http://localhost/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'some desc' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns summary for valid input', async () => {
    const req = new Request('http://localhost/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'React 18 Guide', description: 'Learn React 18' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.summary).toBeTruthy()
  })

  it('returns 429 when rate limit exceeded', async () => {
    mockLimit.mockResolvedValueOnce({ success: false })
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'

    const req = new Request('http://localhost/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'React 18 Guide' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('response does not contain ANTHROPIC_API_KEY value', async () => {
    process.env.ANTHROPIC_API_KEY = 'super-secret-key-xyz'
    const req = new Request('http://localhost/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    })
    const res = await POST(req)
    const text = await res.text()
    expect(text).not.toContain('super-secret-key-xyz')
  })
})
