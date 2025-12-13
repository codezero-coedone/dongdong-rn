# Guardian App Architecture (환자/보호자용 앱)

## 개요

환자/보호자용 앱은 **네이티브 인증 + WebView 하이브리드** 구조로 설계합니다.
인증(로그인/회원가입)은 네이티브로 구현하여 보안과 UX를 확보하고, 나머지 기능은 WebView로 제공하여 빠른 배포와 유연한 업데이트를 가능하게 합니다.

---

## 프로젝트 구조

| 앱 | 프로젝트 | 패키지명 |
|----|---------|----------|
| **환자/보호자용 (Guardian)** | `dongdong-rn` (현재 프로젝트) | `kr.slicemind.dongdong.guardian` |
| **간병인용 (Caregiver)** | 별도 프로젝트 | `kr.slicemind.dongdong.caregiver` |
| **Web App** | `dongdong-web` (Next.js) | - |

## 패키지 정보

| 항목 | 값 |
|------|-----|
| **패키지명 (Android)** | `kr.slicemind.dongdong.guardian` |
| **Bundle ID (iOS)** | `kr.slicemind.dongdong.guardian` |
| **앱 이름** | 동동 (보호자) |

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Guardian App (React Native)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    네이티브 레이어 (Native Layer)                    │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                     │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │   │
│   │   │   인증 관리   │  │   토큰 저장   │  │    푸시 알림 (FCM)      │ │   │
│   │   │  (Kakao/Apple)│  │(SecureStore) │  │                          │ │   │
│   │   └──────────────┘  └──────────────┘  └──────────────────────────┘ │   │
│   │                                                                     │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │   │
│   │   │  딥링크 처리  │  │  앱 상태 관리 │  │    네이티브 브릿지       │ │   │
│   │   │              │  │              │  │  (WebView ↔ RN 통신)    │ │   │
│   │   └──────────────┘  └──────────────┘  └──────────────────────────┘ │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      WebView 레이어 (Web Layer)                      │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                     │   │
│   │   ┌──────────────────────────────────────────────────────────────┐  │   │
│   │   │                      Next.js Web App                          │  │   │
│   │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │   │
│   │   │  │   홈     │ │  간병   │ │  결제   │ │  채팅/상담      │  │  │   │
│   │   │  │  대시보드 │ │  매칭   │ │  결제   │ │                  │  │  │   │
│   │   │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │   │
│   │   └──────────────────────────────────────────────────────────────┘  │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 네이티브 vs WebView 기능 분리

### 네이티브로 구현할 기능

| 기능 | 이유 |
|------|------|
| **로그인 (카카오/애플)** | 네이티브 SDK 필요, 보안 중요 |
| **회원가입** | 본인인증, 약관동의 등 복잡한 플로우 |
| **토큰 관리** | Secure Storage 활용 필요 |
| **푸시 알림** | 네이티브 SDK 필요 (FCM/APNs) |
| **딥링크 처리** | 앱 진입점 제어 |
| **스플래시/온보딩** | 첫 사용자 경험 |

### WebView로 구현할 기능

| 기능 | 이유 |
|------|------|
| **홈 대시보드** | 빈번한 UI 업데이트 가능 |
| **간병인 검색/매칭** | 복잡한 필터링 UI, 빠른 기능 추가 |
| **간병 상세 정보** | 상세 정보 표시, A/B 테스트 용이 |
| **결제** | PG 연동, 규제 대응 유연성 |
| **채팅** | 실시간 통신 처리 |
| **마이페이지** | 설정, 프로필 관리 |
| **공지사항/FAQ** | 컨텐츠 업데이트 용이 |

---

## 라우팅 구조

### React Native (Expo Router)

```
app/
├── _layout.tsx                  # Root Layout (Auth Guard)
├── (auth)/                      # 네이티브 인증 화면
│   ├── _layout.tsx
│   ├── login.tsx                # 로그인 (카카오/애플)
│   ├── signup/
│   │   ├── info.tsx             # 기본 정보 입력
│   │   ├── phone-verify.tsx     # 휴대폰 인증
│   │   └── terms.tsx            # 약관 동의
│   └── onboarding/
│       ├── step1.tsx            # 역할 선택
│       ├── step2.tsx            # 환자 정보 입력
│       └── step3.tsx            # 환자 상태 입력
└── (main)/                      # 로그인 후 메인 화면
    ├── _layout.tsx
    └── index.tsx                # WebView Container
```

### WebView 내부 라우트 (Next.js)

```
/                               # 홈 대시보드
/caregivers                     # 간병인 검색/목록
/caregivers/:id                 # 간병인 상세
/matching                       # 간병 매칭 요청
/matching/:id                   # 매칭 상세
/chat                           # 채팅 목록
/chat/:id                       # 채팅방
/payments                       # 결제 내역
/payments/checkout              # 결제 진행
/my                             # 마이페이지
/my/profile                     # 프로필 수정
/my/patients                    # 환자 관리
/notices                        # 공지사항
/faq                            # FAQ
```

---

## WebView 브릿지 설계

### React Native → WebView 통신

```typescript
// 토큰 전달
webViewRef.current?.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: 'AUTH_TOKEN',
    payload: { accessToken: '${token}' }
  }), '*');
`);

// 사용자 정보 전달
webViewRef.current?.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: 'USER_INFO',
    payload: ${JSON.stringify(user)}
  }), '*');
`);
```

### WebView → React Native 통신

```typescript
// WebView onMessage 핸들러
const handleMessage = (event: WebViewMessageEvent) => {
  const { type, payload } = JSON.parse(event.nativeEvent.data);
  
  switch (type) {
    case 'NAVIGATE':
      // 네이티브 화면으로 이동 (예: 로그아웃 → 로그인 화면)
      router.replace(payload.route);
      break;
    case 'LOGOUT':
      // 로그아웃 처리
      authStore.logout();
      break;
    case 'OPEN_NATIVE':
      // 네이티브 기능 호출 (카메라, 갤러리 등)
      handleNativeAction(payload);
      break;
    case 'SHARE':
      // 공유 기능
      Share.share(payload);
      break;
  }
};
```

### 브릿지 메시지 타입 정의

```typescript
// src/shared/types/bridge.ts

type BridgeMessageType =
  // RN → WebView
  | 'AUTH_TOKEN'      // 인증 토큰 전달
  | 'USER_INFO'       // 사용자 정보 전달
  | 'PUSH_DATA'       // 푸시 알림 데이터
  | 'DEEP_LINK'       // 딥링크 데이터
  
  // WebView → RN
  | 'NAVIGATE'        // 네이티브 화면 이동
  | 'LOGOUT'          // 로그아웃 요청
  | 'OPEN_NATIVE'     // 네이티브 기능 호출
  | 'SHARE'           // 공유
  | 'HAPTIC'          // 햅틱 피드백
  | 'ANALYTICS';      // 분석 이벤트

interface BridgeMessage<T = unknown> {
  type: BridgeMessageType;
  payload: T;
  timestamp: number;
}
```

---

## 보안 설계

### 토큰 관리

```typescript
// 토큰 저장 (Secure Storage)
await SecureStore.setItemAsync('accessToken', token.accessToken);
await SecureStore.setItemAsync('refreshToken', token.refreshToken);

// WebView로 토큰 전달 시 주의사항
// - 토큰은 postMessage로 전달, URL 파라미터로 전달 금지
// - HTTPS만 허용
// - allowedOrigins 설정
```

### WebView 보안 설정

```tsx
<WebView
  source={{ uri: WEB_APP_URL }}
  originWhitelist={['https://*']}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  thirdPartyCookiesEnabled={false}
  allowsBackForwardNavigationGestures={true}
  onShouldStartLoadWithRequest={(request) => {
    // 허용된 도메인만 로드
    return isAllowedDomain(request.url);
  }}
/>
```

---

## 딥링크 설계

### URL Scheme

```
dongdong-guardian://                    # 앱 열기
dongdong-guardian://caregiver/:id       # 간병인 상세
dongdong-guardian://matching/:id        # 매칭 상세
dongdong-guardian://chat/:id            # 채팅방
dongdong-guardian://payments/:id        # 결제 상세
```

### Universal Links (iOS) / App Links (Android)

```
https://guardian.dongdong.kr/caregiver/:id
https://guardian.dongdong.kr/matching/:id
https://guardian.dongdong.kr/chat/:id
```

### 딥링크 처리 Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   딥링크     │ ──▶ │   App Open  │ ──▶ │  Auth Check │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                          ┌────────────────────┴────────────────────┐
                          │                                         │
                          ▼                                         ▼
                 ┌─────────────────┐                     ┌─────────────────┐
                 │   인증 안됨      │                     │   인증됨        │
                 │   → 로그인 화면  │                     │                 │
                 │   (딥링크 저장)  │                     │                 │
                 └─────────────────┘                     └─────────────────┘
                          │                                         │
                          ▼                                         │
                 ┌─────────────────┐                                │
                 │   로그인 완료   │                                 │
                 │   → 저장된      │ ◀─────────────────────────────┘
                 │    딥링크로 이동 │
                 └─────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   WebView로     │
                 │   해당 경로 로드 │
                 └─────────────────┘
```

---

## FSD 폴더 구조

```
src/
├── core/
│   └── providers/
│       ├── AuthProvider.tsx
│       └── WebViewProvider.tsx      # WebView 상태 관리
│
├── features/
│   ├── auth/                        # 인증 (기존 유지)
│   │   ├── ui/
│   │   ├── api/
│   │   ├── model/
│   │   └── index.ts
│   │
│   └── webview/                     # WebView 브릿지
│       ├── ui/
│       │   └── WebViewContainer.tsx  # WebView 래퍼 컴포넌트
│       ├── lib/
│       │   ├── bridge.ts            # 브릿지 유틸리티
│       │   └── messageHandler.ts    # 메시지 핸들러
│       ├── model/
│       │   ├── types.ts             # 브릿지 타입 정의
│       │   └── webViewStore.ts      # WebView 상태 관리
│       └── index.ts
│
├── widgets/
│   └── webview-shell/               # WebView 전체 화면 래퍼
│       ├── ui/
│       │   ├── WebViewShell.tsx
│       │   └── LoadingOverlay.tsx
│       └── index.ts
│
└── shared/
    ├── config/
    │   └── webview.ts               # WebView URL, 허용 도메인 등
    └── types/
        └── bridge.ts                # 공통 브릿지 타입
```

---

## 구현 타임라인

> **시작일**: 2024년 12월 13일 (금)

### Week 1: 기반 구축 (12/13 - 12/19)

| 날짜 | 작업 | 상태 |
|------|------|------|
| 12/13 (금) | `app.json` 패키지명/Bundle ID 업데이트 | ✅ 완료 |
| 12/13 (금) | `react-native-webview` 설치 | ✅ 완료 |
| 12/13 (금) | WebView 브릿지 타입 정의 | ✅ 완료 |
| 12/13 (금) | WebView 설정/Store 구현 | ✅ 완료 |
| 12/13 (금) | WebViewContainer 컴포넌트 구현 | ✅ 완료 |
| 12/14-15 | 간병인용 코드 정리 (cleanup) | ⬜ 대기 |
| 12/16-17 | 메인 화면에 WebView 통합 | ⬜ 대기 |
| 12/18-19 | 기본 플로우 테스트 | ⬜ 대기 |

### Week 2: 인증 통합 (12/20 - 12/26)

| 작업 | 상세 |
|------|------|
| 카카오/애플 로그인 연동 | 네이티브 SDK 연동 완성 |
| 토큰 → WebView 전달 | 브릿지를 통한 인증 정보 동기화 |
| 로그아웃 처리 | 양방향 로그아웃 처리 |
| URL Scheme 설정 | `dongdong-guardian://` 딥링크 |
| Universal Links 설정 | `guardian.dongdong.kr` 도메인 연결 |

### Week 3: WebView 통합 (12/27 - 1/2)

| 작업 | 상세 |
|------|------|
| 브릿지 완성 | 모든 메시지 타입 핸들러 구현 |
| 푸시 알림 연동 | FCM/APNs 설정 및 WebView 연동 |
| 에러 처리 | 네트워크 에러, 타임아웃 처리 |
| 로딩 상태 | 스켈레톤 UI, 로딩 인디케이터 |

### Week 4: 테스트 및 최적화 (1/3 - 1/9)

| 작업 | 상세 |
|------|------|
| E2E 테스트 | 전체 사용자 플로우 테스트 |
| 성능 최적화 | WebView 캐싱, 프리로딩 |
| 오프라인 처리 | 에러 화면, 재시도 로직 |
| QA 및 버그 수정 | 내부 테스트 및 수정 |

---

## 마일스톤

```
Week 1 ──────────────────────────────────────────────────────▶
        [기반 구축]
        ├── 패키지 설정 ✅
        ├── WebView 브릿지 ✅  
        └── 코드 정리 📋

Week 2 ──────────────────────────────────────────────────────▶
        [인증 통합]
        ├── 소셜 로그인 연동
        ├── 토큰 동기화
        └── 딥링크 설정

Week 3 ──────────────────────────────────────────────────────▶
        [핵심 기능]
        ├── 브릿지 완성
        ├── 푸시 알림
        └── 에러 처리

Week 4 ──────────────────────────────────────────────────────▶
        [품질 확보]
        ├── E2E 테스트
        ├── 성능 최적화
        └── QA 완료
                                                    🚀 v1.0 배포
```

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프레임워크** | React Native (Expo) |
| **라우팅** | Expo Router |
| **상태관리** | Zustand |
| **WebView** | react-native-webview |
| **인증** | @react-native-seoul/kakao-login, expo-apple-authentication |
| **푸시** | expo-notifications, FCM |
| **저장소** | expo-secure-store |
| **스타일링** | NativeWind (TailwindCSS) |
| **패키지 매니저** | yarn |

---

## 고려사항

### 장점

- ✅ **빠른 기능 배포**: WebView 부분은 웹 배포만으로 업데이트 가능
- ✅ **웹/앱 코드 공유**: 보호자용 웹사이트와 동일한 코드 사용
- ✅ **유지보수 용이**: 네이티브 코드 최소화
- ✅ **A/B 테스트 용이**: 웹에서 쉽게 실험 가능

### 단점 및 대응

| 단점 | 대응 방안 |
|------|----------|
| WebView 성능 이슈 | 캐싱, 프리로딩 적용 |
| 네이티브 느낌 부족 | 웹 UI/UX 최적화, 햅틱 피드백 |
| 오프라인 지원 어려움 | Service Worker, 에러 화면 |
| 디바이스 기능 제한 | 필요 시 네이티브 브릿지 확장 |

---

## 관련 문서

- [간병인용 코드 정리 계획](./guardian-cleanup.md)
- [Next.js 브릿지 연동 가이드](./nextjs-bridge-integration.md)
- [인증 플로우](./auth-flow.md)
- [FSD 아키텍처](./fsd-architecture.md)

---

## 다음 단계

1. **간병인용 코드 정리** - `guardian-cleanup.md` 참조
2. **Web App (Next.js) 프로젝트 구조 설계**
3. **백엔드 API 명세 정의**
4. **디자인 시스템 연동 계획**

