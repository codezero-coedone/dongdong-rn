/**
 * WebView Configuration
 * WebView 관련 설정 상수
 */

// ============================================
// URLs
// ============================================

/** 프로덕션 WebView URL */
export const WEBVIEW_PROD_URL = 'https://guardian.dongdong.kr';

/** 개발 WebView URL (로컬 Next.js 서버) */
export const WEBVIEW_DEV_URL = 'http://localhost:3000';

/** 스테이징 WebView URL */
export const WEBVIEW_STAGING_URL = 'https://staging-guardian.dongdong.kr';

/** 현재 환경에 맞는 WebView URL */
export const WEBVIEW_URL = __DEV__ ? WEBVIEW_DEV_URL : WEBVIEW_PROD_URL;

// ============================================
// Security
// ============================================

/** 허용된 도메인 목록 */
export const ALLOWED_DOMAINS = [
    'dongdong.kr',
    'guardian.dongdong.kr',
    'staging-guardian.dongdong.kr',
    'localhost',
] as const;

/** 허용된 URL scheme */
export const ALLOWED_SCHEMES = ['https', 'http'] as const;

/**
 * URL이 허용된 도메인인지 확인
 */
export function isAllowedUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);

        // 개발 환경에서는 localhost 허용
        if (__DEV__ && urlObj.hostname === 'localhost') {
            return true;
        }

        // 허용된 도메인 확인
        return ALLOWED_DOMAINS.some(
            (domain) =>
                urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
        );
    } catch {
        return false;
    }
}

// ============================================
// WebView Settings
// ============================================

export const WEBVIEW_CONFIG = {
    /** JavaScript 활성화 */
    javaScriptEnabled: true,

    /** DOM Storage 활성화 */
    domStorageEnabled: true,

    /** 서드파티 쿠키 비활성화 (보안) */
    thirdPartyCookiesEnabled: false,

    /** 뒤로/앞으로 제스처 허용 */
    allowsBackForwardNavigationGestures: true,

    /** 미디어 자동재생 허용 */
    mediaPlaybackRequiresUserAction: false,

    /** 캐시 모드 */
    cacheEnabled: true,

    /** 인라인 비디오 재생 허용 (iOS) */
    allowsInlineMediaPlayback: true,
} as const;

// ============================================
// Loading States
// ============================================

export const WEBVIEW_LOADING_CONFIG = {
    /** 로딩 시작 후 최소 표시 시간 (ms) */
    minLoadingTime: 300,

    /** 로딩 타임아웃 (ms) */
    loadingTimeout: 30000,

    /** 재시도 횟수 */
    maxRetries: 3,
} as const;
