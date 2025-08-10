import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY 환경변수가 필요합니다.');
}

// Supabase 클라이언트 생성 (타입 정보와 함께)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database 타입을 re-export하여 다른 곳에서 쉽게 사용할 수 있도록 함
export type { Database };
