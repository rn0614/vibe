# Google OAuth 트러블슈팅 가이드

## 🚨 "Unsupported provider: provider is not enabled" 오류

### 원인
Supabase에서 Google Auth Provider가 활성화되지 않았거나 올바르게 설정되지 않음

### 해결 방법

#### 1단계: Supabase Dashboard 확인
1. [Supabase Dashboard](https://app.supabase.com/projects) 접속
2. 프로젝트 선택
3. **Authentication > Providers** 메뉴로 이동
4. **Google** 프로바이더 찾기
5. 다음 사항들을 확인:

```
✅ Enable sign in with Google: 체크되어 있는지 확인
✅ Client ID (for OAuth): 올바른 Google Client ID 입력
✅ Client Secret (for OAuth): 올바른 Google Client Secret 입력
```

#### 2단계: Google Cloud Console 설정 재확인
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스 > 사용자 인증 정보** 메뉴
3. OAuth 2.0 클라이언트 ID 확인
4. **승인된 리디렉션 URI**에 다음이 있는지 확인:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```

#### 3단계: 환경변수 확인
`.env` 파일에 올바른 값이 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 4단계: Supabase 프로젝트 상태 확인
- 프로젝트가 **활성(Active)** 상태인지 확인
- 결제 정보가 등록되어 있는지 확인 (무료 플랜도 카드 등록 필요한 경우 있음)

#### 5단계: 설정 저장 및 재시작
1. Supabase Dashboard에서 설정 변경 후 **Save** 클릭
2. 몇 분 기다린 후 개발 서버 재시작:
   ```bash
   cd front
   npm run dev
   ```

### 빠른 테스트 방법

#### Supabase 클라이언트 직접 테스트
개발자 도구 콘솔에서 다음 코드 실행:

```javascript
// Supabase 클라이언트 상태 확인
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey);

// 사용 가능한 프로바이더 확인
supabase.auth.getSession().then(response => {
  console.log('Current session:', response);
});

// Google OAuth 테스트
supabase.auth.signInWithOAuth({
  provider: 'google'
}).then(response => {
  console.log('OAuth response:', response);
}).catch(error => {
  console.error('OAuth error:', error);
});
```

### 추가 확인사항

#### A. URL 매칭 확인
Google Cloud Console의 **승인된 JavaScript 원본**:
```
http://localhost:5173
https://yourdomain.com
```

#### B. Callback URL 정확성
Supabase callback URL 형식:
```
https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback
```

#### C. API 활성화 확인
Google Cloud Console에서 다음 API들이 활성화되어 있는지 확인:
- Google+ API (구버전의 경우)
- Google People API
- Google Identity Services

### 프로덕션 환경 추가 고려사항

#### 도메인 설정
실제 도메인에서 사용할 때:
```
승인된 JavaScript 원본: https://yourdomain.com
승인된 리디렉션 URI: https://your-project.supabase.co/auth/v1/callback
Supabase Site URL: https://yourdomain.com
```

#### HTTPS 필수
프로덕션에서는 반드시 HTTPS 사용 (Google OAuth 요구사항)

### 여전히 해결되지 않는 경우

#### 1. Supabase 로그 확인
Supabase Dashboard > Logs에서 인증 관련 오류 로그 확인

#### 2. 브라우저 개발자 도구
Network 탭에서 실제 요청/응답 확인:
```
요청 URL: https://your-project.supabase.co/auth/v1/authorize
응답: 400 Bad Request의 자세한 내용 확인
```

#### 3. 새 OAuth 클라이언트 생성
Google Cloud Console에서 새로운 OAuth 클라이언트 ID 생성해보기

#### 4. Supabase 프로젝트 재생성
최후의 수단으로 새 Supabase 프로젝트 생성 고려

## 📞 지원 요청 시 필요한 정보

문제가 계속되면 다음 정보와 함께 지원 요청:

1. Supabase 프로젝트 ID
2. Google OAuth 클라이언트 ID (Secret은 공유하지 말 것)
3. 정확한 오류 메시지와 스크린샷
4. 브라우저 개발자 도구의 Network/Console 로그
5. 설정 단계별 스크린샷
