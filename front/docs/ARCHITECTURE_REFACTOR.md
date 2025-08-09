# Auth 아키텍처 리팩토링 가이드

> Server State와 Client State 분리를 통한 올바른 상태 관리

## 🚨 문제 상황

**기존 문제:**
```typescript
// ❌ 잘못된 접근: User는 서버 상태인데 Zustand에서 관리
const useAuthStore = create((set) => ({
  user: null,        // 서버 상태를 클라이언트 상태로 관리
  session: null,     // 서버 상태를 클라이언트 상태로 관리
  // ...
}));
```

**올바른 접근:**
```typescript
// ✅ TanStack Query: 서버 상태 관리
const { user, isLoading } = useAuthUser();

// ✅ Zustand: 클라이언트 상태만 관리
const { loadingState, error, signOut } = useAuthStore();
```

## 🏗️ 새로운 아키텍처

### 📊 상태 분리 원칙

| 상태 타입 | 관리 도구 | 예시 |
|---------|---------|------|
| **Server State** | TanStack Query | user, session, profile |
| **Client State** | Zustand | loading, error, UI 상태 |

### 🔄 리팩토링된 구조

#### 1. AuthStore (Zustand) - 클라이언트 상태만
```typescript
interface AuthState {
  // ✅ 클라이언트 상태
  loadingState: LoadingState;
  error: string | null;
  initialized: boolean;
  
  // ✅ 액션들 (서버 상태 변경 트리거)
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}
```

#### 2. useAuthUser Hook (TanStack Query) - 서버 상태
```typescript
export const useAuthUser = () => {
  const query = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data.data.user;
    },
    staleTime: 5 * 60 * 1000, // 5분
    // ...
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
  };
};
```

## 🔄 Migration Guide

### Before (잘못된 방식)
```typescript
// ❌ Zustand에서 user 직접 관리
const { user, signOut } = useAuthStore();

useEffect(() => {
  if (user) {
    navigate('/dashboard');
  }
}, [user]);
```

### After (올바른 방식)
```typescript
// ✅ TanStack Query로 user 관리, Zustand로 액션 관리
const { user, isLoading } = useAuthUser();
const { signOut } = useAuthStore();

useEffect(() => {
  if (user && !isLoading) {
    navigate('/dashboard');
  }
}, [user, isLoading]);
```

## 📁 새로운 파일 구조

```
src/
├── shared/
│   ├── hooks/
│   │   └── useAuthUser.ts          # TanStack Query 기반 user 상태
│   └── stores/
│       └── authStore.ts            # Zustand 기반 클라이언트 상태
├── app/
│   └── providers/
│       └── auth/
│           └── AuthInitializer.tsx # 초기화 컴포넌트
└── pages/
    ├── HomePage/
    ├── LoginPage/
    └── SignUpPage/                 # 모두 useAuthUser 사용
```

## 🔧 주요 변경 사항

### 1. AuthStore 정리
- ❌ 제거: `user`, `session` (서버 상태)
- ❌ 제거: `persist` 미들웨어 (서버 상태 지속성은 TanStack Query가 담당)
- ✅ 유지: `loadingState`, `error` (클라이언트 상태)
- ✅ 유지: 인증 액션들 (`signIn`, `signOut` 등)

### 2. TanStack Query 통합
- ✅ `useAuthUser`: 사용자 정보 서버 상태 관리
- ✅ `useIsAuthenticated`: 인증 상태만 확인하는 경량 훅
- ✅ Supabase auth state change와 자동 동기화

### 3. 컴포넌트 업데이트
- ✅ 모든 컴포넌트에서 `useAuthUser()` 사용
- ✅ 액션은 여전히 `useAuthStore()` 사용

## 🎯 장점

### 1. 명확한 관심사 분리
```typescript
// 서버 상태: TanStack Query가 자동으로 관리
const { user, isLoading, error } = useAuthUser();

// 클라이언트 상태: 명시적으로 관리
const { loadingState, signOut } = useAuthStore();
```

### 2. 자동 캐싱 및 동기화
- ✅ 백그라운드 업데이트
- ✅ Stale-while-revalidate
- ✅ 자동 에러 처리
- ✅ 리트라이 로직

### 3. 성능 최적화
- ✅ 불필요한 리렌더링 방지
- ✅ 지능적인 데이터 페칭
- ✅ 메모리 관리 자동화

### 4. 개발자 경험 향상
- ✅ React Query DevTools 활용
- ✅ 타입 안정성 향상
- ✅ 디버깅 용이성

## 🔄 Supabase Auth State 동기화

### 자동 동기화 흐름
```
1. Supabase auth state change 이벤트 발생
   ↓
2. useAuthUser 훅에서 TanStack Query 무효화
   ↓
3. 자동으로 최신 user 정보 페칭
   ↓
4. 모든 컴포넌트 자동 업데이트
```

### 구현 코드
```typescript
// useAuthUser.ts에서
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          queryClient.setQueryData(AUTH_USER_QUERY_KEY, session.user);
          break;
        case 'SIGNED_OUT':
          queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
          break;
        case 'TOKEN_REFRESHED':
          queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
          break;
      }
    }
  );
}, []);
```

## ✅ 체크리스트

### 기본 기능
- [x] TanStack Query로 user 상태 관리
- [x] Zustand에서 클라이언트 상태만 관리
- [x] Supabase auth state change 동기화
- [x] 모든 컴포넌트 업데이트
- [x] Google OAuth 유지

### 고급 기능
- [x] 자동 토큰 갱신 처리
- [x] 에러 상태 관리
- [x] 로딩 상태 최적화
- [x] 캐싱 전략 구현

## 📚 참고 자료

- [TanStack Query Server State 가이드](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Zustand Client State 가이드](https://zustand-demo.pmnd.rs/)
- [Server State vs Client State 차이점](https://tkdodo.eu/blog/practical-react-query#treat-the-query-key-like-a-dependency-array)
