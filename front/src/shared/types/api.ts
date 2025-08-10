import type { AuthError } from '@supabase/supabase-js';

// API 관련 공통 타입 정의
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

// Supabase 에러 타입과 연동된 API 에러
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: unknown;
}

// Supabase 특화 에러 타입들
export interface SupabaseError extends ApiError {
  code: string;
  details?: string;
  hint?: string;
}

export interface SupabaseAuthError extends ApiError {
  message: string;
  status: 400 | 401 | 403 | 422 | 429 | 500;
}

// 에러 타입 가드 함수들
export const isAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isSupabaseError = (error: unknown): error is SupabaseError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
};

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 요청 설정
export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}
