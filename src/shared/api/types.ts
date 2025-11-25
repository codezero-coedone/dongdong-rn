import type { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Axios 요청 설정 확장 (재시도 플래그 추가)
 */
export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * API 에러 타입
 */
export type ApiError = AxiosError<ApiErrorResponse>;

/**
 * 토큰 갱신 응답 타입
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}
