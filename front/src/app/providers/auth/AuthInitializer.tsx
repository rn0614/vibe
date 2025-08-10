import { useAuth } from '@/shared/hooks/useAuth';

/**
 * 앱 초기화 시 인증 상태를 설정하는 컴포넌트
 * useAuth 훅만 호출하여 통합 인증 시스템 초기화
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useAuth 훅 호출로 모든 인증 관련 기능 초기화
  // - 사용자 상태 관리 (TanStack Query)
  // - 인증 액션들 (TanStack Query Mutations)
  // - Supabase auth state change 리스너 등록
  useAuth();

  return <>{children}</>;
};
