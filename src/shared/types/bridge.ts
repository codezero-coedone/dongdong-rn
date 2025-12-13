/**
 * WebView Bridge Types
 * React Native ↔ WebView 통신을 위한 타입 정의
 */

// ============================================
// Message Types (RN → WebView)
// ============================================

/** RN에서 WebView로 전송하는 메시지 타입 */
export type RNToWebMessageType =
    | 'AUTH_TOKEN'       // 인증 토큰 전달
    | 'USER_INFO'        // 사용자 정보 전달
    | 'PUSH_DATA'        // 푸시 알림 데이터
    | 'DEEP_LINK'        // 딥링크 데이터
    | 'APP_STATE';       // 앱 상태 (foreground/background)

// ============================================
// Message Types (WebView → RN)
// ============================================

/** WebView에서 RN으로 전송하는 메시지 타입 */
export type WebToRNMessageType =
    | 'NAVIGATE'         // 네이티브 화면 이동
    | 'LOGOUT'           // 로그아웃 요청
    | 'OPEN_CAMERA'      // 카메라 열기
    | 'OPEN_GALLERY'     // 갤러리 열기
    | 'SHARE'            // 공유
    | 'HAPTIC'           // 햅틱 피드백
    | 'ANALYTICS'        // 분석 이벤트
    | 'READY';           // WebView 로드 완료

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

export interface DeepLinkPayload {
    url: string;
    path: string;
    params?: Record<string, string>;
}

export interface SharePayload {
    title?: string;
    message: string;
    url?: string;
}

export interface HapticPayload {
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export interface AnalyticsPayload {
    event: string;
    properties?: Record<string, unknown>;
}

// ============================================
// Bridge Message Types
// ============================================

/** RN → WebView 메시지 */
export interface RNToWebMessage<T = unknown> {
    type: RNToWebMessageType;
    payload: T;
    timestamp: number;
}

/** WebView → RN 메시지 */
export interface WebToRNMessage<T = unknown> {
    type: WebToRNMessageType;
    payload: T;
    timestamp: number;
}

// ============================================
// Type Guards
// ============================================

export function isWebToRNMessage(data: unknown): data is WebToRNMessage {
    return (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        'payload' in data &&
        'timestamp' in data
    );
}

// ============================================
// Message Creators
// ============================================

export function createRNToWebMessage<T>(
    type: RNToWebMessageType,
    payload: T
): RNToWebMessage<T> {
    return {
        type,
        payload,
        timestamp: Date.now(),
    };
}
