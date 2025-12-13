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

    const url = `${WEBVIEW_URL}${initialPath}`;

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
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg text-gray-700 mb-4">연결에 문제가 발생했습니다</Text>
                <Text className="text-sm text-gray-500 mb-6">{error}</Text>
                <Pressable
                    onPress={handleRetry}
                    className="bg-blue-500 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">다시 시도</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1">
            {/* 로딩 오버레이 */}
            {isLoading && (
                <View className="absolute inset-0 z-10 justify-center items-center bg-white">
                    {LoadingComponent ? (
                        <LoadingComponent />
                    ) : (
                        <ActivityIndicator size="large" color="#3B82F6" />
                    )}
                </View>
            )}

            {/* WebView */}
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={handleLoadEnd}
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
