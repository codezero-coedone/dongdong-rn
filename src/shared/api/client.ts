import { config } from "@/shared/config";
import { secureStorage } from "@/shared/lib/storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import type { ApiErrorResponse, ExtendedAxiosRequestConfig } from "./types";
import { devlog } from "@/shared/devtools/devlog";

/**
 * 토큰 갱신 중인지 여부
 */
let isRefreshing = false;

/**
 * 토큰 갱신 대기 중인 요청 큐
 */
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

/**
 * 대기 중인 요청들 처리
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

let seq = 0;
const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");

/**
 * Request Interceptor
 * 모든 요청에 Authorization 헤더 추가
 */
apiClient.interceptors.request.use(
  async (config) => {
    if (DEVTOOLS_ENABLED) {
      const rid = `${Date.now()}-${++seq}`;
      (config as any).__dd = {
        rid,
        startedAt: Date.now(),
        method: String(config.method || "get").toUpperCase(),
        url: String(config.url || ""),
      };
      try {
        config.headers["X-DD-Request-Id"] = rid;
      } catch {
        // ignore
      }
    }

    const token = await secureStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발 환경에서 요청 로깅
    if (__DEV__) {
      console.log(
        `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    if (DEVTOOLS_ENABLED) {
      const dd = (config as any).__dd;
      devlog({
        scope: "API",
        level: "info",
        message: `${dd?.method || "GET"} ${dd?.url || config.url || ""} → …`,
        meta: { rid: dd?.rid, method: dd?.method, url: dd?.url },
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 401 에러 시 토큰 갱신 및 요청 재시도
 */
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서 응답 로깅
    if (__DEV__) {
      console.log(`✅ [API Response] ${response.config.url}`, response.status);
    }

    if (DEVTOOLS_ENABLED) {
      try {
        const dd = (response.config as any)?.__dd;
        const startedAt =
          typeof dd?.startedAt === "number" ? dd.startedAt : undefined;
        const ms = startedAt ? Date.now() - startedAt : undefined;
        const url = dd?.url || response.config.url || "";
        const method =
          dd?.method || String(response.config.method || "get").toUpperCase();
        devlog({
          scope: "API",
          level: "info",
          message: `${method} ${url} → ${response.status}${typeof ms === "number" ? ` (${ms}ms)` : ""}`,
          meta: { rid: dd?.rid, method, url, status: response.status, ms },
        });
      } catch {
        // ignore
      }
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // 개발 환경에서 에러 로깅
    if (__DEV__) {
      console.log(
        `❌ [API Error] ${originalRequest?.url}`,
        error.response?.status
      );
    }

    if (DEVTOOLS_ENABLED) {
      try {
        const dd = (originalRequest as any)?.__dd;
        const startedAt =
          typeof dd?.startedAt === "number" ? dd.startedAt : undefined;
        const ms = startedAt ? Date.now() - startedAt : undefined;
        const status = (error as any)?.response?.status;
        const url = dd?.url || originalRequest?.url || "";
        const method =
          dd?.method || String(originalRequest?.method || "get").toUpperCase();
        const backendMsg =
          (error as any)?.response?.data?.message ||
          (error as any)?.response?.data?.error ||
          "";

        if (typeof status === "number") {
          devlog({
            scope: "API",
            level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
            message: `${method} ${url} → ${status}${typeof ms === "number" ? ` (${ms}ms)` : ""}${backendMsg ? ` | ${String(backendMsg)}` : ""}`,
            meta: { rid: dd?.rid, method, url, status, ms },
          });
        } else {
          devlog({
            scope: "API",
            level: "error",
            message: `${method} ${url} → NETWORK${typeof ms === "number" ? ` (${ms}ms)` : ""} | ${String((error as any)?.message || error)}`,
            meta: { rid: dd?.rid, method, url, ms },
          });
        }
      } catch {
        // ignore
      }
    }

    // 401 에러이고, 이미 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 갱신 중인 경우, 큐에 추가하고 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 시도
        const newToken = await refreshToken();

        if (newToken) {
          // 새 토큰 저장
          await secureStorage.setToken(newToken);

          // 대기 중인 요청들 처리
          processQueue(null, newToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리 필요
        processQueue(refreshError, null);
        await handleAuthError();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 토큰 갱신 함수
 * TODO: 실제 API 엔드포인트로 교체 필요
 */
async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = await secureStorage.get("refresh_token");
    if (!refreshToken) return null;

    // Backend contract: POST /auth/refresh { refresh_token } -> { status, message, data: { access_token, refresh_token } }
    const response = await axios.post(`${config.API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const data: any = (response as any)?.data?.data;
    const access_token: string | undefined = data?.access_token;
    const refresh_token: string | undefined = data?.refresh_token;

    if (!access_token) return null;

    await secureStorage.setToken(access_token);
    if (refresh_token) {
      await secureStorage.set("refresh_token", refresh_token);
    }

    return access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

/**
 * 인증 에러 처리 (로그아웃)
 */
async function handleAuthError(): Promise<void> {
  await secureStorage.clearAll();
  // 여기서 로그인 화면으로 리다이렉트
  // 실제로는 zustand store나 navigation을 통해 처리
  console.log("🚪 Auth error - User logged out");
}

export { apiClient };
export default apiClient;
