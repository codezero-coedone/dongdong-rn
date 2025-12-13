# Next.js Bridge Integration Guide

## 개요

Guardian 앱(RN)과 Guardian 웹(Next.js) 간의 WebView 브릿지 통신을 구현합니다.
이 문서는 Next.js 프로젝트에서 구현해야 할 내용을 다룹니다.

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    Guardian App (React Native)                   │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │  WebViewContainer                                       │    │
│   │  ┌──────────────────┐    ┌──────────────────────────┐  │    │
│   │  │  useWebViewBridge │───▶│  injectJavaScript()      │  │    │
│   │  │  (RN → Web)       │    │  window.postMessage()    │  │    │
│   │  └──────────────────┘    └──────────────────────────┘  │    │
│   │                                      │                  │    │
│   │  ┌──────────────────┐                │                  │    │
│   │  │  onMessage()     │◀───────────────┘                  │    │
│   │  │  (Web → RN)      │                                   │    │
│   │  └──────────────────┘                                   │    │
│   └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ WebView                           │
│                              ▼                                   │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                   Next.js Web App                       │    │
│   │  ┌──────────────────┐    ┌──────────────────────────┐  │    │
│   │  │  useBridge()     │◀───│  window.addEventListener  │  │    │
│   │  │  (메시지 수신)    │    │  ('message', handler)    │  │    │
│   │  └──────────────────┘    └──────────────────────────┘  │    │
│   │                                                         │    │
│   │  ┌──────────────────────────────────────────────────┐  │    │
│   │  │  ReactNativeWebView.postMessage()                 │  │    │
│   │  │  (Web → RN 전송)                                  │  │    │
│   │  └──────────────────────────────────────────────────┘  │    │
│   └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Next.js 프로젝트 구조

```
dongdong-web/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 홈 대시보드
│   │   ├── caregivers/           # 간병인 검색
│   │   ├── matching/             # 매칭
│   │   ├── chat/                 # 채팅
│   │   ├── payments/             # 결제
│   │   └── my/                   # 마이페이지
│   │
│   ├── lib/
│   │   └── bridge/
│   │       ├── useBridge.ts      # 메인 브릿지 훅
│   │       ├── types.ts          # 브릿지 타입 (RN과 공유)
│   │       ├── context.tsx       # 브릿지 Context Provider
│   │       └── utils.ts          # 유틸리티 함수
│   │
│   ├── providers/
│   │   └── BridgeProvider.tsx    # 앱 전체 Provider
│   │
│   └── types/
│       └── global.d.ts           # window 타입 확장
│
├── package.json
└── tsconfig.json
```

---

## 구현 코드

### 1. Window 타입 확장

```typescript
// src/types/global.d.ts

interface Window {
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
}
```

### 2. 브릿지 타입 정의

```typescript
// src/lib/bridge/types.ts
// (RN의 src/shared/types/bridge.ts와 동기화)

// ============================================
// Message Types
// ============================================

/** RN에서 WebView로 전송하는 메시지 타입 */
export type RNToWebMessageType =
  | 'AUTH_TOKEN'
  | 'USER_INFO'
  | 'PUSH_DATA'
  | 'DEEP_LINK'
  | 'APP_STATE';

/** WebView에서 RN으로 전송하는 메시지 타입 */
export type WebToRNMessageType =
  | 'NAVIGATE'
  | 'LOGOUT'
  | 'OPEN_CAMERA'
  | 'OPEN_GALLERY'
  | 'SHARE'
  | 'HAPTIC'
  | 'ANALYTICS'
  | 'READY';

// ============================================
// Payload Types
// ============================================

export interface AuthTokenPayload {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface UserInfoPayload {
  id: string;
  name: string;
  phone?: string;
  role: 'guardian' | 'patient';
}

export interface NavigatePayload {
  route: string;
  params?: Record<string, unknown>;
}

export interface SharePayload {
  title?: string;
  message: string;
  url?: string;
}

export interface HapticPayload {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

// ============================================
// Message Interface
// ============================================

export interface BridgeMessage<T = unknown> {
  type: RNToWebMessageType | WebToRNMessageType;
  payload: T;
  timestamp: number;
}
```

### 3. 환경 감지 유틸리티

```typescript
// src/lib/bridge/utils.ts

/**
 * WebView 환경인지 확인
 */
export function isInWebView(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.ReactNativeWebView ||
    navigator.userAgent.includes('dongdong-guardian')
  );
}

/**
 * 일반 브라우저 환경인지 확인
 */
export function isInBrowser(): boolean {
  return typeof window !== 'undefined' && !isInWebView();
}

/**
 * 개발 환경인지 확인
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
```

### 4. 메인 브릿지 훅

```typescript
// src/lib/bridge/useBridge.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  BridgeMessage,
  AuthTokenPayload,
  UserInfoPayload,
  WebToRNMessageType,
  SharePayload,
  HapticPayload,
} from './types';
import { isInWebView } from './utils';

interface BridgeState {
  isInApp: boolean;
  isReady: boolean;
  authToken: string | null;
  userInfo: UserInfoPayload | null;
  appState: 'active' | 'background' | 'inactive';
}

export function useBridge() {
  const [state, setState] = useState<BridgeState>({
    isInApp: false,
    isReady: false,
    authToken: null,
    userInfo: null,
    appState: 'active',
  });

  // ============================================
  // RN → Web 메시지 수신
  // ============================================
  useEffect(() => {
    const inApp = isInWebView();
    setState((prev) => ({ ...prev, isInApp: inApp }));

    if (!inApp) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // 메시지 파싱
        const data: BridgeMessage = 
          typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

        if (!data.type || !data.payload) return;

        switch (data.type) {
          case 'AUTH_TOKEN':
            const tokenPayload = data.payload as AuthTokenPayload;
            setState((prev) => ({
              ...prev,
              authToken: tokenPayload.accessToken,
            }));
            break;

          case 'USER_INFO':
            setState((prev) => ({
              ...prev,
              userInfo: data.payload as UserInfoPayload,
            }));
            break;

          case 'APP_STATE':
            setState((prev) => ({
              ...prev,
              appState: (data.payload as { state: string }).state as any,
            }));
            break;

          case 'DEEP_LINK':
            // 딥링크 처리 (라우터로 이동 등)
            console.log('[Bridge] Deep link:', data.payload);
            break;
        }
      } catch (e) {
        // 다른 origin의 메시지는 무시
      }
    };

    window.addEventListener('message', handleMessage);
    
    // WebView 준비 완료 알림
    sendToApp('READY', {});
    setState((prev) => ({ ...prev, isReady: true }));

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ============================================
  // Web → RN 메시지 전송
  // ============================================
  const sendToApp = useCallback(
    <T>(type: WebToRNMessageType, payload: T) => {
      if (!window.ReactNativeWebView) {
        console.warn('[Bridge] Not in WebView environment');
        return;
      }

      const message: BridgeMessage<T> = {
        type,
        payload,
        timestamp: Date.now(),
      };

      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    },
    []
  );

  // ============================================
  // 편의 메서드
  // ============================================
  
  /** 로그아웃 요청 (네이티브에서 처리) */
  const logout = useCallback(() => {
    sendToApp('LOGOUT', {});
  }, [sendToApp]);

  /** 네이티브 화면으로 이동 */
  const navigateNative = useCallback(
    (route: string, params?: Record<string, unknown>) => {
      sendToApp('NAVIGATE', { route, params });
    },
    [sendToApp]
  );

  /** 공유 기능 */
  const share = useCallback(
    (data: SharePayload) => {
      sendToApp('SHARE', data);
    },
    [sendToApp]
  );

  /** 햅틱 피드백 */
  const haptic = useCallback(
    (type: HapticPayload['type']) => {
      sendToApp('HAPTIC', { type });
    },
    [sendToApp]
  );

  /** 분석 이벤트 */
  const trackEvent = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      sendToApp('ANALYTICS', { event, properties });
    },
    [sendToApp]
  );

  return {
    // State
    ...state,
    
    // Actions
    sendToApp,
    logout,
    navigateNative,
    share,
    haptic,
    trackEvent,
  };
}
```

### 5. Bridge Context Provider

```typescript
// src/lib/bridge/context.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useBridge } from './useBridge';

type BridgeContextType = ReturnType<typeof useBridge>;

const BridgeContext = createContext<BridgeContextType | null>(null);

export function BridgeProvider({ children }: { children: ReactNode }) {
  const bridge = useBridge();

  return (
    <BridgeContext.Provider value={bridge}>
      {children}
    </BridgeContext.Provider>
  );
}

export function useBridgeContext() {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridgeContext must be used within BridgeProvider');
  }
  return context;
}
```

### 6. Root Layout 통합

```typescript
// src/app/layout.tsx
import { BridgeProvider } from '@/lib/bridge/context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <BridgeProvider>
          {children}
        </BridgeProvider>
      </body>
    </html>
  );
}
```

---

## 사용 예시

### 컴포넌트에서 사용

```typescript
// src/app/my/page.tsx
'use client';

import { useBridgeContext } from '@/lib/bridge/context';

export default function MyPage() {
  const { isInApp, userInfo, logout, haptic } = useBridgeContext();

  const handleLogout = () => {
    haptic('medium'); // 햅틱 피드백
    logout();         // 네이티브 로그아웃 호출
  };

  return (
    <div>
      <h1>안녕하세요, {userInfo?.name}님</h1>
      
      {isInApp && (
        <button onClick={handleLogout}>
          로그아웃
        </button>
      )}
    </div>
  );
}
```

### 조건부 UI 렌더링

```typescript
// 앱 전용 UI
{isInApp && <AppOnlyComponent />}

// 브라우저 전용 UI  
{!isInApp && <BrowserOnlyComponent />}
```

---

## 타입 공유 전략

### 옵션 1: 단일 소스 복사 (권장 - 빠른 시작)

RN 프로젝트의 타입을 Next.js로 복사:

```bash
# 스크립트로 자동화
cp dongdong-rn/src/shared/types/bridge.ts dongdong-web/src/lib/bridge/types.ts
```

### 옵션 2: 공유 패키지 (권장 - 장기)

```
dongdong/
├── packages/
│   └── shared-types/
│       ├── package.json
│       └── src/
│           └── bridge.ts
├── apps/
│   ├── rn/          # Guardian App
│   └── web/         # Next.js App
└── package.json     # Monorepo root
```

```json
// packages/shared-types/package.json
{
  "name": "@dongdong/shared-types",
  "version": "1.0.0",
  "main": "src/index.ts"
}
```

---

## 테스트 방법

### 1. 개발 환경 테스트

```typescript
// 개발 환경에서 브릿지 시뮬레이션
if (isDev() && !isInWebView()) {
  // Mock 데이터로 테스트
  window.ReactNativeWebView = {
    postMessage: (msg) => console.log('[Mock] postMessage:', msg),
  };
}
```

### 2. 실제 앱 테스트

1. RN 앱 실행: `yarn ios` 또는 `yarn android`
2. Next.js 개발 서버: `yarn dev`
3. RN 앱에서 `WEBVIEW_DEV_URL`을 `http://localhost:3000`로 설정
4. 앱에서 로그인 후 WebView 화면 진입
5. Console에서 브릿지 메시지 확인

---

## 체크리스트

### Next.js 프로젝트 설정

- [ ] `src/types/global.d.ts` 생성
- [ ] `src/lib/bridge/` 폴더 구조 생성
- [ ] `useBridge` 훅 구현
- [ ] `BridgeProvider` Context 설정
- [ ] Root Layout에 Provider 추가

### 통합 테스트

- [ ] 토큰 전달 확인
- [ ] 사용자 정보 수신 확인
- [ ] 로그아웃 요청 동작 확인
- [ ] 햅틱 피드백 동작 확인
- [ ] 공유 기능 동작 확인

---

## 관련 문서

- [Guardian App Architecture](./guardian-app-architecture.md)
- [Auth Flow](./auth-flow.md)
