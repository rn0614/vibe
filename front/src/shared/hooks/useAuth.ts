import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { ApiException, authApi, supabase } from "@/shared/api";

// Auth User Query Key
export const AUTH_USER_QUERY_KEY = ["auth", "user"] as const;

/**
 * 통합 인증 훅 - 모든 인증 관련 기능을 하나로 관리
 * - 사용자 상태 관리 (TanStack Query)
 * - 인증 액션들 (TanStack Query Mutations)
 * - Supabase auth state change 리스너
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  // 🔥 1. 사용자 상태 관리 (TanStack Query)
  const userQuery = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await authApi.getCurrentUser();
        return response.data.data.user;
      } catch {
        console.log("No authenticated user");
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: (failureCount, error: ApiException) => {
      // 인증 오류는 재시도하지 않음
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // 🔥 2. Supabase auth state change 리스너 (통합 관리)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      switch (event) {
        case "SIGNED_IN":
          console.log("User signed in:", session?.user?.email);
          if (session?.user) {
            queryClient.setQueryData(AUTH_USER_QUERY_KEY, session.user);
          }
          break;

        case "SIGNED_OUT":
          console.log("User signed out");
          queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
          // 모든 인증 관련 쿼리 무효화
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === "auth" || query.queryKey.includes("user"),
          });
          break;

        case "TOKEN_REFRESHED":
          console.log("Token refreshed");
          queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
          break;

        case "USER_UPDATED":
          console.log("User updated");
          queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
          break;

        case "PASSWORD_RECOVERY":
          console.log("Password recovery initiated");
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // 🔥 6. 로그아웃 Mutation (navigation 분리)
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authApi.signOut();
      // Supabase auth state change에서 자동으로 상태 정리됨
    },
    onError: (error: ApiException) => {
      console.error("로그아웃 실패:", error);
    },
  });

  // 🔥 7. Google OAuth 로그인
  const signInWithGoogleMutation = useMutation({
    mutationFn: async (redirectTo?: string) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo || window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      // OAuth는 리다이렉트되므로 여기서는 별도 처리 없음
    },
    onError: (error: ApiException) => {
      console.error("Google 로그인 실패:", error);
    },
  });

  // 🔥 8. Google One-Tap 로그인
  const signInWithGoogleIdTokenMutation = useMutation({
    mutationFn: async ({
      idToken,
      nonce,
    }: {
      idToken: string;
      nonce?: string;
    }) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
        nonce,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // 성공 시 user 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
    },
    onError: (error: ApiException) => {
      console.error("Google One-Tap 로그인 실패:", error);
    },
  });

  return {
    // 🔥 사용자 상태 (통합)
    user: userQuery.data ?? null,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    isAuthenticated: !!userQuery.data,
    refetch: userQuery.refetch,

    // 🔥 로그아웃
    signOut: signOutMutation.mutate,
    signOutAsync: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
    signOutError: signOutMutation.error,

    // 🔥 Google OAuth
    signInWithGoogle: signInWithGoogleMutation.mutate,
    signInWithGoogleAsync: signInWithGoogleMutation.mutateAsync,
    isSigningInWithGoogle: signInWithGoogleMutation.isPending,
    signInWithGoogleError: signInWithGoogleMutation.error,

    // 🔥 Google One-Tap
    signInWithGoogleIdToken: signInWithGoogleIdTokenMutation.mutate,
    signInWithGoogleIdTokenAsync: signInWithGoogleIdTokenMutation.mutateAsync,
    isSigningInWithGoogleIdToken: signInWithGoogleIdTokenMutation.isPending,
    signInWithGoogleIdTokenError: signInWithGoogleIdTokenMutation.error,

    // 🔥 전체 액션 로딩 상태
    isActionLoading:
      signOutMutation.isPending ||
      signInWithGoogleMutation.isPending ||
      signInWithGoogleIdTokenMutation.isPending,
  };
};

/**
 * 사용자 인증 상태만 확인하는 경량 훅
 */
export const useIsAuthenticated = () => {
  const { user, isLoading } = useAuth();
  return {
    isAuthenticated: !!user,
    isLoading,
  };
};
