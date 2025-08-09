# 🎯 Hooks 아키텍처 가이드

> Router 컨텍스트와 인증 훅의 올바른 분리 패턴

## 🚨 **핵심 원칙: Router 컨텍스트 분리**

### ❌ **잘못된 패턴**
```typescript
// useAuth.ts에서 useNavigate 사용 (위험!)
export const useAuth = () => {
  const navigate = useNavigate(); // ❌ Router 컨텍스트 의존
  
  const signOut = useMutation({
    onSuccess: () => {
      navigate('/'); // ❌ Router 밖에서 호출 시 에러
    }
  });
};

// AuthInitializer에서 Router 밖에서 호출
<QueryProvider>
  <AuthInitializer /> {/* ❌ useAuth 호출 → useNavigate 에러 */}
  <AppRouter />
</QueryProvider>
```

### ✅ **올바른 패턴**
```typescript
// useAuth.ts - 순수한 인증 로직만
export const useAuth = () => {
  // ✅ Router 컨텍스트 독립적
  const signOut = useMutation({
    mutationFn: () => authApi.signOut(),
    // navigation 없음 - 컴포넌트에서 처리
  });
};

// useAuthActions.ts - Router 컨텍스트 필요한 액션들
export const useAuthActions = () => {
  const navigate = useNavigate(); // ✅ Router 컨텍스트 내에서만 사용
  const auth = useAuth();
  
  const signOutWithRedirect = async (redirectTo = '/') => {
    await auth.signOutAsync();
    navigate(redirectTo, { replace: true });
  };
};
```

## 🏗️ **Hooks 레이어 구조**

### 📊 **명확한 역할 분리**

```
🔥 Core Hooks (Router 독립적)
├── useAuth          # 순수 인증 상태 + 액션
├── useAppStore      # 클라이언트 상태
└── useSupabaseQuery # 일반적인 데이터 페칭

🔥 Action Hooks (Router 의존적)  
├── useAuthActions   # navigation 포함 인증 액션
├── useFormActions   # 폼 제출 + 리다이렉트
└── usePageActions   # 페이지 전환 로직
```

### 🎯 **사용 가이드**

#### 1. **AuthInitializer (Router 밖)**
```typescript
// ✅ Core Hook만 사용
export const AuthInitializer = ({ children }) => {
  useAuth(); // Router 독립적이므로 안전
  return <>{children}</>;
};
```

#### 2. **Header/컴포넌트 (Router 안)**
```typescript
// ✅ Action Hook 사용
export const Header = () => {
  const { user, signOutWithRedirect, isSigningOut } = useAuthActions();
  
  return (
    <button onClick={() => signOutWithRedirect('/')}>
      로그아웃
    </button>
  );
};
```

#### 3. **LoginPage (Router 안)**
```typescript
export const LoginPage = () => {
  const { signInWithRedirect, isSigningIn } = useAuthActions();
  
  const handleSubmit = (data) => {
    signInWithRedirect(data.email, data.password, '/dashboard');
  };
};
```

## 🔄 **Hooks 통합 패턴**

### **useAuth (Core)**
```typescript
export const useAuth = () => {
  // 🔥 1. 사용자 상태 관리 (TanStack Query)
  const userQuery = useQuery(['auth', 'user'], fetchUser);
  
  // 🔥 2. Supabase auth state change 리스너
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      // 상태 동기화만
    });
  }, []);
  
  // 🔥 3. 순수한 인증 액션들 (navigation 없음)
  const signInMutation = useMutation(signInApi);
  const signOutMutation = useMutation(signOutApi);
  
  return {
    // 상태
    user, isLoading, isAuthenticated,
    // 액션 (navigation 없음)
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    // Async 버전 (await 가능)
    signInAsync: signInMutation.mutateAsync,
    signOutAsync: signOutMutation.mutateAsync,
  };
};
```

### **useAuthActions (Router Wrapper)**
```typescript
export const useAuthActions = () => {
  const navigate = useNavigate(); // Router 컨텍스트 필요
  const auth = useAuth();         // Core hook 사용
  
  // 🔥 Navigation 포함 래퍼 함수들
  const signInWithRedirect = async (email, password, redirectTo = '/') => {
    await auth.signInAsync({ email, password });
    navigate(redirectTo, { replace: true });
  };
  
  const signOutWithRedirect = async (redirectTo = '/') => {
    await auth.signOutAsync();
    navigate(redirectTo, { replace: true });
  };
  
  return {
    // Core auth 기능들 (spread)
    ...auth,
    // Navigation 포함 액션들
    signInWithRedirect,
    signOutWithRedirect,
    signUpWithRedirect,
    // ... 기타 navigation 액션들
  };
};
```

## 📋 **개발 체크리스트**

### ✅ **새로운 Hook 개발 시**
- [ ] Router 컨텍스트가 필요한가?
  - Yes: `useXxxActions` 패턴으로 분리
  - No: Core hook으로 개발
- [ ] AuthInitializer에서 사용되는가?
  - Yes: Router 독립적이어야 함
  - No: Action hook 사용 가능
- [ ] 다른 Core hook에서 호출되는가?
  - Yes: Router 독립적이어야 함
  - No: 상황에 따라 선택

### ✅ **Hook 사용 시**
- [ ] Router 컨텍스트 내부인가?
  - Yes: `useXxxActions` 사용 가능
  - No: Core hook만 사용
- [ ] Navigation이 필요한가?
  - Yes: Actions hook 사용
  - No: Core hook 사용
- [ ] 에러 처리가 필요한가?
  - Async 버전 사용 (`xxxAsync`)

## 🎯 **실제 적용 예시**

### **App.tsx 구조**
```typescript
function App() {
  return (
    <QueryProvider>
      <AuthInitializer> {/* useAuth 사용 (Router 독립) */}
        <AppRouter>       {/* 여기서부터 Router 컨텍스트 */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Header에서 useAuthActions 사용 가능 */}
          </Routes>
        </AppRouter>
      </AuthInitializer>
    </QueryProvider>
  );
}
```

### **컴포넌트별 Hook 선택**
```typescript
// ✅ AuthInitializer - Core Hook
const AuthInitializer = () => useAuth();

// ✅ Header - Action Hook (로그아웃 리다이렉트 필요)
const Header = () => useAuthActions();

// ✅ UserProfile - Core Hook (navigation 불필요)
const UserProfile = () => useAuth();

// ✅ LoginForm - Action Hook (로그인 성공 시 리다이렉트)
const LoginForm = () => useAuthActions();
```

## 🚀 **장점**

### 1. **명확한 책임 분리**
- 🔥 **Core Hooks**: 순수한 비즈니스 로직
- 🔥 **Action Hooks**: UI/UX 로직 (navigation 등)

### 2. **Router 컨텍스트 오류 방지**
- 🔥 **에러 원천 차단**: Core hook은 Router 독립적
- 🔥 **안전한 초기화**: AuthInitializer에서 안전하게 사용

### 3. **유연한 사용**
- 🔥 **선택적 navigation**: 필요에 따라 Core/Action 선택
- 🔥 **재사용성**: Core hook은 다양한 컨텍스트에서 사용 가능

### 4. **테스트 용이성**
- 🔥 **Mock 간소화**: Router mock 없이 Core hook 테스트
- 🔥 **단위 테스트**: 비즈니스 로직과 UI 로직 분리 테스트

## 🔗 **관련 문서**

- [AUTH_UNIFIED_ARCHITECTURE.md](./AUTH_UNIFIED_ARCHITECTURE.md) - 통합 인증 아키텍처
- [FSD 구조 가이드](../README.md) - Feature-Sliced Design 적용
- [TypeScript 가이드](.cursor/rules/typescript.mdc) - 타입 안정성

