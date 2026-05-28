# youtube-intent-feed 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| API 키 보호 | Route Handler (서버사이드) | 클라이언트 노출 방지 (불변 규칙) |
| YouTube 결과 캐싱 | `unstable_cache` (Vercel Data Cache, revalidate: 3600) | 서버리스 환경에서 요청 간 캐시 지속. 무료 tier 사용 가능. |
| AI 요약 Rate Limiting | `@upstash/ratelimit` + Upstash Redis | IP당 하루 20회 제한. 서버리스 호환. 무료 tier (10,000 req/day). |
| 키워드 영속성 | localStorage via custom hook | 로그인 없음 (spec 결정) |
| 상태 관리 | React useState (Client Component) | 전체 앱이 keyword 상태에 반응 — RSC 불필요 |
| AI 요약 | @anthropic-ai/sdk (Route Handler) | 서버사이드 API 키 보호 |
| 레이아웃 반응형 | @container + Tailwind v4 | wireframe과 동일 구조, 뷰포트 독립 |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| YOUTUBE_API_KEY | Env var | `.env.local` | Task 2 |
| ANTHROPIC_API_KEY | Env var | `.env.local` | Task 7 |
| UPSTASH_REDIS_REST_URL | Env var | `.env.local` | Task 7 |
| UPSTASH_REDIS_REST_TOKEN | Env var | `.env.local` | Task 7 |

## 데이터 모델

### Keyword
- id: string (nanoid)
- label: string
- order: number

### Video
- id: string (YouTube videoId)
- title: string
- channelTitle: string
- publishedAt: string (ISO 8601)
- thumbnailUrl: string
- description: string (AI 요약 소스)
- aiSummary?: string

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| next-best-practices | Task 2, 7 | Route Handler 패턴, env var, hydration error 방지 |
| shadcn | Task 3, 4, 6 | Input, Button 컴포넌트 사용 확인 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/keyword.ts` | New | Task 1 |
| `types/video.ts` | New | Task 1 |
| `hooks/use-keyword-store.ts` | New | Task 1 |
| `hooks/use-keyword-store.test.ts` | New | Task 1 |
| `lib/youtube-api.ts` | New | Task 2 |
| `app/api/youtube/route.ts` | New | Task 2 |
| `app/api/youtube/route.test.ts` | New | Task 2 |
| `components/youtube-intent-feed/keyword-chip.tsx` | New | Task 3 |
| `components/youtube-intent-feed/keyword-header.tsx` | New | Task 3 |
| `components/youtube-intent-feed/keyword-header.test.tsx` | New | Task 3 |
| `components/youtube-intent-feed/skeleton-card.tsx` | New | Task 4 |
| `components/youtube-intent-feed/video-card.tsx` | New | Task 4 |
| `components/youtube-intent-feed/video-card.test.tsx` | New | Task 4 |
| `components/youtube-intent-feed/feed-column.tsx` | New | Task 4 |
| `components/youtube-intent-feed/feed-layout.tsx` | New | Task 5 |
| `components/youtube-intent-feed/feed-layout.test.tsx` | New | Task 5 |
| `components/youtube-intent-feed/empty-state.tsx` | New | Task 6 |
| `components/youtube-intent-feed/empty-state.test.tsx` | New | Task 6 |
| `app/api/summarize/route.ts` | New | Task 7 |
| `app/page.tsx` | Modify | Task 8 |
| `e2e/youtube-intent-feed.spec.ts` | New | Task 8 |
| `.env.local` | New | Task 2 |

---

## Tasks

### Task 1: 타입 정의 + 키워드 저장소 훅

- **담당 시나리오**: Scenario 2 (추가 로직), Scenario 3 (최대 6개), Scenario 4 (삭제), Scenario 5 (순서 변경), Scenario 10 (localStorage 영속성)
- **크기**: S (4 files)
- **의존성**: None
- **구현 대상**:
  - `types/keyword.ts`
  - `types/video.ts`
  - `hooks/use-keyword-store.ts`
  - `hooks/use-keyword-store.test.ts`
- **수용 기준**:
  - [ ] "React" 추가 → keywords 배열에 `label: "React"` 항목이 나타난다
  - [ ] 빈 문자열 추가 시도 → keywords 배열이 변경되지 않는다
  - [ ] 공백만 있는 문자열 추가 시도 → keywords 배열이 변경되지 않는다
  - [ ] 이미 존재하는 키워드 추가 시도 → keywords 배열이 변경되지 않는다
  - [ ] 키워드 6개 상태에서 추가 시도 → keywords 배열이 변경되지 않는다
  - [ ] "React" 삭제 → keywords 배열에서 해당 항목이 사라진다
  - [ ] 1번 키워드의 moveRight → 2번 위치로 이동한다
  - [ ] 맨 왼쪽 키워드의 moveLeft → 순서 변경 없음
  - [ ] 맨 오른쪽 키워드의 moveRight → 순서 변경 없음
  - [ ] 2번 키워드의 moveLeft → 1번 위치로 이동한다
  - [ ] localStorage에 keywords 저장 후 훅 재초기화 → 저장된 값이 로드된다
- **검증**: `bun run test -- use-keyword-store`

---

### Task 2: YouTube API Route Handler + unstable_cache ⚠️ 고위험

- **담당 시나리오**: Scenario 6 (영상 로딩), Scenario 9 (API 에러)
- **크기**: S (3 files)
- **의존성**: Task 1 (Video 타입)
- **참조**:
  - next-best-practices — Route Handler, env var
  - YouTube Data API v3 Search: `GET https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&order=relevance&q={keyword}&key={API_KEY}`
  - Next.js `unstable_cache`: `import { unstable_cache } from 'next/cache'` + `{ revalidate: 3600 }`
- **구현 대상**:
  - `lib/youtube-api.ts` (`unstable_cache` 래퍼 — Vercel Data Cache에 1시간 저장)
  - `app/api/youtube/route.ts` (`GET ?keyword=<keyword>` → `{ videos: Video[] }`)
  - `app/api/youtube/route.test.ts`
- **수용 기준**:
  - [ ] `GET /api/youtube?keyword=React` → `{ videos: [...] }` (최대 8개) 반환
  - [ ] 동일 keyword 1시간 내 재요청 → 캐시된 결과 반환 (YouTube API 미호출)
  - [ ] keyword 파라미터 없이 요청 → 400 응답
  - [ ] YouTube API 실패 → 500 응답
  - [ ] `GET /api/youtube` 응답 JSON에 `YOUTUBE_API_KEY` 문자열이 포함되지 않는다
- **검증**: `bun run test -- youtube` 후 `curl "http://localhost:3000/api/youtube?keyword=React"` 로 실제 응답 확인

---

### Task 3: 키워드 헤더 UI (입력 + 칩)

- **담당 시나리오**: Scenario 1 (입력란 포커스), Scenario 2 (추가), Scenario 3 (최대 6개 UI), Scenario 4 (삭제), Scenario 5 (순서 변경)
- **크기**: M (3 files)
- **의존성**: Task 1 (use-keyword-store)
- **참조**:
  - shadcn — Input, Button
  - wireframe.html — Screen 0, Screen 1, Screen 5
- **구현 대상**:
  - `components/youtube-intent-feed/keyword-chip.tsx` (← label → × 버튼)
  - `components/youtube-intent-feed/keyword-header.tsx` (입력란 + 칩 목록)
  - `components/youtube-intent-feed/keyword-header.test.tsx`
- **수용 기준**:
  - [ ] "React" 입력 후 Enter → "React" 칩이 헤더에 나타난다
  - [ ] "React" 입력 후 "+추가" 클릭 → "React" 칩이 헤더에 나타난다
  - [ ] 칩 추가 후 → 입력란이 빈 문자열이 된다
  - [ ] 키워드 6개 상태에서 추가 시도 → "최대 6개까지 추가할 수 있습니다" 메시지가 표시된다
  - [ ] 키워드 6개 상태 → "+추가" 버튼이 비활성화된다
  - [ ] 키워드 6개 상태 → 입력 필드가 비활성화(disabled)된다
  - [ ] "React" 칩의 × 클릭 → 해당 칩이 사라진다
  - [ ] "주식" 칩의 ← 클릭 → 왼쪽 칩과 위치가 바뀐다
  - [ ] 맨 왼쪽 칩의 ← 버튼 → 비활성화(disabled) 상태이다
  - [ ] 맨 오른쪽 칩의 → 버튼 → 비활성화(disabled) 상태이다
- **검증**: `bun run test -- keyword-header`

---

### Checkpoint: Tasks 1–3 이후

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 키워드 CRUD(추가·삭제·순서 변경)가 헤더에서 end-to-end로 동작

---

### Task 4: 영상 카드 + 스켈레톤 + 피드 컬럼

- **담당 시나리오**: Scenario 6 (스켈레톤 로딩), Scenario 7 (영상 클릭), Scenario 9 (에러 상태)
- **크기**: M (4 files)
- **의존성**: Task 1 (Video 타입), Task 2 (Route Handler URL)
- **참조**:
  - wireframe.html — Screen 1 카드, Screen 2 스켈레톤, Screen 4 에러
- **구현 대상**:
  - `components/youtube-intent-feed/skeleton-card.tsx`
  - `components/youtube-intent-feed/video-card.tsx`
  - `components/youtube-intent-feed/video-card.test.tsx`
  - `components/youtube-intent-feed/feed-column.tsx` (loading · data · error 상태 관리, `/api/youtube` 호출)
- **수용 기준**:
  - [ ] 로딩 상태 → 스켈레톤 카드 3개 이상이 표시된다
  - [ ] 영상 카드 → 썸네일, 제목, 채널명, 업로드 날짜가 표시된다
  - [ ] 영상 카드 → "요약 보기" 버튼이 표시된다
  - [ ] 영상 카드 클릭 → `target="_blank"` 링크로 `https://youtube.com/watch?v={id}` 가 설정되어 있다
  - [ ] API 에러 상태 → "영상을 불러오지 못했습니다" 메시지와 "다시 시도" 버튼이 표시된다
  - [ ] "다시 시도" 클릭 → 해당 컬럼이 로딩 상태로 전환된다
- **검증**: `bun run test -- video-card feed-column`

---

### Task 5: 피드 레이아웃 (데스크탑 컬럼 / 모바일 탭)

- **담당 시나리오**: Scenario 11 (모바일 탭 전환), Scenario 6/7/9 (피드 전체 흐름)
- **크기**: M (2 files)
- **의존성**: Task 3 (KeywordHeader), Task 4 (FeedColumn)
- **참조**:
  - wireframe.html — Screen 1 Desktop/Mobile 토글
- **구현 대상**:
  - `components/youtube-intent-feed/feed-layout.tsx`
  - `components/youtube-intent-feed/feed-layout.test.tsx`
- **수용 기준**:
  - [ ] 컨테이너 너비 768px 이상 → 키워드별 컬럼이 수평으로 나란히 표시된다
  - [ ] 컨테이너 너비 768px 미만 → 탭 바가 표시된다
  - [ ] 탭 클릭 → 해당 키워드의 영상 목록이 표시된다
  - [ ] 현재 선택된 탭 → 시각적으로 구분된다
  - [ ] 한 컬럼이 에러 상태일 때 → 나머지 컬럼은 정상 렌더링된다
- **검증**: `bun run test -- feed-layout`

---

### Task 6: 빈 상태 화면 (예시 키워드 제안)

- **담당 시나리오**: Scenario 1 (첫 방문 — 키워드 없음)
- **크기**: S (2 files)
- **의존성**: Task 3 (KeywordHeader onSelect 연결)
- **참조**:
  - wireframe.html — Screen 0
- **구현 대상**:
  - `components/youtube-intent-feed/empty-state.tsx`
  - `components/youtube-intent-feed/empty-state.test.tsx`
- **수용 기준**:
  - [ ] keywords 0개 상태 → 예시 키워드 칩이 3개 이상 표시된다
  - [ ] 예시 키워드 칩 클릭 → onSelect 콜백에 해당 텍스트가 전달된다
  - [ ] keywords 0개 상태 → 영상 컬럼이 표시되지 않는다
- **검증**: `bun run test -- empty-state`

---

### Checkpoint: Tasks 4–6 이후

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] "React" 키워드 추가 → YouTube 영상 8개가 컬럼에 로드되는 end-to-end 흐름 동작
- [ ] Browser MCP — 모바일 뷰포트(375px)에서 탭 UI 확인, 증거 `artifacts/youtube-intent-feed/evidence/checkpoint-2.png` 저장

---

### Task 7: AI 요약 Route Handler + Rate Limiting + 영상 카드 통합 ⚠️ 고위험

- **담당 시나리오**: Scenario 8 (AI 한 줄 요약 생성)
- **크기**: M (2 files + package install)
- **의존성**: Task 4 (VideoCard 컴포넌트), Task 2 (.env.local)
- **참조**:
  - `bun add @anthropic-ai/sdk @upstash/ratelimit @upstash/redis` (미설치 패키지 — Task 시작 전 실행)
  - next-best-practices — Route Handler
  - Upstash Redis: console.upstash.com 무료 DB 생성 → UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 발급
  - wireframe.html — Screen 3
- **구현 대상**:
  - `app/api/summarize/route.ts` (`POST { title, description }` → `{ summary: string }`, IP당 하루 20회 제한)
  - `components/youtube-intent-feed/video-card.tsx` (요약 버튼 로직 추가)
- **수용 기준**:
  - [ ] "요약 보기" 클릭 → 버튼이 로딩 상태로 바뀐다
  - [ ] 요약 생성 완료 → 한 줄 텍스트가 카드에 나타난다
  - [ ] 요약 완료 후 → "요약 보기" 버튼이 사라진다
  - [ ] 요약 API 실패 → 버튼이 "요약 보기" 상태로 복원된다
  - [ ] 동일 IP에서 하루 20회 초과 요청 → 429 응답
  - [ ] `POST /api/summarize` 응답에 `ANTHROPIC_API_KEY` 문자열이 포함되지 않는다
- **검증**: `bun run test -- video-card` + Browser MCP — 실제 AI 요약 생성 및 표시 확인

---

### Task 8: 메인 페이지 통합 + E2E 테스트

- **담당 시나리오**: Scenario 10 (새로고침 후 키워드 유지), 전체 흐름 E2E
- **크기**: M (2 files)
- **의존성**: Task 3, 4, 5, 6, 7 (모든 컴포넌트)
- **참조**:
  - next-best-practices — Hydration error (localStorage는 `useEffect` 이후에만 접근)
- **구현 대상**:
  - `app/page.tsx` (전체 앱 조합, `'use client'`)
  - `e2e/youtube-intent-feed.spec.ts`
- **수용 기준**:
  - [ ] 첫 방문 → 예시 키워드 화면이 표시된다
  - [ ] 키워드 추가 → 영상 컬럼이 나타난다
  - [ ] 페이지 새로고침 → 동일한 키워드와 순서가 유지된다
  - [ ] 페이지 새로고침 → 각 컬럼에서 스켈레톤 UI가 나타나고 영상 목록이 로드된다
  - [ ] 키워드 삭제 → 해당 컬럼이 즉시 사라진다
- **검증**: `bun run test:e2e -- youtube-intent-feed`

---

### Checkpoint: Tasks 7–8 이후 (최종)

- [ ] 모든 테스트 통과: `bun run test`
- [ ] E2E 통과: `bun run test:e2e`
- [ ] 빌드 성공: `bun run build`
- [ ] Browser MCP — 전체 흐름 확인 (키워드 추가 → 영상 로드 → AI 요약 → 새로고침 유지), 증거 `artifacts/youtube-intent-feed/evidence/final.png` 저장

---

## 미결정 항목

없음
