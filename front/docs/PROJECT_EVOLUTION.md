# 📈 프로젝트 진화 과정

> 실제 개발 과정에서 마주한 문제들과 해결책들

## 🚀 **Phase 1: 초기 FSD 구조 설정**

### ✅ **완료된 작업**
- Feature-Sliced Design 기본 구조 구축
- 기본 UI 컴포넌트 (`Button`, `Input`, `Layout`) 개발
- Sass + CSS Modules 스타일링 시스템 구축
- TypeScript 설정 및 Path Alias 구성

### 🎯 **핵심 결정사항**
```
front/src/
├── app/           # 앱 초기화, 전역 설정
├── pages/         # 페이지 컴포넌트
├── widgets/       # 독립적인 UI 블록
├── features/      # 사용자 상호작용
├── entities/      # 비즈니스 엔티티
├── shared/        # 공유 코드
└── styles/        # 전역 스타일
```

## 🔄 **Phase 2: 상태 관리 통합**

### ✅ **완료된 작업**
- TanStack Query 설정 (서버 상태 관리)
- Zustand 설정 (클라이언트 상태 관리)
- Supabase 클라이언트 초기화
- API 래퍼 함수 구현

### 🎯 **핵심 결정사항**
```typescript
// 상태 관리 분리 원칙 확립
TanStack Query: 서버 상태 (user, posts, etc.)
Zustand: 클라이언트 상태 (theme, notifications, etc.)
React State: 컴포넌트 로컬 상태 (form data, etc.)
```

### ⚠️ **초기 문제점**
- `authStore`에서 서버 상태(`user`)와 클라이언트 상태가 혼재
- `useAuthUser`와 `useAuth`로 불필요한 분리
- 중복된 auth state change 리스너

## 🔥 **Phase 3: 인증 시스템 구축**

### ✅ **완료된 작업**
- Supabase Auth 통합
- 이메일/비밀번호 인증
- Google OAuth (표준 + One-Tap)
- 로그인/회원가입 페이지

### 🎯 **핵심 결정사항**
```typescript
// 초기 분리된 구조
useAuthUser(); // 사용자 상태만
useAuth();     // 인증 액션만

// 문제점 발견:
// 1. 역할 중복
// 2. 상태 동기화 충돌
// 3. 불필요한 복잡성
```

### ⚠️ **마주한 문제**
- **중복 상태 관리**: 두 훅이 모두 인증을 관리
- **동기화 충돌**: 두 곳에서 같은 `queryClient` 조작
- **복잡한 사용법**: 개발자가 두 훅을 모두 알아야 함

## 🎯 **Phase 4: 아키텍처 통합 및 개선**

### ✅ **완료된 작업**
- `useAuthUser` + `useAuth` → 하나의 `useAuth`로 통합
- 단일 진실의 원천 구축
- 중복 리스너 제거
- 상태 충돌 해결

### 🎯 **핵심 개선사항**
```typescript
// 통합된 useAuth 훅
export const useAuth = () => {
  // 1. 사용자 상태 관리 (TanStack Query)
  const userQuery = useQuery(['auth', 'user'], fetchUser);
  
  // 2. Supabase auth state change 리스너 (단일)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      // 모든 auth 이벤트를 한 곳에서 처리
    });
  }, []);
  
  // 3. 인증 액션들 (TanStack Query Mutations)
  const signInMutation = useMutation(/* ... */);
  
  return {
    // 상태 + 액션을 모두 포함
    user, isLoading, signIn, signOut, // ...
  };
};
```

### 🎊 **달성된 효과**
- **50% 줄어든 코드**: 두 개 훅 → 하나의 훅
- **Zero 중복**: 상태 충돌 완전 제거
- **단순한 사용법**: `useAuth()` 하나만 import
- **명확한 역할**: 인증은 `useAuth`만 담당

## 🚨 **Phase 5: Router 컨텍스트 문제 해결**

### ⚠️ **발견된 문제**
```
Uncaught Error: useNavigate() may be used only in the context of a <Router> component.
```

### 🔍 **문제 분석**
```typescript
// 문제 상황
<QueryProvider>
  <AuthInitializer /> {/* useAuth() 호출 → useNavigate() 에러 */}
  <AppRouter />       {/* Router는 여기서 시작 */}
</QueryProvider>
```

### ✅ **해결책: Core + Action Hook 패턴**
```typescript
// useAuth.ts (Core Hook) - Router 독립적
export const useAuth = () => {
  // useNavigate 제거
  const signOut = useMutation({
    mutationFn: () => authApi.signOut()
    // navigation 로직 없음
  });
};

// useAuthActions.ts (Action Hook) - Router 의존적  
export const useAuthActions = () => {
  const navigate = useNavigate(); // Router 컨텍스트 필요
  const auth = useAuth();
  
  const signOutWithRedirect = async (redirectTo = '/') => {
    await auth.signOutAsync();
    navigate(redirectTo, { replace: true });
  };
};
```

### 🎯 **새로운 패턴 확립**
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

### 🎊 **최종 사용 패턴**
```typescript
// AuthInitializer (Router 밖) - Core Hook만
const AuthInitializer = () => useAuth();

// Header (Router 안) - Action Hook
const Header = () => {
  const { user, signOutWithRedirect } = useAuthActions();
};

// UserProfile (어디서나) - Core Hook  
const UserProfile = () => {
  const { user } = useAuth();
};
```

## 📊 **전체 진화 요약**

### **Before (문제 많던 초기)**
```typescript
❌ authStore: user + session (서버 상태를 클라이언트에서 관리)
❌ useAuthUser: 상태만
❌ useAuth: 액션만
❌ 중복 리스너
❌ Router 컨텍스트 에러
```

### **After (완벽한 최종)**
```typescript
✅ useAuth: 순수 인증 로직 (Router 독립)
✅ useAuthActions: navigation 포함 (Router 의존)
✅ TanStack Query: 서버 상태
✅ Zustand: 클라이언트 상태만
✅ 단일 진실의 원천
```

## 🎯 **핵심 교훈들**

### 1. **상태 분리의 중요성**
- **서버 상태**: TanStack Query로만 관리
- **클라이언트 상태**: Zustand로만 관리
- **로컬 상태**: React State로만 관리

### 2. **단일 진실의 원천**
- 같은 기능을 여러 곳에서 관리하면 충돌 발생
- 하나의 Hook이 하나의 관심사를 완전히 담당

### 3. **Router 컨텍스트 분리**
- Core Hook: 순수한 비즈니스 로직 (Router 독립)
- Action Hook: UI/UX 로직 (Router 의존)

### 4. **점진적 개선의 가치**
- 문제를 발견하면 즉시 개선
- 완벽한 아키텍처는 한 번에 나오지 않음
- 실제 사용하면서 패턴이 확립됨

## 🔗 **최종 아키텍처 문서**

- [HOOKS_ARCHITECTURE_GUIDE.md](./HOOKS_ARCHITECTURE_GUIDE.md) - Hook 분리 패턴
- [AUTH_UNIFIED_ARCHITECTURE.md](./AUTH_UNIFIED_ARCHITECTURE.md) - 통합 인증 시스템  
- [DEVELOPMENT_PATTERNS.md](./DEVELOPMENT_PATTERNS.md) - 검증된 개발 패턴
- [.cursor/rules/hooks.mdc](../.cursor/rules/hooks.mdc) - Hook 개발 규칙

## 🚀 **다음 단계**

### **앞으로 적용할 패턴들**
1. **새로운 기능 개발 시 Core + Action 패턴 적용**
2. **다른 Hook들도 Router 컨텍스트 분리 검토**
3. **FSD 레이어별 Hook 사용 가이드라인 정리**
4. **Performance 패턴 적용 (React.memo, useCallback 등)**

이제 **검증된 아키텍처**를 가지고 있으므로, 새로운 기능을 안전하고 효율적으로 개발할 수 있습니다! 🎉

