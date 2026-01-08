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
        // DEV/QA 관제: WebView 내부 fetch/XHR/에러를 RN DEV TRACE로 승격
        const enabled = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');
        if (!enabled) return;

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
            return;
        }

        if (ev === 'WEB_ERROR') {
            devlog({
                scope: 'SYS',
                level: 'error',
                message: 'web: runtime error',
                meta: props,
            });
            return;
        }

        devlog({
            scope: 'SYS',
            level: 'info',
            message: `web: ${ev || 'ANALYTICS'}`,
            meta: props,
        });
    }, []);

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
