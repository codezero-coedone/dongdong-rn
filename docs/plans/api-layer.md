# API Layer 설계 (Axios + TanStack Query)

## 개요

Axios와 TanStack Query(React Query)를 도입하여 API 통신 및 서버 상태 관리를 구현합니다.

---

## 기술 스택

| 라이브러리              | 버전   | 용도               |
| ----------------------- | ------ | ------------------ |
| `axios`                 | latest | HTTP 클라이언트    |
| `@tanstack/react-query` | v5     | 서버 상태 관리     |
| `expo-network`          | latest | 네트워크 상태 감지 |

---

## Best Practices 적용

### 1. Axios 설정

#### 핵심 기능

- **Base URL 설정**: 환경별 API URL 관리
- **Timeout 설정**: 60초 기본값으로 무한 대기 방지
- **Request Interceptor**: 모든 요청에 자동으로 Auth Token 추가
- **Response Interceptor**: 401 에러 시 토큰 갱신 및 요청 재시도

#### Token Refresh 전략

```
요청 실패 (401)
    │
    ▼
토큰 갱신 중인가?
    │
    ├─ Yes → 요청을 큐에 추가
    │         갱신 완료 후 재시도
    │
    └─ No → 토큰 갱신 시작
              │
              ├─ 성공 → 대기 중인 요청 모두 재시도
              │
              └─ 실패 → 로그아웃 처리
```

### 2. TanStack Query 설정

#### React Native 최적화

- **Online Status Management**: `expo-network`로 네트워크 연결 상태 감지
- **Refetch on App Focus**: AppState로 앱 포커스 시 자동 갱신
- **Screen Focus Refetch**: 화면 포커스 시 stale 데이터 갱신

#### 기본 옵션

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      gcTime: 1000 * 60 * 5, // 5분 (이전 cacheTime)
      retry: 2, // 재시도 2회
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

---

## FSD 폴더 구조

```
src/
├── shared/
│   ├── api/
│   │   ├── client.ts           # Axios 인스턴스 및 인터셉터
│   │   ├── queryClient.ts      # TanStack Query Client
│   │   ├── types.ts            # API 공통 타입
│   │   └── index.ts
│   ├── lib/
│   │   └── react-query/
│   │       ├── QueryProvider.tsx    # Provider 컴포넌트
│   │       ├── useAppState.ts       # App Focus 훅
│   │       ├── useOnlineManager.ts  # 네트워크 상태 훅
│   │       └── index.ts
│   └── config/
│       └── env.ts              # 환경 변수
│
├── features/
│   └── auth/
│       └── api/
│           └── authApi.ts      # 인증 API (로그인, 토큰 갱신)
│
└── entities/
    └── [entity]/
        └── api/
            └── [entity]Api.ts  # 엔티티별 API
            └── queries.ts      # React Query 훅
```

---

## 구현 파일 목록

### Phase 1: 기반 설정

| 파일                            | 설명              |
| ------------------------------- | ----------------- |
| `src/shared/config/env.ts`      | 환경 변수 설정    |
| `src/shared/api/types.ts`       | API 공통 타입     |
| `src/shared/api/client.ts`      | Axios 인스턴스    |
| `src/shared/api/queryClient.ts` | Query Client 설정 |
| `src/shared/api/index.ts`       | Public API        |

### Phase 2: React Query Provider

| 파일                                             | 설명               |
| ------------------------------------------------ | ------------------ |
| `src/shared/lib/react-query/useOnlineManager.ts` | 네트워크 상태 관리 |
| `src/shared/lib/react-query/useAppState.ts`      | 앱 포커스 관리     |
| `src/shared/lib/react-query/QueryProvider.tsx`   | Provider 컴포넌트  |
| `src/shared/lib/react-query/index.ts`            | Public API         |

### Phase 3: Root Layout 통합

| 파일              | 설명               |
| ----------------- | ------------------ |
| `app/_layout.tsx` | QueryProvider 래핑 |

---

## 사용 예시

### Query 훅 정의

```typescript
// src/entities/post/api/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "./postApi";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export const usePostsQuery = (filters?: string) => {
  return useQuery({
    queryKey: postKeys.list(filters ?? ""),
    queryFn: () => postApi.getPosts(filters),
  });
};

export const usePostQuery = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.getPost(id),
    enabled: !!id,
  });
};
```

### 컴포넌트에서 사용

```typescript
// 어떤 화면에서
import { usePostsQuery } from "@/entities/post";

export function PostListScreen() {
  const { data, isLoading, error, refetch } = usePostsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;

  return <PostList posts={data} />;
}
```

---

## 체크리스트

### 패키지 설치

- [x] `axios` 설치
- [x] `@tanstack/react-query` 설치
- [x] `expo-network` 설치

### 구현

- [x] 환경 변수 설정 (`src/shared/config/env.ts`)
- [x] Axios 인스턴스 생성 (`src/shared/api/client.ts`)
- [x] Request Interceptor (토큰 추가)
- [x] Response Interceptor (401 처리, 토큰 갱신 로직)
- [x] Query Client 설정 (`src/shared/api/queryClient.ts`)
- [x] Online Manager 훅 (`src/shared/lib/react-query/useOnlineManager.ts`)
- [x] App State 훅 (`src/shared/lib/react-query/useAppState.ts`)
- [x] Query Provider 컴포넌트 (`src/shared/lib/react-query/QueryProvider.tsx`)
- [x] Root Layout 통합 (`app/_layout.tsx`)
- [x] 예제 Entity 생성 (`src/entities/post/`)
