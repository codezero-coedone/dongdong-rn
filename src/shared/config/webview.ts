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
): { protocol: string; hostname: string; pathname: string } | null {
    // Very small URL parser for RN runtime environments where global URL may be missing.
    // Supports: http(s)://host[:port]/...
    const m = url.match(
        /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^\/?#:]+)(?::\d+)?(\/[^?#]*)?/,
    );
    if (!m) return null;
    return {
        protocol: m[1].toLowerCase(),
        hostname: m[2].toLowerCase(),
        pathname: m[3] || '/',
    };
}

/**
 * WebView에서 "절대 노출되면 안 되는" 라우트/도메인 차단
 * - Kakao 로그인은 RN 네이티브에서만 수행
 * - WebView(dev-client)는 로그인 결과(토큰)만 소비
 */
const BLOCKED_HOST_SUFFIXES = [
    // Kakao auth endpoints must never be opened inside our embedded WebView
    'kakao.com',
    'kakaocdn.net',
    'daum.net',
] as const;

const BLOCKED_PATH_PREFIXES = [
    // Web auth routes must be RN-only
    '/login',
    '/auth',
    '/signup',
    '/onboarding',
] as const;

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
                          pathname: u.pathname || '/',
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

        // Block Kakao (and similar) auth domains inside embedded WebView (RN native only).
        if (
            BLOCKED_HOST_SUFFIXES.some(
                (s) => parsed.hostname === s || parsed.hostname.endsWith(`.${s}`),
            )
        ) {
            return false;
        }

        // 허용된 도메인 확인
        const domainOk = ALLOWED_DOMAINS.some(
            (domain) =>
                parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );

        if (!domainOk) return false;

        // Block web auth routes (RN native only).
        const path = parsed.pathname || '/';
        if (BLOCKED_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
            return false;
        }

        return true;
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
    // DEV/QA 결정성: 웹 캐시/서비스워커/스토리지로 인해 "화면이 그대로" 보이는 이슈가 자주 발생.
    // 우선은 캐시를 꺼서(그리고 토큰은 pre-inject) 항상 최신 WebView를 보이게 고정한다.
    cacheEnabled: false,
    // Android: hard-disable WebView cache layer (prevents stale bundles / cache-related weirdness)
    cacheMode: 'LOAD_NO_CACHE',

    /** WebView 세션 분리 (캐시/쿠키 영향 최소화) */
    incognito: true,

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
