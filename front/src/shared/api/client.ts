import { supabase } from './supabase';
import type { 
  ApiResponse
} from '@/shared/types/api';
import { isAuthError } from '@/shared/types/api';
import type { AuthError, PostgrestError } from '@supabase/supabase-js';

// API 에러 클래스 - Supabase 에러와 통합
export class ApiException extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;
  public hint?: string;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
    hint?: string
  ) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.details = details;
    this.hint = hint;
  }

  // Supabase AuthError에서 ApiException 생성
  static fromAuthError(error: AuthError): ApiException {
    const statusMap: Record<string, number> = {
      'invalid_credentials': 401,
      'email_not_confirmed': 422,
      'signup_disabled': 403,
      'weak_password': 400,
      'invalid_request': 400,
      'rate_limit_exceeded': 429,
    };

    return new ApiException(
      statusMap[error.message] || 400,
      error.message,
      error.message,
      error
    );
  }

  // Supabase PostgrestError에서 ApiException 생성
  static fromPostgrestError(error: PostgrestError): ApiException {
    return new ApiException(
      400,
      error.message,
      error.code,
      error.details,
      error.hint
    );
  }
}

// API 응답 래퍼 함수 - Supabase 에러 타입과 통합
export const apiWrapper = async <T>(
  request: () => Promise<{ data: T; error: unknown }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await request();
    
    if (error) {
      // AuthError 타입 체크
      if (isAuthError(error)) {
        throw ApiException.fromAuthError(error);
      }
      
      // PostgrestError 타입 체크
      if (error && typeof error === 'object' && 'code' in error) {
        throw ApiException.fromPostgrestError(error as PostgrestError);
      }
      
      throw new ApiException(
        400,
        '알 수 없는 오류가 발생했습니다.',
        'UNKNOWN_ERROR',
        error
      );
    }

    return {
      data,
      status: 200,
      message: 'success',
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    throw new ApiException(
      500,
      '서버 오류가 발생했습니다.',
      'INTERNAL_ERROR',
      error
    );
  }
};

// 인증 관련 API
export const authApi = {
  getCurrentUser: async () => {
    const response = await supabase.auth.getUser();
    return apiWrapper(() => Promise.resolve({ data: response, error: null }));
  },
    
  signIn: async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    return apiWrapper(() => Promise.resolve({ data: response, error: null }));
  },
    
  signUp: async (email: string, password: string) => {
    const response = await supabase.auth.signUp({ email, password });
    return apiWrapper(() => Promise.resolve(response));
  },
    
  signOut: async () => {
    const response = await supabase.auth.signOut();
    return apiWrapper(() => Promise.resolve({ data: null, error: response.error }));
  },
    
  resetPassword: async (email: string) => {
    const response = await supabase.auth.resetPasswordForEmail(email);
    return apiWrapper(() => Promise.resolve({ data: null, error: response.error }));
  },
};

// 기본 CRUD API 헬퍼
// 주의: 실제 DB 타입 생성 후 주석을 해제하고 사용하세요 (npm run supabase:types)
/*
export const createCrudApi = <T extends Record<string, any>>(tableName: string) => {
  return {
    findAll: async () => {
      const response = await supabase.from(tableName).select('*');
      return apiWrapper(() => Promise.resolve(response));
    },
      
    findById: async (id: string) => {
      const response = await supabase.from(tableName).select('*').eq('id', id).single();
      return apiWrapper(() => Promise.resolve(response));
    },
      
    create: async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await supabase.from(tableName).insert(data).select().single();
      return apiWrapper(() => Promise.resolve(response));
    },
      
    update: async (id: string, data: Partial<T>) => {
      const response = await supabase.from(tableName).update(data).eq('id', id).select().single();
      return apiWrapper(() => Promise.resolve(response));
    },
      
    delete: async (id: string) => {
      const response = await supabase.from(tableName).delete().eq('id', id);
      return apiWrapper(() => Promise.resolve(response));
    },
  };
};
*/

// 임시 플레이스홀더 - 실제 DB 연결 후 위의 주석을 해제하세요
export const createCrudApi = () => {
  throw new Error('createCrudApi: DB 타입 생성 후 사용하세요. npm run supabase:types를 실행하고 주석을 해제하세요.');
};
