import { WebViewContainer } from '@/features/webview';

/**
 * Legacy screen placeholder.
 * Guardian 앱은 탭 네비게이션을 제거했고, WebView는 /(tabs)/index 단일 진입만 사용한다.
 * - 이 파일은 라우트 호환성을 위해 남겨두되, 동일 UX(홈)를 복제하지 않는다.
 */
export default function ExploreScreen() {
  return <WebViewContainer initialPath="/" />;
}
