# 카카오 로그인 구현 계획

## 개요

카카오 네이티브 SDK를 사용하여 인라인 로그인을 구현합니다.
사용자가 앱 내에서 직접 카카오 계정을 선택하고 로그인할 수 있습니다.

## 인라인 로그인 UI

카카오 SDK가 제공하는 네이티브 UI:

- 이전에 로그인한 카카오 계정 목록 표시
- "새로운 계정으로 로그인" 옵션
- 카카오톡 앱이 설치된 경우 카카오톡을 통한 간편 로그인

## 필요 패키지

```bash
npx expo install @react-native-seoul/kakao-login expo-dev-client
```

## Expo 설정

### 1. app.json 설정

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-seoul/kakao-login",
        {
          "kakaoAppKey": "YOUR_NATIVE_APP_KEY",
          "kotlinVersion": "1.9.0"
        }
      ]
    ]
  }
}
```

### 2. Development Build 생성

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

> **주의**: Expo Go에서는 네이티브 모듈을 사용할 수 없습니다.
> Development Build를 사용해야 합니다.

## 카카오 개발자 콘솔 설정

### 1. 앱 등록

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. 네이티브 앱 키 확인

### 2. 플랫폼 등록

#### iOS

- 번들 ID 등록 (예: `com.dongdong.app`)

#### Android

- 패키지명 등록 (예: `com.dongdong.app`)
- 키 해시 등록
  ```bash
  # 디버그 키 해시 확인
  keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
  ```

### 3. 동의 항목 설정

- 닉네임 (필수)
- 프로필 사진 (선택)
- 이메일 (선택)

## 구현 코드

### 기본 사용법

```typescript
import {
  login,
  logout,
  getProfile,
  KakaoOAuthToken,
  KakaoProfile,
} from "@react-native-seoul/kakao-login";

// 로그인
const handleKakaoLogin = async () => {
  try {
    const token: KakaoOAuthToken = await login();
    console.log("Access Token:", token.accessToken);
    console.log("Refresh Token:", token.refreshToken);

    // 프로필 조회
    const profile: KakaoProfile = await getProfile();
    console.log("Profile:", profile);

    // 서버로 토큰 전송하여 인증 처리
    await authenticateWithServer(token.accessToken);
  } catch (error) {
    console.error("카카오 로그인 실패:", error);
  }
};

// 로그아웃
const handleKakaoLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("카카오 로그아웃 실패:", error);
  }
};
```

### authStore 연동

```typescript
// src/features/auth/model/authStore.ts

socialLogin: async (provider: 'kakao') => {
  set({ isLoading: true });
  try {
    if (provider === 'kakao') {
      const token = await login();
      const profile = await getProfile();

      // 서버 API 호출하여 JWT 토큰 발급
      const response = await authApi.socialLogin({
        provider: 'kakao',
        accessToken: token.accessToken,
      });

      await secureStorage.setToken(response.token);
      await secureStorage.setUser(response.user);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  } catch (error) {
    set({ isLoading: false });
    throw error;
  }
},
```

## 에러 처리

| 에러 코드                 | 설명            | 대응               |
| ------------------------- | --------------- | ------------------ |
| `KakaoError.CLIENT_ERROR` | 클라이언트 에러 | 앱 재시작 안내     |
| `KakaoError.AUTH_ERROR`   | 인증 에러       | 다시 로그인 시도   |
| `KakaoError.API_ERROR`    | API 에러        | 네트워크 확인 안내 |

## 체크리스트

- [ ] 카카오 개발자 콘솔 앱 등록
- [ ] 네이티브 앱 키 발급
- [ ] iOS 번들 ID 등록
- [ ] Android 패키지명 및 키 해시 등록
- [ ] 동의 항목 설정
- [ ] `@react-native-seoul/kakao-login` 설치
- [ ] `expo-dev-client` 설치
- [ ] app.json 플러그인 설정
- [ ] Development Build 생성
- [ ] 로그인 기능 구현
- [ ] 서버 연동

## 참고 자료

- [@react-native-seoul/kakao-login](https://github.com/crossplatformkorea/react-native-kakao-login)
- [카카오 로그인 개발 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Expo Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
