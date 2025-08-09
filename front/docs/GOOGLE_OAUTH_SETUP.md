# Google OAuth 설정 가이드

> Supabase와 Google OAuth를 연동하기 위한 단계별 설정 가이드

## 🔧 1단계: Google Cloud Console 설정

### 1.1 Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트를 생성하거나 기존 프로젝트 선택

### 1.2 OAuth 동의 화면 구성
1. **API 및 서비스 > OAuth 동의 화면**으로 이동
2. 사용자 유형 선택 (외부 사용자 권장)
3. 기본 정보 입력:
   ```
   앱 이름: Vibe
   사용자 지원 이메일: your-email@example.com
   개발자 연락처 정보: your-email@example.com
   ```
4. **승인된 도메인** 섹션에 Supabase 도메인 추가:
   ```
   <your-project-id>.supabase.co
   ```
5. **범위** 섹션에서 다음 권한 추가:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### 1.3 OAuth 클라이언트 ID 생성
1. **API 및 서비스 > 사용자 인증 정보**로 이동
2. **사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 클릭
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. **승인된 JavaScript 원본**에 추가:
   ```
   http://localhost:5173        # 개발 환경
   https://yourdomain.com       # 프로덕션 환경
   ```
5. **승인된 리디렉션 URI**에 Supabase 콜백 URL 추가:
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
6. **만들기** 클릭하여 Client ID와 Client Secret 생성

## 🔧 2단계: Supabase Dashboard 설정

### 2.1 Google Auth Provider 활성화
1. [Supabase Dashboard](https://app.supabase.com/projects)에서 프로젝트 선택
2. **Authentication > Providers**로 이동
3. **Google** 제공자 찾기
4. **Enable sign in with Google** 토글 활성화
5. Google Cloud Console에서 얻은 정보 입력:
   ```
   Client ID (for OAuth): your-google-client-id
   Client Secret (for OAuth): your-google-client-secret
   ```
6. **Save** 클릭

### 2.2 Site URL 및 Redirect URLs 설정
1. **Authentication > URL Configuration**으로 이동
2. **Site URL** 설정:
   ```
   http://localhost:5173        # 개발 환경
   ```
3. **Redirect URLs**에 추가:
   ```
   http://localhost:5173/**
   https://yourdomain.com/**    # 프로덕션 환경
   ```

## 🔧 3단계: 환경변수 설정

`.env` 파일에 Google Client ID 추가 (One-Tap 기능용):

```env
# Supabase 설정
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth 설정 (One-Tap용)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# 개발 환경 설정
VITE_APP_ENV=development
```

## 🔧 4단계: 테스트

### 4.1 기본 OAuth 테스트
1. 개발 서버 실행: `npm run dev`
2. `/login` 또는 `/signup` 페이지 방문
3. **Google로 로그인** 버튼 클릭
4. Google 인증 화면에서 로그인
5. 자동으로 앱으로 리다이렉트 되는지 확인

### 4.2 One-Tap 테스트 (구현 후)
1. 로그아웃 상태에서 홈페이지 방문
2. Google One-Tap 팝업이 자동으로 나타나는지 확인
3. One-Tap으로 로그인 테스트

## 🚨 주의사항

### 보안 설정
- **승인된 도메인**에 실제 운영 도메인만 추가
- **Client Secret**은 절대 프론트엔드에 노출하지 말 것
- 정기적으로 OAuth 설정 검토

### 도메인 설정
- 개발환경: `localhost` 허용
- 스테이징: 스테이징 도메인 추가
- 프로덕션: 실제 도메인만 허용

### 오류 해결
- **redirect_uri_mismatch**: Redirect URI 정확히 입력 확인
- **invalid_client**: Client ID/Secret 정확성 확인
- **access_denied**: OAuth 동의 화면 설정 확인

## 📚 참고 자료

- [Supabase Google Auth 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google One-Tap 문서](https://developers.google.com/identity/gsi/web)
