import { Stack } from 'expo-router';
import React from 'react';

/**
 * Guardian 앱은 "WebView 컨텐츠 앱"이므로 RN 탭 네비게이션을 사용하지 않는다.
 * - RN 하단탭/Explore가 남아있으면 Web 모달/키보드/하단바가 2중/3중으로 겹치며 UX가 깨진다.
 * - 단일 진입: /(tabs)/index → WebViewContainer('/')
 */
export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Legacy/unused: keep route file but detach from navigation to avoid duplicate UX surfaces */}
      <Stack.Screen name="explore" options={{ presentation: 'transparentModal' }} />
    </Stack>
  );
}
