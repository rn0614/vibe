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

// 에러 타입 가드 함수들
export const isAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}
