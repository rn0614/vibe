// 공통 유틸리티 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type Theme = 'light' | 'dark';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// 상태 관리 관련 타입
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 폼 관련 타입
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}
