# Vibe 프로젝트 E2E 테스트

> Playwright를 사용한 End-to-End 테스트 가이드

## 📁 테스트 구조 (FSD 기반)

```
tests/
├── setup/              # 테스트 설정 및 유틸리티
│   ├── global-setup.ts    # 전역 설정
│   ├── auth.setup.ts      # 인증 설정
│   └── test-utils.ts      # 테스트 유틸리티
├── fixtures/           # 테스트 데이터 및 모킹
│   ├── users.json         # 사용자 테스트 데이터
│   └── mock-api.ts        # API 모킹
├── pages/              # 페이지 레벨 테스트
│   ├── home.spec.ts       # 홈페이지 테스트
│   ├── login.spec.ts      # 로그인 페이지 테스트
│   └── about.spec.ts      # 어바웃 페이지 테스트
├── features/           # 기능별 테스트
│   └── auth/              # 인증 기능 테스트
│       ├── login.spec.ts      # 로그인 기능
│       └── logout.spec.ts     # 로그아웃 기능
├── e2e/                # 통합 시나리오 테스트
│   └── user-journey.spec.ts   # 사용자 여정 테스트
└── README.md           # 이 파일
```

## 🚀 테스트 실행 명령어

### 기본 테스트 실행
```bash
npm run test:e2e              # 모든 테스트 실행
npm run test:e2e:headed       # 브라우저 화면 보며 실행
npm run test:e2e:debug        # 디버그 모드로 실행
npm run test:e2e:ui           # UI 모드로 실행
```

### 특정 테스트 실행
```bash
npm run test:e2e -- pages/login.spec.ts    # 로그인 페이지 테스트만
npm run test:e2e -- features/auth/         # 인증 기능 테스트만
npm run test:e2e -- --grep "로그인"         # "로그인" 포함 테스트만
```

### 브라우저별 실행
```bash
npm run test:e2e -- --project=chromium     # Chrome만
npm run test:e2e -- --project=firefox      # Firefox만
npm run test:e2e -- --project="Mobile Chrome"  # 모바일 Chrome
```

### 코드 생성 및 도구
```bash
npm run test:e2e:codegen      # 코드 생성기 실행
npm run test:e2e:report       # 테스트 리포트 보기
npm run test:e2e:install      # 브라우저 재설치
```

## 📝 테스트 작성 가이드

### 1. Page Object Model 사용
```typescript
// tests/setup/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
  
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/');
  }
}
```

### 2. Test Data 활용
```typescript
// tests/fixtures/users.json
{
  "validUser": {
    "email": "test@example.com",
    "password": "password123"
  },
  "invalidUser": {
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }
}
```

### 3. 테스트 작성 패턴
```typescript
// tests/features/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../setup/pages/LoginPage';
import users from '../../fixtures/users.json';

test.describe('로그인 기능', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });
  
  test('올바른 정보로 로그인 성공', async () => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await loginPage.expectLoginSuccess();
  });
  
  test('잘못된 정보로 로그인 실패', async () => {
    await loginPage.login(users.invalidUser.email, users.invalidUser.password);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

## 🏷️ Data-testid 사용 가이드

컴포넌트에 `data-testid` 속성을 추가하여 테스트에서 안정적으로 요소를 선택:

```tsx
// 컴포넌트에서
<Button data-testid="login-button">로그인</Button>
<Input data-testid="email-input" />

// 테스트에서
await page.click('[data-testid="login-button"]');
await page.fill('[data-testid="email-input"]', 'test@example.com');
```

## 🔧 CI/CD 설정

### GitHub Actions 예시
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
  
- name: Run Playwright tests
  run: npm run test:e2e
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 📊 테스트 레포트

- HTML 레포트: `playwright-report/index.html`
- JSON 결과: `test-results/results.json`
- JUnit XML: `test-results/junit.xml`

## 🐛 디버깅 팁

1. **스크린샷 확인**: 실패한 테스트의 스크린샷은 `test-results/` 폴더에 저장
2. **비디오 확인**: 실패한 테스트의 비디오도 함께 저장
3. **Trace 뷰어**: `npx playwright show-trace trace.zip`로 상세 실행 과정 확인
4. **디버그 모드**: `npm run test:e2e:debug`로 단계별 실행

## ⚠️ 주의사항

- 테스트 실행 전에 개발 서버가 자동으로 시작됩니다 (`npm run dev`)
- CI 환경에서는 헤드리스 모드로 실행됩니다
- 민감한 정보는 환경 변수로 관리하세요
- 테스트 데이터는 실제 서비스에 영향을 주지 않도록 격리하세요
