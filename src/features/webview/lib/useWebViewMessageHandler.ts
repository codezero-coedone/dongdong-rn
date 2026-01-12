import { useAuthStore } from '@/features/auth';
import {
    type AnalyticsPayload,
    type HapticPayload,
    isWebToRNMessage,
    type NavigatePayload,
    type SharePayload,
    type WebToRNMessage,
} from '@/shared/types/bridge';
import { devlog } from '@/shared/devtools/devlog';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Share } from 'react-native';

/**
 * WebView에서 오는 메시지 처리 훅
 */
export function useWebViewMessageHandler(injectJavaScript?: (script: string) => void) {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');

    const sigLog = useCallback(
        (
            sig: number,
            level: 'info' | 'warn' | 'error',
            message: string,
            meta?: Record<string, unknown>,
        ) => {
            if (!DEVTOOLS_ENABLED) return;
            devlog({
                scope: 'SIG',
                level,
                message: `SIG${sig} ${message}`,
                meta: { sig, ...(meta || {}) },
            });
        },
        [DEVTOOLS_ENABLED]
    );

    /**
     * 네이티브 화면 이동
     */
    const handleNavigate = useCallback(
        (payload: NavigatePayload) => {
            router.push(payload.route as never);
        },
        [router]
    );

    /**
     * 로그아웃 처리
     */
    const handleLogout = useCallback(async () => {
        // Enforce "token owner = RN": clear token in web runtime first, then logout RN.
        try {
            const script = `
        (function() {
          try { localStorage.removeItem('accessToken'); } catch (e) {}
          try { window.__ddAccessToken = ''; } catch (e) {}
          try {
            var msg = { type: 'ANALYTICS', payload: { event: 'WEB_AUTH_CLEAR', properties: { ok: true } }, timestamp: Date.now() };
            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          } catch (e) {}
        })();
        true;
      `;
            if (typeof injectJavaScript === 'function') injectJavaScript(script);
        } catch {
            // ignore
        }
        await logout();
        router.replace('/(auth)/login');
    }, [injectJavaScript, logout, router]);

    /**
     * 공유 기능
     */
    const handleShare = useCallback(async (payload: SharePayload) => {
        try {
            await Share.share({
                title: payload.title,
                message: payload.message,
                url: payload.url,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    }, []);

    /**
     * 햅틱 피드백
     */
    const handleHaptic = useCallback((payload: HapticPayload) => {
        const hapticMap: Record<HapticPayload['type'], () => void> = {
            light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
            medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
            heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
            success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
            warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
            error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
        };
        hapticMap[payload.type]?.();
    }, []);

    /**
     * 분석 이벤트 (추후 Analytics 서비스 연동)
     */
    const handleAnalytics = useCallback((payload: AnalyticsPayload) => {
        // DEV/QA 관제: WebView 내부 fetch/XHR/에러를 RN DEV TRACE로 승격 + SIG 센서코드 부여
        if (!DEVTOOLS_ENABLED) return;

        const ev = String(payload?.event || '');
        const props = (payload?.properties || {}) as Record<string, unknown>;

        const rawUrl = typeof props.url === 'string' ? props.url : '';
        const method = typeof props.method === 'string' ? props.method : '';
        const status = typeof props.status === 'number' ? props.status : undefined;
        const rid = typeof (props as any).rid === 'string' ? String((props as any).rid) : '';

        const shortUrl = (() => {
            if (!rawUrl) return '';
            try {
                // strip domain/query for readability
                const m = rawUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\/?#]+(\/[^?#]*)?/);
                return m && m[1] ? m[1] : rawUrl;
            } catch {
                return rawUrl;
            }
        })();

        if (ev.startsWith('WEB_FETCH') || ev.startsWith('WEB_XHR')) {
            // Sensor codes:
            // - SIG401: Unauthorized (401)
            // - SIG507: Server Action mismatch / forced reload
            // - SIG904: web network error (fetch/xhr _ERR)
            const sig =
                status === 401
                    ? 401
                    : ev === 'WEB_SERVER_ACTION_RELOAD'
                      ? 507
                      : ev.endsWith('_ERR')
                        ? 904
                        : undefined;

            const msg = status != null
                ? `web: ${rid ? `[rid=${rid}] ` : ''}${method} ${shortUrl} → ${status}`
                : `web: ${rid ? `[rid=${rid}] ` : ''}${ev} ${method} ${shortUrl}`.trim();
            devlog({
                scope: 'API',
                level: ev.endsWith('_ERR') ? 'error' : 'info',
                message: msg,
                // PII guard: keep only minimal/safe fields
                meta: {
                    event: ev,
                    rid: rid || undefined,
                    method,
                    url: shortUrl,
                    status,
                    message: typeof props.message === 'string' ? props.message : undefined,
                },
            });
            if (typeof sig === 'number') {
                sigLog(
                    sig,
                    sig === 401 ? 'warn' : sig === 507 ? 'warn' : 'error',
                    'web event',
                    { event: ev, rid: rid || undefined, method, url: shortUrl, status },
                );
            }
            return;
        }

        if (ev === 'WEB_ERROR') {
            sigLog(901, 'error', 'web runtime error', props);
            return;
        }
        if (ev === 'WEB_REJECT') {
            sigLog(902, 'error', 'web unhandledrejection', props);
            return;
        }
        if (ev === 'WEB_CONSOLE_ERROR') {
            sigLog(903, 'error', 'web console.error', props);
            return;
        }

        if (ev === 'WEB_AUTH_STATE') {
            // Make the auth-state visible in DEV TRACE UI (message only; meta isn't always visible).
            try {
                const source = typeof (props as any).source === 'string' ? String((props as any).source) : '';
                const win = (props as any).win || {};
                const ls = (props as any).ls || {};
                const wAlg = typeof win.alg === 'string' ? win.alg : '';
                const lAlg = typeof ls.alg === 'string' ? ls.alg : '';
                const wOk = typeof win.ok === 'number' ? win.ok : 0;
                const lOk = typeof ls.ok === 'number' ? ls.ok : 0;
                devlog({
                    scope: 'SYS',
                    level: 'info',
                    message: `web: AUTH_STATE src=${source || 'none'} win(ok=${wOk} alg=${wAlg || '-'}) ls(ok=${lOk} alg=${lAlg || '-'})`,
                    meta: props,
                });
                return;
            } catch {
                // fall through
            }
        }

        devlog({
            scope: 'SYS',
            level: 'info',
            message: `web: ${ev || 'ANALYTICS'}`,
            meta: props,
        });
    }, [DEVTOOLS_ENABLED, sigLog]);

    /**
     * WebView 메시지 핸들러
     */
    const handleMessage = useCallback(
        (event: { nativeEvent: { data: string } }) => {
            try {
                const data = JSON.parse(event.nativeEvent.data);

                if (!isWebToRNMessage(data)) {
                    console.warn('Invalid WebView message format:', data);
                    return;
                }

                const message = data as WebToRNMessage;

                switch (message.type) {
                    case 'NAVIGATE':
                        handleNavigate(message.payload as NavigatePayload);
                        break;
                    case 'LOGOUT':
                        handleLogout();
                        break;
                    case 'SHARE':
                        handleShare(message.payload as SharePayload);
                        break;
                    case 'HAPTIC':
                        handleHaptic(message.payload as HapticPayload);
                        break;
                    case 'ANALYTICS':
                        handleAnalytics(message.payload as AnalyticsPayload);
                        break;
                    case 'READY':
                        if (Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1')) {
                            devlog({
                                scope: 'SYS',
                                level: 'info',
                                message: 'webview: READY',
                                meta: (message.payload as any) || {},
                            });
                        }
                        break;
                    case 'OPEN_CAMERA':
                    case 'OPEN_GALLERY':
                        // TODO: 카메라/갤러리 기능 구현
                        console.log('Camera/Gallery requested:', message.type);
                        break;
                    default:
                        console.warn('Unknown message type:', message.type);
                }
            } catch (error) {
                console.error('Failed to parse WebView message:', error);
            }
        },
        [handleNavigate, handleLogout, handleShare, handleHaptic, handleAnalytics]
    );

    return { handleMessage };
}
