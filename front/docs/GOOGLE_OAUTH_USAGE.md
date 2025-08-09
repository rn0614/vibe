# Google OAuth 사용 가이드

> 구현된 Google OAuth 기능들의 사용법과 예시

## 🚀 구현된 기능들

### 1. Supabase Auth UI (기본)
- **위치**: `/login`, `/signup` 페이지
- **특징**: Supabase에서 제공하는 완전한 UI 컴포넌트
- **포함 기능**: 이메일/비밀번호, Google, GitHub 로그인

### 2. Google One-Tap
- **위치**: 홈페이지 (로그인하지 않은 사용자)
- **특징**: Google의 자동 로그인 팝업
- **사용 조건**: 이전에 Google로 로그인한 사용자

### 3. Custom Google OAuth
- **위치**: `authStore.signInWithGoogle()` 메서드
- **특징**: 프로그래매틱 Google OAuth 호출
- **사용 케이스**: 커스텀 버튼, 특정 이벤트 트리거

## 📝 환경변수 설정

`.env` 파일에 다음 변수들을 설정하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth 설정
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# 개발 환경 설정
VITE_APP_ENV=development
```

## 💻 사용법 예시

### 1. Basic Auth UI 사용
```tsx
import { AuthUI } from '@/features/auth';

// 로그인 페이지
<AuthUI view="sign_in" redirectTo="/dashboard" />

// 회원가입 페이지
<AuthUI view="sign_up" redirectTo="/onboarding" />

// Google만 사용
<AuthUI 
  view="sign_in" 
  onlyProviders={['google']} 
  redirectTo="/dashboard" 
/>
```

### 2. Google One-Tap 사용
```tsx
import { GoogleOneTap } from '@/features/auth';

// 홈페이지에서 자동 표시
<GoogleOneTap
  autoPrompt={true}
  redirectTo="/dashboard"
  skipConditions={{
    hasSession: true,
    mobile: true
  }}
  onSuccess={() => console.log('로그인 성공!')}
  onError={(error) => console.error('오류:', error)}
/>

// 특정 조건에서만 표시
<GoogleOneTap
  autoPrompt={false}  // 수동 트리거
  skipConditions={{
    hasSession: true,
    mobile: false     // 모바일에서도 표시
  }}
/>
```

### 3. Custom Google OAuth 버튼
```tsx
import { useAuthStore } from '@/shared/stores';

const CustomGoogleButton = () => {
  const { signInWithGoogle, loadingState } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle('/dashboard');
    } catch (error) {
      console.error('Google 로그인 실패:', error);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={loadingState === 'loading'}
    >
      {loadingState === 'loading' ? '로그인 중...' : 'Google로 로그인'}
    </button>
  );
};
```

### 4. Google ID Token 직접 처리
```tsx
import { useAuthStore } from '@/shared/stores';

const { signInWithGoogleIdToken } = useAuthStore();

// Google의 credential response를 받았을 때
const handleCredentialResponse = async (response: any) => {
  try {
    await signInWithGoogleIdToken(response.credential);
    console.log('로그인 성공!');
  } catch (error) {
    console.error('ID Token 로그인 실패:', error);
  }
};
```

## 🔧 고급 설정

### One-Tap 커스터마이징
```tsx
<GoogleOneTap
  autoPrompt={true}
  redirectTo="/welcome"
  skipConditions={{
    hasSession: true,
    mobile: false,
  }}
  onSuccess={() => {
    // 로그인 성공 후 처리
    analytics.track('google_one_tap_success');
    showWelcomeMessage();
  }}
  onError={(error) => {
    // 오류 처리
    console.error('One-Tap 오류:', error);
    fallbackToRegularLogin();
  }}
  onCancel={() => {
    // 사용자가 취소했을 때
    console.log('One-Tap 취소됨');
  }}
/>
```

### AuthUI 상세 설정
```tsx
<AuthUI
  view="sign_in"
  redirectTo="/dashboard"
  showSocialProviders={true}
  onlyProviders={['google']}  // Google만 표시
  className="custom-auth-form"
/>

// 소셜 로그인 비활성화
<AuthUI
  view="sign_in"
  showSocialProviders={false}  // 이메일/비밀번호만
/>
```

## 🎯 사용 시나리오

### 시나리오 1: 빠른 로그인 경험
```tsx
// 홈페이지에서 One-Tap으로 즉시 로그인
// 실패 시 로그인 페이지로 안내
const HomePage = () => {
  const { user } = useAuthStore();
  
  return (
    <div>
      {!user && (
        <GoogleOneTap
          autoPrompt={true}
          onError={() => {
            // One-Tap 실패 시 로그인 페이지로 안내
            showLoginModal();
          }}
        />
      )}
      {/* 홈페이지 콘텐츠 */}
    </div>
  );
};
```

### 시나리오 2: 단계별 온보딩
```tsx
// 첫 방문자를 위한 단계별 인증
const OnboardingPage = () => {
  return (
    <div>
      <h1>환영합니다!</h1>
      
      {/* 1단계: 간편 Google 로그인 */}
      <AuthUI 
        view="sign_up"
        onlyProviders={['google']}
        redirectTo="/onboarding-step2"
      />
      
      {/* 2단계: 추가 정보 입력 */}
      <Link to="/signup">또는 이메일로 가입하기</Link>
    </div>
  );
};
```

### 시나리오 3: 모바일 친화적 설정
```tsx
// 모바일에서는 One-Tap 비활성화, 큰 버튼 제공
const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);

<GoogleOneTap
  autoPrompt={true}
  skipConditions={{
    hasSession: true,
    mobile: isMobile,  // 모바일에서는 스킵
  }}
/>

{/* 모바일용 큰 Google 로그인 버튼 */}
{isMobile && (
  <AuthUI 
    view="sign_in"
    onlyProviders={['google']}
  />
)}
```

## 🐛 트러블슈팅

### 자주 발생하는 문제들

1. **One-Tap이 표시되지 않음**
   ```bash
   # 체크리스트:
   - VITE_GOOGLE_CLIENT_ID 환경변수 설정 확인
   - Google Cloud Console의 승인된 도메인 확인
   - 브라우저의 third-party cookie 설정 확인
   - 개발자 도구에서 네트워크 오류 확인
   ```

2. **redirect_uri_mismatch 오류**
   ```bash
   # 해결방법:
   - Google Cloud Console에서 Redirect URI 정확히 설정
   - Supabase callback URL: https://your-project.supabase.co/auth/v1/callback
   ```

3. **CORS 오류**
   ```bash
   # 해결방법:
   - Google Cloud Console의 승인된 JavaScript 원본에 도메인 추가
   - 로컬: http://localhost:5173
   - 프로덕션: https://yourdomain.com
   ```

### 디버깅 도구

개발 환경에서는 One-Tap 수동 트리거 버튼이 화면 우하단에 표시됩니다.

```typescript
// 콘솔에서 직접 테스트
window.google?.accounts.id.prompt();
```

## 📚 참고 자료

- [Supabase Google Auth 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google One-Tap 문서](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
