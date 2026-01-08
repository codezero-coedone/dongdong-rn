import { useAuthStore } from '@/features/auth';
import {
    WEBVIEW_CONFIG,
    WEBVIEW_URL,
    isAllowedUrl,
} from '@/shared/config/webview';
import { devlog } from '@/shared/devtools/devlog';
import { secureStorage } from '@/shared/lib/storage';
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
    const { handleMessage } = useWebViewMessageHandler((script) => {
        try {
            webViewRef.current?.injectJavaScript(script);
        } catch {
            // ignore
        }
    });
    const {
        isLoading,
        error,
        setLoading,
        setError,
        updateNavigation,
        setReady,
        reset,
    } = useWebViewStore();

    const storeToken = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');
    const [persistedToken, setPersistedToken] = React.useState<string | null>(null);

    const looksJwt = useCallback((t: string | null | undefined): boolean => {
        if (!t) return false;
        const s = String(t).trim();
        if (!s) return false;
        // JWT shape: header.payload.signature (3 dot-separated parts)
        return s.split('.').length === 3;
    }, []);

    // Token source of truth for API/WebView: SecureStore token (auth_token) / JWT only.
    // - Prevents injecting Kakao OAuth tokens or garbage into backend-protected APIs (causes 401 loops).
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const t = await secureStorage.getToken();
                if (!alive) return;
                setPersistedToken(typeof t === 'string' ? t : null);
            } catch {
                if (!alive) return;
                setPersistedToken(null);
            }
        })();
        return () => {
            alive = false;
        };
    }, [storeToken]);

    const token = React.useMemo(() => {
        // Prefer a JWT-looking token only.
        if (looksJwt(storeToken)) return String(storeToken).trim();
        if (looksJwt(persistedToken)) return String(persistedToken).trim();
        return null;
    }, [looksJwt, persistedToken, storeToken]);

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
    // HARD GATE: WebView must never mount before RN owns an accessToken.
    // - Prevents any web auth(/login) exposure inside WebView.
    // ==========================================================
    if (!token) {
        return (
            <SafeAreaView style={centerStyle}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 }}>
                    로그인이 필요합니다
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
                    카카오 로그인은 앱(RN)에서만 진행됩니다.{'\n'}
                    WebView에서는 로그인 화면이 표시되지 않습니다.
                </Text>
                <Pressable
                    onPress={() => {
                        // Stay deterministic: just ask the app router to show auth flow via global store.
                        // (RootLayout will redirect to /(auth)/permission when not authenticated.)
                        setError(null);
                    }}
                    style={{
                        backgroundColor: '#3B82F6',
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>확인</Text>
                </Pressable>
                {DEVTOOLS_ENABLED && (
                    <Text style={{ marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                        DBG: token(jwt)=0 store={looksJwt(storeToken) ? 'jwt' : storeToken ? 'non-jwt' : 'null'} secure=
                        {looksJwt(persistedToken) ? 'jwt' : persistedToken ? 'non-jwt' : 'null'}
                    </Text>
                )}
            </SafeAreaView>
        );
    }

    const base = WEBVIEW_URL.replace(/\/+$/, '');
    const path = initialPath.startsWith('/') ? initialPath : `/${initialPath}`;
    const url = `${base}${path}`;

    useEffect(() => {
        if (!DEVTOOLS_ENABLED) return;
        devlog({
            scope: 'SYS',
            level: 'info',
            message: `webview: mount url=${url}`,
            meta: { base, path, hasToken: Boolean(token) },
        });
    }, [DEVTOOLS_ENABLED, url, base, path, token]);

    // ==========================================================
    // Token pre-injection (deterministic)
    // - Inject accessToken BEFORE web scripts run to avoid initial 401/redirect race.
    // ==========================================================
    const injectedBeforeContentLoaded = token
        ? `
      (function() {
        try {
          var __ddAccessToken = ${JSON.stringify(token)};
          try { window.__ddAccessToken = __ddAccessToken; } catch (e0) {}
          try { localStorage.setItem('accessToken', __ddAccessToken); } catch (e1) {}
          try { window.dispatchEvent(new Event('dd-auth-token')); } catch (e2) {}
        } catch (e) {}
      })();
      (function() {
        // DEV only: bridge web fetch/XHR errors to RN DEV TRACE (no body/PII).
        try {
          var enabled = ${DEVTOOLS_ENABLED ? 'true' : 'false'};
          if (!enabled) return;
          if (window.__ddDevtoolsInstalled) return;
          window.__ddDevtoolsInstalled = true;
          var __ddAccessToken = (function() {
            try { return String(window.__ddAccessToken || localStorage.getItem('accessToken') || ''); } catch (e) { return ''; }
          })();
          var __ddRidSeq = 0;
          function nextRid() {
            __ddRidSeq = (__ddRidSeq + 1) % 1000000;
            return String(Date.now()) + '-w' + String(__ddRidSeq);
          }

          function post(event, properties) {
            try {
              var msg = { type: 'ANALYTICS', payload: { event: event, properties: properties || {} }, timestamp: Date.now() };
              if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify(msg));
              }
            } catch (e) {}
          }

          function getHeaderValue(headers, keyLower) {
            if (!headers) return '';
            try {
              if (typeof headers.get === 'function') {
                // Headers object
                return String(headers.get(keyLower) || headers.get(keyLower.toLowerCase()) || '');
              }
            } catch (e) {}
            try {
              if (Array.isArray(headers)) {
                // [ [k,v], ... ]
                for (var i = 0; i < headers.length; i++) {
                  var kv = headers[i];
                  if (!kv || kv.length < 2) continue;
                  var k = String(kv[0] || '').toLowerCase();
                  if (k === keyLower) return String(kv[1] || '');
                }
              }
            } catch (e) {}
            try {
              // plain object
              for (var k2 in headers) {
                if (!Object.prototype.hasOwnProperty.call(headers, k2)) continue;
                if (String(k2).toLowerCase() === keyLower) return String(headers[k2] || '');
              }
            } catch (e) {}
            return '';
          }

          function hasAuth(headers) {
            try {
              var v = getHeaderValue(headers, 'authorization');
              return !!(v && String(v).trim());
            } catch (e) {
              return false;
            }
          }

          function setHeader(headers, key, value) {
            if (!headers) return headers;
            try {
              if (typeof headers.set === 'function') {
                // Headers object
                headers.set(key, value);
                return headers;
              }
            } catch (e) {}
            try {
              if (typeof headers.append === 'function') {
                headers.append(key, value);
                return headers;
              }
            } catch (e) {}
            try {
              if (Array.isArray(headers)) {
                headers.push([key, value]);
                return headers;
              }
            } catch (e) {}
            try {
              headers[key] = value;
            } catch (e) {}
            return headers;
          }

          // One-time auth state ping (no token value).
          post('WEB_AUTH_STATE', { hasToken: !!(__ddAccessToken && String(__ddAccessToken).trim()) });

          // fetch hook
          var _fetch = window.fetch;
          if (typeof _fetch === 'function') {
            window.fetch = function(input, init) {
              var rid = nextRid();
              var method = (init && init.method) ? String(init.method).toUpperCase() : 'GET';
              var u = '';
              try { u = (typeof input === 'string') ? input : (input && input.url) ? String(input.url) : ''; } catch (e) {}
              try { u = String(u || '').split('#')[0].split('?')[0]; } catch (e) {}
              // Next.js Server Action detection (prevents "Failed to find Server Action" stuck states after redeploy).
              var isServerAction = false;
              try {
                var hv = getHeaderValue(init && init.headers, 'next-action');
                isServerAction = !!(hv && String(hv).trim());
              } catch (e) {}
              // Attach rid header (CORS must allow X-DD-Request-Id)
              var __ddAuthAttached = 0;
              try {
                if (!init) init = {};
                var h = init.headers || {};
                h = setHeader(h, 'X-DD-Request-Id', rid);
                // Force Authorization from RN token to prevent initial 401 race.
                // (Do NOT log the token value.)
                if (__ddAccessToken && !hasAuth(h)) {
                  h = setHeader(h, 'Authorization', 'Bearer ' + String(__ddAccessToken));
                  __ddAuthAttached = 1;
                }
                init.headers = h;
              } catch (e) {}
              post('WEB_FETCH_START', { rid: rid, method: method, url: u, auth: (__ddAccessToken ? 1 : 0), authAttached: __ddAuthAttached });
              return _fetch.apply(this, arguments).then(function(res) {
                var st = res && typeof res.status === 'number' ? res.status : null;
                post('WEB_FETCH', { rid: rid, method: method, url: u, status: st, serverAction: isServerAction ? true : undefined });
                // Self-heal: if a Server Action call fails (often due to older/newer deployment mismatch), reload once.
                try {
                  if (isServerAction && st != null && Number(st) >= 500) {
                    if (!window.__ddServerActionReloaded) {
                      window.__ddServerActionReloaded = true;
                      post('WEB_SERVER_ACTION_RELOAD', { rid: rid, method: method, url: u, status: st });
                      setTimeout(function() { try { location.reload(); } catch (e) {} }, 50);
                    }
                  }
                } catch (e) {}
                return res;
              }).catch(function(err) {
                post('WEB_FETCH_ERR', { rid: rid, method: method, url: u, message: String((err && err.message) || err) });
                throw err;
              });
            };
          }

          // XHR hook
          var XHR = window.XMLHttpRequest;
          if (XHR && XHR.prototype) {
            var _open = XHR.prototype.open;
            var _send = XHR.prototype.send;
            XHR.prototype.open = function(method, url) {
              try {
                var uu = String(url || '');
                try { uu = uu.split('#')[0].split('?')[0]; } catch (e2) {}
                this.__dd = { rid: nextRid(), method: String(method).toUpperCase(), url: uu };
              } catch (e) {}
              return _open.apply(this, arguments);
            };
            XHR.prototype.send = function() {
              var self = this;
              try {
                var meta = self.__dd || { rid: nextRid(), method: 'GET', url: '' };
                try { self.setRequestHeader('X-DD-Request-Id', meta.rid); } catch (e2) {}
                // Force Authorization from RN token to prevent initial 401 race.
                try {
                  if (__ddAccessToken) {
                    self.setRequestHeader('Authorization', 'Bearer ' + String(__ddAccessToken));
                    meta.auth = 1;
                  }
                } catch (e3) {}
                post('WEB_XHR_START', meta);
                self.addEventListener('loadend', function() {
                  try { post('WEB_XHR', { rid: meta.rid, method: meta.method, url: meta.url, status: self.status }); } catch (e) {}
                });
              } catch (e) {}
              return _send.apply(this, arguments);
            };
          }

          // runtime errors
          window.addEventListener('error', function(e) {
            try { post('WEB_ERROR', { message: e && e.message ? String(e.message) : 'error', source: e && e.filename ? String(e.filename) : '', line: e && e.lineno ? e.lineno : null }); } catch (e2) {}
          });

          // unhandled promise rejections
          window.addEventListener('unhandledrejection', function(e) {
            try {
              var msg = '';
              try { msg = String((e && e.reason && (e.reason.message || e.reason)) || 'unhandledrejection'); } catch (e2) {}
              post('WEB_REJECT', { message: msg });
            } catch (e3) {}
          });

          // console hooks (PII=0, truncate)
          try {
            var c = window.console || {};
            function trunc(x) {
              try {
                var s = String(x == null ? '' : x);
                if (s.length > 180) s = s.slice(0, 180) + '…';
                return s;
              } catch (e) { return ''; }
            }
            var _err = c.error;
            c.error = function() {
              try { post('WEB_CONSOLE_ERROR', { message: trunc(arguments && arguments[0]) }); } catch (e) {}
              if (typeof _err === 'function') return _err.apply(c, arguments);
            };
            var _warn = c.warn;
            c.warn = function() {
              try { post('WEB_CONSOLE_WARN', { message: trunc(arguments && arguments[0]) }); } catch (e) {}
              if (typeof _warn === 'function') return _warn.apply(c, arguments);
            };
          } catch (e) {}
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
        if (DEVTOOLS_ENABLED) {
            devlog({ scope: 'SYS', level: 'info', message: 'webview: loadEnd' });
        }

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

        // DEV handshake: prove the web runtime is alive + token is visible from WebView side.
        if (DEVTOOLS_ENABLED) {
            const probe = `
        (function() {
          try {
            var has = false;
            try { has = !!(localStorage.getItem('accessToken') || ''); } catch (e) {}
            var msg = { type: 'READY', payload: { phase: 'loadEnd', href: String(location && location.href || ''), hasToken: has }, timestamp: Date.now() };
            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          } catch (e) {}
        })();
        true;
      `;
            webViewRef.current?.injectJavaScript(probe);
        }
    }, [DEVTOOLS_ENABLED, token, user, sendAuthToken, sendUserInfo, setLoading, setReady, webViewRef]);

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
            if (DEVTOOLS_ENABLED) {
                try {
                    const short = String(nav.url || '').split('?')[0] || String(nav.url || '');
                    devlog({ scope: 'SYS', level: 'info', message: `webview: nav url=${short}` });
                } catch {
                    // ignore
                }
            }
        },
        [DEVTOOLS_ENABLED, updateNavigation]
    );

    // ============================================
    // URL 허용 여부 확인
    // ============================================
    const handleShouldStartLoad = useCallback(
        (request: any) => {
            // IMPORTANT:
            // - Only enforce URL allow/block on TOP frame navigations.
            // - Some Android/iOS WebView implementations call this for subresources; blocking those can "kill" pages.
            const isTopFrame =
                request?.isTopFrame === false || request?.isMainFrame === false ? false : true;
            if (!isTopFrame) return true;

            const ok = isAllowedUrl(String(request?.url || ''));
            if (!ok) {
                setError(
                    `차단된 이동입니다.\nURL=${request.url}\n\n(로그인/인증 페이지는 RN 네이티브에서만 가능합니다)`,
                );
                if (DEVTOOLS_ENABLED) {
                    devlog({ scope: 'SYS', level: 'warn', message: `webview: blocked url=${request.url}` });
                }
            }
            return ok;
        },
        [DEVTOOLS_ENABLED, setError]
    );

    // ============================================
    // 에러 처리
    // ============================================
    const handleError = useCallback(
        (syntheticEvent: { nativeEvent: { description: string } }) => {
            setError(syntheticEvent.nativeEvent.description);
            if (DEVTOOLS_ENABLED) {
                devlog({
                    scope: 'SYS',
                    level: 'error',
                    message: 'webview: error',
                    meta: { desc: syntheticEvent?.nativeEvent?.description },
                });
            }
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
            // Enforce "token owner = RN": clear token shadow-copy in WebView runtime on unmount.
            try {
                const script = `
          (function() {
            try { localStorage.removeItem('accessToken'); } catch (e) {}
            try { window.__ddAccessToken = ''; } catch (e) {}
          })();
          true;
        `;
                webViewRef.current?.injectJavaScript(script);
            } catch {
                // ignore
            }
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
                onLoadStart={() => {
                    setLoading(true);
                    if (DEVTOOLS_ENABLED) devlog({ scope: 'SYS', level: 'info', message: `webview: loadStart url=${url}` });
                }}
                onLoadEnd={handleLoadEnd}
                injectedJavaScriptBeforeContentLoaded={injectedBeforeContentLoaded}
                onMessage={handleMessage}
                onNavigationStateChange={handleNavigationStateChange}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                onHttpError={(e: any) => {
                    const ne = e?.nativeEvent;
                    const status = ne?.statusCode;
                    const u = ne?.url;
                    const isMain = ne?.isMainFrame;
                    if (DEVTOOLS_ENABLED) {
                        devlog({
                            scope: 'SYS',
                            level: 'error',
                            message: `webview: httpError ${String(status)} url=${String(u || '')}`,
                            meta: { status, url: u, isMainFrame: isMain },
                        });
                    }
                    if (typeof status === 'number' && status >= 400 && isMain !== false) {
                        setError(`WebView HTTP error.\nstatus=${status}\nURL=${String(u || url)}`);
                    }
                }}
                onError={handleError}
                {...WEBVIEW_CONFIG}
                style={{ flex: 1 }}
            />
        </View>
    );
}
