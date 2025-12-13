import type { WebViewNavigation } from 'react-native-webview';
import { create } from 'zustand';

// ============================================
// Types
// ============================================

export interface WebViewState {
    /** WebView 로딩 상태 */
    isLoading: boolean;

    /** 에러 메시지 */
    error: string | null;

    /** 현재 WebView URL */
    currentUrl: string | null;

    /** 뒤로가기 가능 여부 */
    canGoBack: boolean;

    /** 앞으로가기 가능 여부 */
    canGoForward: boolean;

    /** WebView가 준비되었는지 */
    isReady: boolean;
}

export interface WebViewActions {
    /** 로딩 상태 설정 */
    setLoading: (isLoading: boolean) => void;

    /** 에러 설정 */
    setError: (error: string | null) => void;

    /** 현재 URL 설정 */
    setCurrentUrl: (url: string | null) => void;

    /** 네비게이션 상태 업데이트 */
    updateNavigation: (nav: Partial<Pick<WebViewNavigation, 'canGoBack' | 'canGoForward' | 'url'>>) => void;

    /** WebView 준비 완료 */
    setReady: (isReady: boolean) => void;

    /** 상태 초기화 */
    reset: () => void;
}

export type WebViewStore = WebViewState & WebViewActions;

// ============================================
// Initial State
// ============================================

const initialState: WebViewState = {
    isLoading: true,
    error: null,
    currentUrl: null,
    canGoBack: false,
    canGoForward: false,
    isReady: false,
};

// ============================================
// Store
// ============================================

export const useWebViewStore = create<WebViewStore>((set) => ({
    ...initialState,

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    setCurrentUrl: (currentUrl) => set({ currentUrl }),

    updateNavigation: (nav) =>
        set((state) => ({
            canGoBack: nav.canGoBack ?? state.canGoBack,
            canGoForward: nav.canGoForward ?? state.canGoForward,
            currentUrl: nav.url ?? state.currentUrl,
        })),

    setReady: (isReady) => set({ isReady, isLoading: false }),

    reset: () => set(initialState),
}));
