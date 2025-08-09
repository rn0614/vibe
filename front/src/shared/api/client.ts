import { supabase } from './supabase';
import type { ApiResponse } from '@/shared/types';

// API 에러 클래스
export class ApiException extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// API 응답 래퍼 함수
export const apiWrapper = async <T>(
  request: () => Promise<{ data: T; error: any }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await request();
    
    if (error) {
      throw new ApiException(
        error.status || 400,
        error.message || 'API 요청 중 오류가 발생했습니다.',
        error.code,
        error.details
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
export const createCrudApi = <T>(tableName: string) => ({
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
});
