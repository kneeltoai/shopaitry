# Claude Behavior Rules

- Be concise. No explanations unless asked.
- No pleasantries or filler text.
- Code only, minimal comments.
- Don't summarize what you just did.

---

# Shopaitry — Claude Code 프로젝트 가이드

> **이 파일은 Claude Code가 세션 시작 시 자동으로 읽는 프로젝트 컨텍스트 파일입니다.**
> 마지막 업데이트: 2026-03-25

---

## 서비스 개요

**Shopaitry**는 URL을 붙여넣으면 상품 이미지·제목을 자동 추출해 Pinterest 스타일 카드로 정리하는 개인 쇼핑 위시보드입니다.

- 라이브: https://shopaitry.vercel.app
- 리포: 프로젝트 루트 = 이 파일이 위치한 디렉토리

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프레임워크 | Next.js (App Router) | TypeScript 사용 |
| 스타일링 | Tailwind CSS | |
| DB / Auth | Supabase (PostgreSQL + Magic Link) | |
| 배포 | Vercel | Git push → 자동 배포 |

---

## 디렉토리 구조 (핵심)

```
/
├── app/                  # Next.js App Router 페이지
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/              # API Route Handlers
├── components/           # ★ 모든 UI 컴포넌트는 여기에
├── lib/                  # 유틸리티, Supabase 클라이언트 등
├── supabase/
│   └── migrations/       # ★ DB 변경은 반드시 마이그레이션 파일로
├── public/               # 정적 자산
├── claude.md             # ← 이 파일
└── package.json
```

---

## DB 스키마 (현재)

```sql
-- items 테이블
CREATE TABLE items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url         TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  thumbnail_url TEXT,
  user_id     UUID REFERENCES auth.users(id),
  board_id    UUID REFERENCES boards(id),
  status      TEXT DEFAULT 'wish',  -- 'wish' | 'to_buy' | 'bought'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- boards 테이블
CREATE TABLE boards (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책: 각 테이블에 user_id 기반 SELECT/INSERT/UPDATE/DELETE 정책 적용 중
```

---

## 절대 규칙 (HARD RULES)

위반 시 즉시 작업을 중단하고 사용자에게 확인을 요청합니다.

### 1. DB 직접 수정 금지
- Supabase 대시보드에서 직접 ALTER TABLE, INSERT 등 실행 **금지**
- 모든 스키마 변경은 `supabase/migrations/` 폴더에 타임스탬프 마이그레이션 SQL 파일 생성
- 파일명 형식: `YYYYMMDDHHMMSS_description.sql`

### 2. 스크래핑 로직 보존
- URL → OG 메타데이터 추출 로직은 **현재 정상 작동 중**
- 해당 코드를 수정, 리팩토링, 이동하지 않음
- 위치: (API route 내 스크래핑 핸들러 — 변경 전 반드시 확인)

### 3. 컴포넌트 분리
- 모든 새 UI 컴포넌트는 `/components` 폴더에 생성
- 페이지 파일(`app/*/page.tsx`)에 컴포넌트 로직을 인라인하지 않음
- 파일명: PascalCase (예: `ItemCard.tsx`, `BoardSidebar.tsx`)

### 4. TypeScript 엄격 준수
- `any` 타입 사용 금지 — 명시적 타입 또는 인터페이스 정의
- Supabase 관련 타입은 `lib/types.ts` 또는 자동생성된 타입 파일 참조

### 5. 환경변수
- 새 환경변수 추가 시 `.env.local.example`에 키 이름 추가
- 시크릿은 절대 코드에 하드코딩하지 않음

---

## 코딩 컨벤션

### 일반
- 들여쓰기: 2 spaces
- 세미콜론: 사용
- 따옴표: 작은따옴표 (`'`)
- 함수형 컴포넌트 + React hooks 사용 (클래스 컴포넌트 금지)

### 네이밍
| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일/이름 | PascalCase | `ItemCard.tsx` |
| 유틸 함수 | camelCase | `fetchMetadata()` |
| DB 컬럼 | snake_case | `thumbnail_url` |
| 환경변수 | SCREAMING_SNAKE | `NEXT_PUBLIC_SUPABASE_URL` |
| CSS 클래스 | Tailwind 유틸리티 | 커스텀 CSS 최소화 |

### Supabase 패턴
```typescript
// 클라이언트 사이드
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

// 서버 사이드 (Route Handler / Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createServerComponentClient({ cookies });
```

### 에러 핸들링
- API route: try-catch로 감싸고 적절한 HTTP 상태코드 반환
- 클라이언트: 사용자에게 toast 또는 인라인 에러 메시지 표시
- console.error로 디버깅 로그 남기기

---

## 현재 완료된 기능

- [x] URL 입력 → OG 메타데이터 스크래핑 → 카드 표시
- [x] Supabase 연결 + Magic Link 인증
- [x] Vercel 배포 + 라이브 상태

## 미해결 사항 (참고용)

- 카테고리/태그 시스템 없음
- 보드 UI 없음 (데이터만 존재)
- 모바일 반응형 미완
- og:image 없는 사이트 썸네일 빈 공간
- Magic Link 이메일 rate limit 이슈

---

## 작업 시 체크리스트

새 기능 구현 전 아래를 확인합니다:

1. ✅ 이 파일(`claude.md`)을 읽었는가?
2. ✅ 기존 코드 구조를 `tree` 또는 파일 탐색으로 파악했는가?
3. ✅ 스키마 변경이 필요하면 마이그레이션 파일을 준비했는가?
4. ✅ 스크래핑 로직을 건드리지 않는가?
5. ✅ 새 컴포넌트를 `/components`에 만들었는가?
6. ✅ TypeScript 타입을 명시했는가?
