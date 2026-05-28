# youtube-intent-feed Learnings

구현 중 예상과 달랐던 것, 우회했던 것, 다시 마주치고 싶지 않은 것만 기록한다.

---
category: task-ordering
applied: not-yet
---
## useState + 동일 act() 내 연속 호출 시 stale closure

**상황**: Task 1, `add()` 함수에서 중복/최대 체크를 `keywords` state 직접 참조
**판단**: `setKeywords(prev => ...)` functional update 안으로 체크를 이동해 해결. 동일 `act()` 내 연속 상태 변경이 있는 훅 함수는 항상 functional update 안에서 validation해야 함.
**다시 마주칠 가능성**: 높음 — CRUD 훅을 작성할 때마다 동일 패턴 재발 가능
