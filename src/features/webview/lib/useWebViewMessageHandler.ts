import { useAuthStore } from '@/features/auth';
import {
    type AnalyticsPayload,
    type HapticPayload,
    isWebToRNMessage,
    type NavigatePayload,
    type SharePayload,
    type WebToRNMessage,
} from '@/shared/types/bridge';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Share } from 'react-native';

/**
 * WebView에서 오는 메시지 처리 훅
 */
export function useWebViewMessageHandler() {
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
        await logout();
        router.replace('/(auth)/login');
    }, [logout, router]);

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
        // TODO: Analytics 서비스 연동
        console.log('[Analytics]', payload.event, payload.properties);
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
                        console.log('WebView is ready');
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
