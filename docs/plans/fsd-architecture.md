# Feature-Sliced Design (FSD) for React Native

## 개요

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션을 위한 아키텍처 방법론입니다.  
코드를 **책임의 범위**와 **비즈니스 도메인**에 따라 체계적으로 구성합니다.

---

## 핵심 개념

### 1. Layers (레이어)

코드를 책임과 의존성에 따라 분리하는 최상위 구조입니다.

```
src/
├── core/         # 앱 초기화, 프로바이더, 글로벌 설정 (Expo Router와 충돌 방지)
├── pages/        # 화면(Screen) 단위 컴포넌트
├── widgets/      # 독립적인 대형 UI 블록
├── features/     # 사용자 상호작용/비즈니스 기능
├── entities/     # 비즈니스 엔티티 (User, Post 등)
└── shared/       # 재사용 가능한 공통 코드
```

### 2. Import Rule (임포트 규칙)

**상위 레이어는 하위 레이어만 참조할 수 있습니다.**

```
core → pages → widgets → features → entities → shared
(상위)                                        (하위)
```

- ✅ `features/`는 `entities/`, `shared/` 임포트 가능
- ❌ `entities/`는 `features/` 임포트 불가
- ❌ 같은 레이어 내 다른 슬라이스 임포트 불가

### 3. Slices (슬라이스)

레이어 내에서 **비즈니스 도메인별**로 코드를 분리합니다.

```
features/
├── auth/           # 인증 관련 기능
├── notification/   # 알림 기능
└── search/         # 검색 기능
```

### 4. Segments (세그먼트)

슬라이스 내에서 **기술적 목적별**로 코드를 분리합니다.

| Segment   | 설명                                |
| --------- | ----------------------------------- |
| `ui/`     | UI 컴포넌트, 스타일                 |
| `api/`    | API 요청 함수                       |
| `model/`  | 상태 관리, 비즈니스 로직, 타입 정의 |
| `lib/`    | 유틸리티 함수                       |
| `config/` | 설정, 환경변수, 피처 플래그         |

---

## React Native 프로젝트 구조

### 전체 폴더 구조

```
dongdong-rn/
├── src/
│   ├── core/                   # 코어 레이어 (Expo Router와 충돌 방지를 위해 app 대신 core 사용)
│   │   ├── providers/          # Context Providers
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── index.ts
│   │   ├── navigation/         # 네비게이션 설정
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── TabNavigator.tsx
│   │   │   └── index.ts
│   │   ├── styles/             # 글로벌 스타일
│   │   │   └── global.ts
│   │   └── index.ts
│   │
│   ├── pages/                  # 페이지(화면) 레이어
│   │   ├── home/
│   │   │   ├── ui/
│   │   │   │   └── HomeScreen.tsx
│   │   │   ├── api/
│   │   │   │   └── queries.ts
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── ui/
│   │   │   │   └── ProfileScreen.tsx
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   ├── ui/
│   │   │   │   └── SettingsScreen.tsx
│   │   │   └── index.ts
│   │   └── auth/
│   │       ├── ui/
│   │       │   ├── LoginScreen.tsx
│   │       │   └── SignUpScreen.tsx
│   │       └── index.ts
│   │
│   ├── widgets/                # 위젯 레이어
│   │   ├── header/
│   │   │   ├── ui/
│   │   │   │   └── Header.tsx
│   │   │   └── index.ts
│   │   ├── bottom-sheet/
│   │   │   ├── ui/
│   │   │   │   └── BottomSheet.tsx
│   │   │   └── index.ts
│   │   └── feed-list/
│   │       ├── ui/
│   │       │   └── FeedList.tsx
│   │       ├── model/
│   │       │   └── useFeedList.ts
│   │       └── index.ts
│   │
│   ├── features/               # 기능 레이어
│   │   ├── auth/
│   │   │   ├── ui/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SocialLoginButtons.tsx
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   ├── model/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── authStore.ts
│   │   │   └── index.ts
│   │   ├── notification/
│   │   │   ├── ui/
│   │   │   │   └── NotificationBadge.tsx
│   │   │   ├── api/
│   │   │   │   └── notificationApi.ts
│   │   │   ├── model/
│   │   │   │   └── useNotification.ts
│   │   │   └── index.ts
│   │   └── search/
│   │       ├── ui/
│   │       │   ├── SearchBar.tsx
│   │       │   └── SearchResults.tsx
│   │       ├── api/
│   │       │   └── searchApi.ts
│   │       ├── model/
│   │       │   └── useSearch.ts
│   │       └── index.ts
│   │
│   ├── entities/               # 엔티티 레이어
│   │   ├── user/
│   │   │   ├── ui/
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── UserCard.tsx
│   │   │   ├── api/
│   │   │   │   └── userApi.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── userStore.ts
│   │   │   └── index.ts
│   │   ├── post/
│   │   │   ├── ui/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   └── PostContent.tsx
│   │   │   ├── api/
│   │   │   │   └── postApi.ts
│   │   │   ├── model/
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   └── comment/
│   │       ├── ui/
│   │       │   └── CommentItem.tsx
│   │       ├── model/
│   │       │   └── types.ts
│   │       └── index.ts
│   │
│   └── shared/                 # 공유 레이어
│       ├── ui/                 # UI Kit
│       │   ├── button/
│       │   │   ├── Button.tsx
│       │   │   └── index.ts
│       │   ├── input/
│       │   │   ├── TextInput.tsx
│       │   │   └── index.ts
│       │   ├── typography/
│       │   │   ├── Text.tsx
│       │   │   └── index.ts
│       │   ├── layout/
│       │   │   ├── Container.tsx
│       │   │   ├── Spacer.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── api/                # API 클라이언트
│       │   ├── client.ts
│       │   ├── interceptors.ts
│       │   └── index.ts
│       ├── lib/                # 유틸리티 라이브러리
│       │   ├── date/
│       │   │   └── formatDate.ts
│       │   ├── storage/
│       │   │   └── asyncStorage.ts
│       │   ├── validation/
│       │   │   └── validators.ts
│       │   └── index.ts
│       ├── config/             # 설정
│       │   ├── env.ts
│       │   ├── constants.ts
│       │   └── index.ts
│       ├── hooks/              # 공통 훅
│       │   ├── useDebounce.ts
│       │   ├── useKeyboard.ts
│       │   └── index.ts
│       ├── types/              # 공통 타입
│       │   └── index.ts
│       └── assets/             # 정적 리소스
│           ├── images/
│           ├── fonts/
│           └── icons/
│
├── app/                        # Expo Router (기존 유지)
│   ├── (tabs)/
│   ├── _layout.tsx
│   └── modal.tsx
│
├── docs/
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Expo Router와의 통합

### 라우팅 구조

Expo Router의 파일 기반 라우팅을 유지하면서, 실제 화면 로직은 `src/pages`에서 관리합니다.

```tsx
// app/(tabs)/index.tsx
export { HomeScreen as default } from "@/pages/home";

// app/(tabs)/profile.tsx
export { ProfileScreen as default } from "@/pages/profile";

// app/auth/login.tsx
export { LoginScreen as default } from "@/pages/auth";
```

### 경로 별칭 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/shared/*": ["src/shared/*"],
      "@/entities/*": ["src/entities/*"],
      "@/features/*": ["src/features/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/pages/*": ["src/pages/*"],
      "@/core/*": ["src/core/*"]
    }
  }
}
```

---

## Public API 규칙

각 슬라이스는 `index.ts`를 통해 외부로 노출할 항목만 export합니다.

```tsx
// src/features/auth/index.ts
export { LoginForm } from "./ui/LoginForm";
export { SocialLoginButtons } from "./ui/SocialLoginButtons";
export { useAuth } from "./model/useAuth";
export type { AuthState } from "./model/authStore";

// 내부 구현은 export하지 않음
// authApi.ts는 내부에서만 사용
```

### Import 예시

```tsx
// ✅ Good - Public API를 통한 import
import { LoginForm, useAuth } from "@/features/auth";
import { UserAvatar } from "@/entities/user";
import { Button } from "@/shared/ui";

// ❌ Bad - 내부 파일 직접 import
import { LoginForm } from "@/features/auth/ui/LoginForm";
```

---

## 세그먼트별 역할

### `ui/` - UI 컴포넌트

```tsx
// src/entities/user/ui/UserAvatar.tsx
interface UserAvatarProps {
  imageUrl: string;
  size?: "sm" | "md" | "lg";
}

export const UserAvatar = ({ imageUrl, size = "md" }: UserAvatarProps) => {
  // 순수 UI 렌더링만 담당
};
```

### `api/` - API 요청

```tsx
// src/entities/user/api/userApi.ts
import { apiClient } from "@/shared/api";

export const userApi = {
  getProfile: (userId: string) => apiClient.get(`/users/${userId}`),
  updateProfile: (data: UpdateProfileDto) => apiClient.patch("/users/me", data),
};
```

### `model/` - 상태 및 비즈니스 로직

```tsx
// src/features/auth/model/useAuth.ts
import { create } from "zustand";
import { authApi } from "../api/authApi";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  // 상태 관리 로직
}));
```

### `lib/` - 유틸리티

```tsx
// src/shared/lib/date/formatDate.ts
export const formatDate = (date: Date, format: string): string => {
  // 날짜 포맷팅 로직
};
```

---

## 레이어별 가이드라인

| Layer        | 용도                              | 예시                                   |
| ------------ | --------------------------------- | -------------------------------------- |
| **core**     | 앱 초기화, 프로바이더, 네비게이션 | `AuthProvider`, `ThemeProvider`        |
| **pages**    | 화면 단위 조합                    | `HomeScreen`, `ProfileScreen`          |
| **widgets**  | 독립적 대형 UI                    | `Header`, `FeedList`, `BottomSheet`    |
| **features** | 사용자 액션/기능                  | `LoginForm`, `SearchBar`, `LikeButton` |
| **entities** | 비즈니스 엔티티                   | `User`, `Post`, `Comment`              |
| **shared**   | 재사용 기반 코드                  | `Button`, `apiClient`, `formatDate`    |

---

## 마이그레이션 체크리스트

### Phase 1: 기반 구조 설정

- [ ] `src/` 폴더 구조 생성
- [ ] `tsconfig.json` 경로 별칭 설정
- [ ] `shared/` 레이어 구성 (ui, api, lib, config)

### Phase 2: 공통 요소 마이그레이션

- [ ] 기존 `components/` → `shared/ui/`
- [ ] 기존 `hooks/` → `shared/hooks/`
- [ ] 기존 `constants/` → `shared/config/`

### Phase 3: 비즈니스 로직 분리

- [ ] Entities 정의 및 구현
- [ ] Features 정의 및 구현
- [ ] Widgets 정의 및 구현

### Phase 4: 페이지 리팩토링

- [ ] 각 화면을 `pages/` 슬라이스로 이동
- [ ] Expo Router 파일에서 re-export 설정

---

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Layers Reference](https://feature-sliced.design/docs/reference/layers)
- [FSD Slices & Segments](https://feature-sliced.design/docs/reference/slices-segments)
