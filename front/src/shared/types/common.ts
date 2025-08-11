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
