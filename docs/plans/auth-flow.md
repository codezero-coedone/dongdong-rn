# 인증 플로우 (Auth Flow) 계획

## 개요

비로그인/로그인 사용자의 화면을 분리하고, Expo Router의 그룹 라우팅을 활용하여 인증 플로우를 구현합니다.

---

## 라우팅 구조

### Route Groups 설계

```
app/
├── _layout.tsx              # Root Layout (Auth 상태 체크)
├── (auth)/                  # 비로그인 사용자용 그룹
│   ├── _layout.tsx
│   ├── login.tsx            # 로그인 화면
│   ├── signup.tsx           # 회원가입 화면
│   └── onboarding.tsx       # 온보딩 화면 (선택)
├── (tabs)/                  # 로그인 사용자용 탭 네비게이션
│   ├── _layout.tsx
│   ├── index.tsx            # 홈
│   └── explore.tsx          # 탐색
└── modal.tsx                # 공통 모달
```

### 라우팅 플로우

```
┌─────────────────────────────────────────────────────────┐
│                    App 시작                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              인증 상태 확인 (isAuthenticated)            │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│   비로그인 상태   │             │   로그인 상태    │
│   (auth) 그룹    │             │   (tabs) 그룹   │
│   - Login       │             │   - Home        │
│   - Signup      │             │   - Explore     │
│   - Onboarding  │             │   - Profile     │
└─────────────────┘             └─────────────────┘
```

---

## FSD 구조 적용

### 폴더 구조

```
src/
├── app/
│   └── providers/
│       └── AuthProvider.tsx      # 인증 Context Provider
│
├── features/
│   └── auth/
│       ├── ui/
│       │   ├── LoginForm.tsx     # 로그인 폼 컴포넌트
│       │   └── SignupForm.tsx    # 회원가입 폼 컴포넌트
│       ├── model/
│       │   ├── useAuth.ts        # 인증 상태 관리 훅
│       │   ├── authStore.ts      # Zustand 스토어
│       │   └── types.ts          # 타입 정의
│       ├── api/
│       │   └── authApi.ts        # 인증 API 함수
│       └── index.ts              # Public API
│
├── pages/
│   └── auth/
│       ├── ui/
│       │   ├── LoginScreen.tsx
│       │   └── SignupScreen.tsx
│       └── index.ts
│
└── shared/
    └── lib/
        └── storage/
            └── secureStorage.ts  # 토큰 저장 (expo-secure-store)
```

---

## 구현 계획

### Phase 1: 기반 구조 설정

1. **필요 패키지 설치**

   - `zustand` - 상태 관리
   - `expo-secure-store` - 토큰 안전 저장

2. **FSD 폴더 구조 생성**
   ```
   src/
   ├── features/auth/
   └── shared/lib/storage/
   ```

### Phase 2: 인증 상태 관리

1. **Auth Store 구현** (`src/features/auth/model/authStore.ts`)

   ```typescript
   interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     login: (email: string, password: string) => Promise<void>;
     logout: () => void;
     checkAuth: () => Promise<void>;
   }
   ```

2. **Auth Provider 구현** (`src/app/providers/AuthProvider.tsx`)
   - 앱 시작 시 저장된 토큰 확인
   - 인증 상태 전역 제공

### Phase 3: Route Groups 구현

1. **Root Layout 수정** (`app/_layout.tsx`)

   - AuthProvider 래핑
   - 인증 상태에 따른 리다이렉션

2. **(auth) 그룹 생성** (`app/(auth)/`)

   - `_layout.tsx` - Stack 네비게이션
   - `login.tsx` - 로그인 화면
   - `signup.tsx` - 회원가입 화면

3. **(tabs) 그룹 유지** (`app/(tabs)/`)
   - 기존 탭 네비게이션 유지

### Phase 4: 화면 구현

1. **로그인 화면**

   - 이메일/비밀번호 입력
   - 로그인 버튼
   - 회원가입 링크

2. **회원가입 화면**
   - 이메일/비밀번호/이름 입력
   - 가입 버튼
   - 로그인 링크

---

## 파일별 구현 순서

| 순서 | 파일                                      | 설명               |
| ---- | ----------------------------------------- | ------------------ |
| 1    | `src/features/auth/model/types.ts`        | 타입 정의          |
| 2    | `src/features/auth/model/authStore.ts`    | Zustand 스토어     |
| 3    | `src/shared/lib/storage/secureStorage.ts` | 토큰 저장 유틸     |
| 4    | `src/features/auth/index.ts`              | Public API         |
| 5    | `app/(auth)/_layout.tsx`                  | Auth 그룹 레이아웃 |
| 6    | `app/(auth)/login.tsx`                    | 로그인 화면        |
| 7    | `app/(auth)/signup.tsx`                   | 회원가입 화면      |
| 8    | `app/_layout.tsx`                         | Root Layout 수정   |

---

## 코드 예시

### Root Layout 인증 가드

```tsx
// app/_layout.tsx
import { useAuth } from "@/features/auth";
import { useRouter, useSegments } from "expo-router";

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // 비로그인 상태 + 인증 그룹 밖 → 로그인 페이지로
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // 로그인 상태 + 인증 그룹 안 → 홈으로
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

---

## 체크리스트

### 설정

- [x] `zustand` 패키지 설치
- [x] `expo-secure-store` 패키지 설치
- [x] FSD 폴더 구조 생성

### 인증 로직

- [x] Auth Store 구현
- [x] Secure Storage 유틸 구현
- [ ] Auth Provider 구현 (선택사항 - 현재 Zustand로 대체)

### 라우팅

- [x] `(auth)` 그룹 생성
- [x] Root Layout 인증 가드 구현
- [x] 로그인/회원가입 화면 구현

### 테스트

- [ ] 비로그인 → 로그인 페이지 리다이렉트 확인
- [ ] 로그인 후 → 홈 리다이렉트 확인
- [ ] 앱 재시작 시 토큰 유지 확인
