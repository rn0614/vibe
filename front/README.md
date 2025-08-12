# 🚀 Vibe - React Boilerplate & Coding Test Project

> **모던 React 개발을 위한 완전한 보일러플레이트**  
> 코딩 테스트 겸 프로덕션 레벨의 React 애플리케이션 템플릿

## 📋 프로젝트 개요

Vibe는 현대적인 React 개발을 위한 완전한 보일러플레이트입니다. 이 프로젝트는 코딩 테스트 용도로 개발되었으며, 실제 프로덕션 환경에서 사용할 수 있는 수준의 아키텍처와 패턴을 구현했습니다.

### 🎯 주요 목적
- **코딩 테스트**: React 개발 능력과 아키텍처 설계 능력 평가
- **보일러플레이트**: 새로운 React 프로젝트 시작을 위한 템플릿
- **학습 자료**: 모던 React 개발 패턴과 베스트 프랙티스 예시

## 🛠 기술 스택

### **Frontend Core**
- **React 19.1.1** - 최신 React 버전
- **TypeScript 5.8.3** - 타입 안전성
- **Vite 7.1.0** - 빠른 개발 서버 및 빌드 도구

### **상태 관리**
- **TanStack Query 5.84.2** - 서버 상태 관리
- **Zustand 5.0.7** - 클라이언트 상태 관리

### **UI & 스타일링**
- **Bootstrap 5.3.7** - UI 컴포넌트 라이브러리
- **React Bootstrap 2.10.10** - React용 Bootstrap 컴포넌트
- **Sass 1.90.0** - CSS 전처리기
- **CSS Modules** - 스타일 격리

### **인증 & 백엔드**
- **Supabase 2.54.0** - 백엔드 서비스 (Auth, Database)
- **Supabase Auth UI** - 인증 UI 컴포넌트

### **라우팅**
- **React Router DOM 7.8.0** - 클라이언트 사이드 라우팅

### **개발 도구**
- **ESLint 9.32.0** - 코드 품질 관리
- **Playwright 1.54.2** - E2E 테스팅
- **Vitest 3.2.4** - 단위 테스팅

## 🏗 프로젝트 구조

```
front/src/
├── app/                    # 앱 초기화 및 전역 설정
│   ├── providers/         # Context Providers
│   │   ├── auth/         # 인증 관련 Provider
│   │   ├── query/        # TanStack Query Provider
│   │   └── router/       # 라우팅 설정
│   └── App.tsx           # 메인 앱 컴포넌트
├── components/            # UI 컴포넌트 (Atomic Design)
│   ├── atoms/            # 기본 UI 요소 (Button, Input, etc.)
│   ├── molecules/        # 복합 컴포넌트 (AuthActions, etc.)
│   ├── organisms/        # 복잡한 UI 블록 (Header, Sidebar, etc.)
│   └── templates/        # 페이지 레이아웃 템플릿
├── hooks/                # 커스텀 React Hooks
├── pages/                # 페이지 컴포넌트
├── shared/               # 공유 코드
│   ├── api/             # API 클라이언트 및 설정
│   ├── stores/          # Zustand 스토어
│   ├── styles/          # 전역 스타일
│   └── types/           # TypeScript 타입 정의
└── utils/                # 유틸리티 함수
```

## 🚀 빠른 시작

### 1. **환경 설정**
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 2. **Supabase 설정**
```bash
# Supabase CLI 설치 (선택사항)
npm install -g supabase

# Supabase 로그인
npm run supabase:login

# 프로젝트 초기화
npm run supabase:init

# 데이터베이스 타입 생성
npm run supabase:types
```

### 3. **개발 서버 실행**
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

## 📚 주요 기능

### 🔐 **인증 시스템**
- **Supabase Auth** 통합
- **이메일/비밀번호** 인증
- **Google OAuth** 지원
- **One-Tap 로그인** 구현
- **자동 세션 관리**

### 🎨 **UI/UX**
- **Atomic Design** 패턴 적용
- **반응형 디자인**
- **다크/라이트 테마** 지원
- **접근성 고려** 설계

### 📊 **상태 관리**
- **TanStack Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **React State**: 컴포넌트 로컬 상태

### 🧪 **테스팅**
- **Playwright**: E2E 테스팅
- **Vitest**: 단위 테스팅
- **테스트 커버리지** 지원

## 🛠 개발 스크립트

```bash
# 개발
npm run dev              # 개발 서버 시작
npm run build            # 프로덕션 빌드
npm run preview          # 빌드 결과 미리보기

# 코드 품질
npm run lint             # ESLint 실행

# Supabase
npm run supabase:types   # DB 타입 생성
npm run supabase:login   # Supabase 로그인

# 테스팅
npm run test:e2e         # E2E 테스트 실행
npm run test:e2e:ui      # E2E 테스트 UI 모드
npm run test:e2e:headed  # 헤드리스 모드 비활성화
npm run test:e2e:debug   # 디버그 모드
npm run test:e2e:codegen # 테스트 코드 생성
```

## 📖 아키텍처 가이드

### **Feature-Sliced Design (FSD)**
이 프로젝트는 FSD 아키텍처 패턴을 따릅니다:

- **app/**: 앱 초기화 및 전역 설정
- **pages/**: 라우트별 페이지 컴포넌트
- **widgets/**: 독립적인 UI 블록
- **features/**: 사용자 상호작용 기능
- **entities/**: 비즈니스 엔티티
- **shared/**: 공유 코드 및 유틸리티

### **상태 관리 전략**
```typescript
// 서버 상태 (TanStack Query)
const { data: users } = useQuery(['users'], fetchUsers);

// 클라이언트 상태 (Zustand)
const { theme, setTheme } = useThemeStore();

// 로컬 상태 (React State)
const [formData, setFormData] = useState({});
```

### **컴포넌트 설계**
- **Atomic Design** 패턴 적용
- **Props 인터페이스** 명확히 정의
- **CSS Modules**로 스타일 격리
- **재사용성**과 **확장성** 고려

## 🔧 환경 변수

```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Google OAuth (선택사항)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📝 개발 가이드

### **새 컴포넌트 추가**
1. 적절한 레벨 선택 (atoms/molecules/organisms)
2. TypeScript 인터페이스 정의
3. CSS Modules 스타일 작성
4. Storybook 스토리 추가 (선택사항)

### **새 페이지 추가**
1. `pages/` 디렉토리에 컴포넌트 생성
2. `app/providers/router/routes.tsx`에 라우트 추가
3. 필요한 경우 레이아웃 적용

### **API 통합**
1. `shared/api/` 디렉토리에 함수 추가
2. TanStack Query 훅 생성
3. 에러 핸들링 구현

## 🧪 테스팅

### **E2E 테스트**
```bash
# 테스트 실행
npm run test:e2e

# UI 모드로 테스트
npm run test:e2e:ui

# 테스트 코드 생성
npm run test:e2e:codegen
```

### **테스트 구조**
```
tests/
├── setup/           # 테스트 설정
├── fixtures/        # 테스트 데이터
├── examples/        # 예시 테스트
└── widgets/         # 위젯별 테스트
```

## 📚 문서

프로젝트의 상세한 문서는 `docs/` 디렉토리에서 확인할 수 있습니다:

- [프로젝트 진화 과정](./docs/PROJECT_EVOLUTION.md)
- [개발 패턴 가이드](./docs/DEVELOPMENT_PATTERNS.md)
- [인증 아키텍처](./docs/AUTH_FINAL_ARCHITECTURE.md)
- [훅 아키텍처 가이드](./docs/HOOKS_ARCHITECTURE_GUIDE.md)
- [문제 해결 가이드](./docs/TROUBLESHOOTING.md)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [Supabase](https://supabase.com/) - 백엔드 서비스
- [TanStack](https://tanstack.com/) - React Query
- [Vite](https://vitejs.dev/) - 빌드 도구
- [Bootstrap](https://getbootstrap.com/) - UI 프레임워크

---

**Vibe** - 모던 React 개발의 새로운 시작 🚀

