/**
 * WebView Configuration
 * WebView 관련 설정 상수
 */

// ============================================
// URLs
// ============================================

/** 프로덕션 WebView URL */
// NOTE(DEV/OPS):
// 현재 운영/검수 단계에서는 WebView 컨텐츠가 dev-client(dongdong-client)에서 서빙됩니다.
// guardian.dongdong.kr 이 준비되면 EXPO_PUBLIC_WEBVIEW_URL 또는 아래 기본값을 교체하세요.
export const WEBVIEW_PROD_URL = 'http://dev-client.dongdong.io';

/** 개발 WebView URL (로컬 Next.js 서버) */
// 실제 디바이스/내부테스트에서는 localhost가 RN 단말 자체를 가리켜서 실패합니다.
export const WEBVIEW_DEV_URL = 'http://dev-client.dongdong.io';

/** 스테이징 WebView URL */
export const WEBVIEW_STAGING_URL = 'https://staging-guardian.dongdong.kr';

/** 현재 환경에 맞는 WebView URL */
export const WEBVIEW_URL =
    process.env.EXPO_PUBLIC_WEBVIEW_URL ||
    (__DEV__ ? WEBVIEW_DEV_URL : WEBVIEW_PROD_URL);

// ============================================
// Security
// ============================================

/** 허용된 도메인 목록 */
export const ALLOWED_DOMAINS = [
    'dongdong.io',
    'dongdong.kr',
    'dev-client.dongdong.io',
    'guardian.dongdong.kr',
    'staging-guardian.dongdong.kr',
    'localhost',
] as const;

/** 허용된 URL scheme */
export const ALLOWED_SCHEMES = ['https', 'http'] as const;

function parseUrlLite(
    url: string,
): { protocol: string; hostname: string } | null {
    // Very small URL parser for RN runtime environments where global URL may be missing.
    // Supports: http(s)://host[:port]/...
    const m = url.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^\/?#:]+)(?::\d+)?/);
    if (!m) return null;
    return { protocol: m[1].toLowerCase(), hostname: m[2].toLowerCase() };
}

/**
 * URL이 허용된 도메인인지 확인
 */
export function isAllowedUrl(url: string): boolean {
    try {
        if (url === 'about:blank') return true;
        const parsed =
            typeof (globalThis as any).URL === 'function'
                ? (() => {
                      const u = new URL(url);
                      return {
                          protocol: u.protocol.replace(':', '').toLowerCase(),
                          hostname: u.hostname.toLowerCase(),
                      };
                  })()
                : parseUrlLite(url);

        if (!parsed) return false;

        // 개발 환경에서는 localhost 허용
        if (__DEV__ && parsed.hostname === 'localhost') {
            return true;
        }

        // 허용된 scheme 확인
        if (!ALLOWED_SCHEMES.includes(parsed.protocol as any)) {
            return false;
        }

        // 허용된 도메인 확인
        return ALLOWED_DOMAINS.some(
            (domain) =>
                parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
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
