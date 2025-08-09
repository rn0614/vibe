import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Navigation이 필요한 인증 액션들을 위한 래퍼 훅
 * Router 컨텍스트 내에서만 사용 가능
 */
export const useAuthActions = () => {
  const navigate = useNavigate();
  const auth = useAuth();



  const signOutWithRedirect = async (redirectTo = '/') => {
    try {
      await auth.signOutAsync();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogleRedirect = async (redirectTo?: string) => {
    try {
      // Google OAuth는 페이지를 떠나므로 navigation 불필요
      await auth.signInWithGoogleAsync(redirectTo);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogleIdTokenRedirect = async (idToken: string, nonce?: string, redirectTo = '/') => {
    try {
      await auth.signInWithGoogleIdTokenAsync({ idToken, nonce });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      throw error;
    }
  };

  return {
    // 기본 auth 기능들 (navigation 없음)
    ...auth,
    
    // navigation 포함 액션들
    signOutWithRedirect,
    signInWithGoogleRedirect,
    signInWithGoogleIdTokenRedirect,
  };
};
