import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY 환경변수가 필요합니다.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database 타입 정의 (나중에 supabase gen types로 자동 생성 가능)
export interface Database {
  public: {
    Tables: {
      // 테이블 타입들을 여기에 정의
      // 예시:
      // users: {
      //   Row: {
      //     id: string;
      //     email: string;
      //     name: string;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     email: string;
      //     name: string;
      //   };
      //   Update: {
      //     email?: string;
      //     name?: string;
      //   };
      // };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
