import { useAuthStore } from '@/features/auth';
import {
    WEBVIEW_CONFIG,
    WEBVIEW_URL,
    isAllowedUrl,
} from '@/shared/config/webview';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, AppState, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useWebViewBridge } from '../lib/useWebViewBridge';
import { useWebViewMessageHandler } from '../lib/useWebViewMessageHandler';
import { useWebViewStore } from '../model/webViewStore';

interface WebViewContainerProps {
    /** 시작 경로 (기본값: '/') */
    initialPath?: string;
    /** 로딩 컴포넌트 커스텀 */
    LoadingComponent?: React.ComponentType;
    /** 에러 컴포넌트 커스텀 */
    ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
}

/**
 * WebView 컨테이너 컴포넌트
 * 인증된 사용자에게 WebView 기반 콘텐츠 제공
 */
export function WebViewContainer({
    initialPath = '/',
    LoadingComponent,
    ErrorComponent,
}: WebViewContainerProps) {
    const { webViewRef, sendAuthToken, sendUserInfo, sendAppState } = useWebViewBridge();
    const { handleMessage } = useWebViewMessageHandler();
    const {
        isLoading,
        error,
        setLoading,
        setError,
        updateNavigation,
        setReady,
        reset,
    } = useWebViewStore();

    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    const base = WEBVIEW_URL.replace(/\/+$/, '');
    const path = initialPath.startsWith('/') ? initialPath : `/${initialPath}`;
    const url = `${base}${path}`;

    // Some builds may ship without NativeWind/className wiring.
    // Always keep WebView container layout deterministic with explicit RN styles.
    const containerStyle = { flex: 1 } as const;
    const centerStyle = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
    } as const;

    // ==========================================================
    // Token pre-injection (deterministic)
    // - Inject accessToken BEFORE web scripts run to avoid initial 401/redirect race.
    // ==========================================================
    const injectedBeforeContentLoaded = token
        ? `
      (function() {
        try {
          localStorage.setItem('accessToken', ${JSON.stringify(token)});
          window.dispatchEvent(new Event('dd-auth-token'));
        } catch (e) {}
      })();
      true;
    `
        : `true;`;

    // ============================================
    // 앱 상태 변화 감지
    // ============================================
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' || nextState === 'background' || nextState === 'inactive') {
                sendAppState(nextState);
            }
        });
        return () => subscription.remove();
    }, [sendAppState]);

    // ============================================
    // WebView 로드 완료 시 인증 정보 전송
    // ============================================
    const handleLoadEnd = useCallback(() => {
        setLoading(false);
        setReady(true);

        // 토큰 전송
        if (token) {
            sendAuthToken({ accessToken: token });
        }

        // 사용자 정보 전송
        if (user) {
            sendUserInfo({
                id: user.id,
                name: user.name,
                role: 'guardian',
            });
        }
    }, [token, user, sendAuthToken, sendUserInfo, setLoading, setReady]);

    // ============================================
    // 네비게이션 상태 업데이트
    // ============================================
    const handleNavigationStateChange = useCallback(
        (nav: WebViewNavigation) => {
            updateNavigation({
                canGoBack: nav.canGoBack,
                canGoForward: nav.canGoForward,
                url: nav.url,
            });
        },
        [updateNavigation]
    );

    // ============================================
    // URL 허용 여부 확인
    // ============================================
    const handleShouldStartLoad = useCallback(
        (request: { url: string }) => {
            return isAllowedUrl(request.url);
        },
        []
    );

    // ============================================
    // 에러 처리
    // ============================================
    const handleError = useCallback(
        (syntheticEvent: { nativeEvent: { description: string } }) => {
            setError(syntheticEvent.nativeEvent.description);
        },
        [setError]
    );

    // ============================================
    // 재시도
    // ============================================
    const handleRetry = useCallback(() => {
        setError(null);
        setLoading(true);
        webViewRef.current?.reload();
    }, [setError, setLoading, webViewRef]);

    // ============================================
    // Loading timeout (prevents "white screen" hang)
    // ============================================
    useEffect(() => {
        if (!isLoading) return;
        const t = setTimeout(() => {
            setError(
                `WebView loading timeout.\nURL=${url}\n(HTTP 차단/도메인 미연결/서버 다운일 수 있습니다)`,
            );
        }, 15000);
        return () => clearTimeout(t);
    }, [isLoading, url, setError]);

    // ============================================
    // 컴포넌트 언마운트 시 상태 초기화
    // ============================================
    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    // ============================================
    // 렌더링
    // ============================================

    // 에러 상태
    if (error) {
        if (ErrorComponent) {
            return <ErrorComponent onRetry={handleRetry} />;
        }
        return (
            <SafeAreaView style={centerStyle}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 }}>
                    연결에 문제가 발생했습니다
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
                    {String(error)}
                </Text>
                <Pressable
                    onPress={handleRetry}
                    style={{
                        backgroundColor: '#3B82F6',
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>다시 시도</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <View style={containerStyle}>
            {/* 로딩 오버레이 */}
            {isLoading && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                    }}
                >
                    {LoadingComponent ? (
                        <LoadingComponent />
                    ) : (
                        <>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={{ marginTop: 10, color: '#6B7280' }}>
                                WebView 로딩 중…
                            </Text>
                        </>
                    )}
                </View>
            )}

            {/* WebView */}
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={handleLoadEnd}
                injectedJavaScriptBeforeContentLoaded={injectedBeforeContentLoaded}
                onMessage={handleMessage}
                onNavigationStateChange={handleNavigationStateChange}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                onError={handleError}
                {...WEBVIEW_CONFIG}
                style={{ flex: 1 }}
            />
        </View>
    );
}
