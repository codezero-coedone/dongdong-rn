import {
    type AuthTokenPayload,
    type DeepLinkPayload,
    type RNToWebMessageType,
    type UserInfoPayload,
    createRNToWebMessage,
} from '@/shared/types/bridge';
import { useCallback, useRef } from 'react';
import type { WebView } from 'react-native-webview';

/**
 * WebView 브릿지 훅
 * React Native에서 WebView로 메시지 전송
 */
export function useWebViewBridge() {
    const webViewRef = useRef<WebView>(null);

    /**
     * WebView로 메시지 전송
     */
    const postMessage = useCallback(<T>(type: RNToWebMessageType, payload: T) => {
        const message = createRNToWebMessage(type, payload);
        const script = `
      (function() {
        window.postMessage(${JSON.stringify(JSON.stringify(message))}, '*');
      })();
      true;
    `;
        webViewRef.current?.injectJavaScript(script);
    }, []);

    /**
     * 인증 토큰 전송
     */
    const sendAuthToken = useCallback(
        (token: AuthTokenPayload) => {
            postMessage('AUTH_TOKEN', token);
        },
        [postMessage]
    );

    /**
     * 사용자 정보 전송
     */
    const sendUserInfo = useCallback(
        (user: UserInfoPayload) => {
            postMessage('USER_INFO', user);
        },
        [postMessage]
    );

    /**
     * 딥링크 데이터 전송
     */
    const sendDeepLink = useCallback(
        (deepLink: DeepLinkPayload) => {
            postMessage('DEEP_LINK', deepLink);
        },
        [postMessage]
    );

    /**
     * 앱 상태 전송 (foreground/background)
     */
    const sendAppState = useCallback(
        (state: 'active' | 'background' | 'inactive') => {
            postMessage('APP_STATE', { state });
        },
        [postMessage]
    );

    return {
        webViewRef,
        postMessage,
        sendAuthToken,
        sendUserInfo,
        sendDeepLink,
        sendAppState,
    };
}
