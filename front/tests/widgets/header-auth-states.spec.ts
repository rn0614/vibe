import { test, expect } from '@playwright/test';
import { AppHeaderPage } from '../setup/pages/AppHeaderPage';
import { LoginPage } from '../setup/pages/LoginPage';
import { mockAuthApi } from '../fixtures/mock-api';
import users from '../fixtures/users.json' with { type: 'json' };

test.describe('Header 인증 상태 테스트', () => {
  let headerPage: AppHeaderPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new AppHeaderPage(page);
    loginPage = new LoginPage(page);
    
    // 인증 API 모킹
    await mockAuthApi(page);
    
    await headerPage.goto();
  });

  test.describe('비로그인 상태', () => {
    test('헤더 기본 요소들이 올바르게 표시된다', async () => {
      // 헤더 기본 요소들 확인
      await headerPage.expectHeaderToBeVisible();
      
      // 비로그인 상태 UI 확인
      await headerPage.expectLoggedOutState();
    });

    test('로그인 버튼을 클릭하면 로그인 페이지로 이동한다', async () => {
      await headerPage.clickLogin();
      
      // URL이 /login으로 변경되었는지 확인
      await expect(headerPage.currentPage).toHaveURL('/login');
    });

    test('회원가입 버튼을 클릭하면 회원가입 페이지로 이동한다', async () => {
      await headerPage.clickSignup();
      
      // URL이 /signup으로 변경되었는지 확인
      await expect(headerPage.currentPage).toHaveURL('/signup');
    });

    test('햄버거 메뉴가 정상적으로 동작한다', async () => {
      await headerPage.expectSidebarContent();
    });

    test('사이드바에서 네비게이션이 정상적으로 동작한다', async () => {
      // 홈 메뉴 클릭
      await headerPage.clickSidebarNavigation('홈');
      await expect(headerPage.currentPage).toHaveURL('/');
      
      // 소개 메뉴 클릭
      await headerPage.clickSidebarNavigation('소개');
      await expect(headerPage.currentPage).toHaveURL('/about');
      
      // 할 일 메뉴 클릭
      await headerPage.clickSidebarNavigation('할 일');
      await expect(headerPage.currentPage).toHaveURL('/todos');
    });

    test('로고를 클릭하면 홈페이지로 이동한다', async () => {
      // 다른 페이지로 이동
      await headerPage.currentPage.goto('/about');
      
      // 로고 클릭
      await headerPage.clickLogo();
      
      // 홈페이지로 이동했는지 확인
      await expect(headerPage.currentPage).toHaveURL('/');
    });

    test('테마 토글 버튼이 표시되고 클릭 가능하다', async () => {
      await expect(headerPage.themeToggleButton).toBeVisible();
      await expect(headerPage.themeToggleButton).toBeEnabled();
      
      // 테마 토글 클릭
      await headerPage.toggleTheme();
    });
  });

  test.describe.skip('로그인 상태', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인 실행
      await loginPage.goto();
      await loginPage.login(users.validUser.email, users.validUser.password);
      
      // 홈페이지로 리다이렉트 확인
      await expect(page).toHaveURL('/');
    });

    test('로그인 상태 UI가 올바르게 표시된다', async () => {
      await headerPage.expectLoggedInState(users.validUser.email);
    });

    test('알림 버튼이 표시된다', async () => {
      await expect(headerPage.notificationButton).toBeVisible();
      await expect(headerPage.notificationButton).toBeEnabled();
    });

    test('프로필 드롭다운이 올바르게 동작한다', async () => {
      await headerPage.expectProfileDropdownContent(users.validUser.email);
    });

    test('프로필 드롭다운에서 테마를 변경할 수 있다', async () => {
      // 라이트 모드로 변경
      await headerPage.changeThemeFromDropdown('light');
      
      // 다크 모드로 변경
      await headerPage.changeThemeFromDropdown('dark');
      
      // 자동 모드로 변경
      await headerPage.changeThemeFromDropdown('auto');
    });

    test('프로필 드롭다운에서 로그아웃할 수 있다', async () => {
      await headerPage.clickLogoutFromDropdown();
      
      // 로그아웃 후 비로그인 상태로 변경 확인
      await headerPage.expectLoggedOutState();
    });

    test('로그인 상태에서도 햄버거 메뉴가 정상적으로 동작한다', async () => {
      await headerPage.expectSidebarContent();
    });

    test('로그인 상태에서도 로고 클릭이 정상 동작한다', async () => {
      // 다른 페이지로 이동
      await headerPage.currentPage.goto('/about');
      
      // 로고 클릭
      await headerPage.clickLogo();
      
      // 홈페이지로 이동했는지 확인
      await expect(headerPage.currentPage).toHaveURL('/');
      
      // 여전히 로그인 상태인지 확인
      await headerPage.expectLoggedInState();
    });
  });

  test.describe.skip('로딩 상태', () => {
    test('로딩 중에는 로딩 텍스트가 표시된다', async ({ page }) => {
      // 로딩 상태를 시뮬레이션하기 위해 느린 응답 모킹
      await page.route('**/auth/me', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            email: 'test@example.com',
            name: '테스트 사용자'
          })
        });
      });
      
      // 페이지 새로고침하여 로딩 상태 트리거
      await page.reload();
      
      // 로딩 상태 확인
      await headerPage.expectLoadingState();
    });
  });

  test.describe('반응형 테스트', () => {
    test('모바일 뷰포트에서 헤더가 올바르게 표시된다', async ({ page }) => {
      // 모바일 뷰포트로 변경
      await page.setViewportSize({ width: 375, height: 667 });
      
      await headerPage.goto();
      
      // 헤더 기본 요소들이 여전히 표시되는지 확인
      await headerPage.expectHeaderToBeVisible();
      await headerPage.expectLoggedOutState();
    });

    test('태블릿 뷰포트에서 헤더가 올바르게 표시된다', async ({ page }) => {
      // 태블릿 뷰포트로 변경
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await headerPage.goto();
      
      // 헤더 기본 요소들이 여전히 표시되는지 확인
      await headerPage.expectHeaderToBeVisible();
      await headerPage.expectLoggedOutState();
    });
  });

  test.describe('접근성 테스트', () => {
    test('키보드 네비게이션이 가능하다', async ({ page }) => {
      await headerPage.goto();
      
      // Tab 키로 네비게이션 (실제 순서에 맞춰 조정)
      await page.keyboard.press('Tab'); // 햄버거 버튼
      await page.keyboard.press('Tab'); // 로고
      await page.keyboard.press('Tab'); // 테마 토글
      await page.keyboard.press('Tab'); // 로그인 버튼
      
      // 현재 포커스된 요소가 로그인 버튼인지 확인하고 Enter 키 클릭
      const focusedElement = await page.locator(':focus').textContent();
      if (focusedElement?.includes('로그인')) {
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL('/login');
      } else {
        // 회원가입 버튼에 포커스되어 있다면 한 번 더 Tab
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL('/signup');
      }
    });

    test('스크린 리더를 위한 적절한 레이블이 있다', async () => {
      await headerPage.goto();
      
      // aria-label이나 title 속성이 있는지 확인
      await expect(headerPage.themeToggleButton).toHaveAttribute('title');
      await expect(headerPage.logo).toHaveText('Vibe');
    });
  });

  test.describe('에러 상황 처리', () => {
    test('인증 API 실패 시 로그인 버튼이 표시된다', async ({ page }) => {
      // 인증 API 에러 모킹
      await page.route('**/auth/me', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      });
      
      await headerPage.goto();
      
      // 비로그인 상태로 표시되어야 함
      await headerPage.expectLoggedOutState();
    });

    test('로그아웃 API 실패 시에도 UI가 정상 동작한다', async ({ page }) => {
      // 먼저 로그인
      await loginPage.goto();
      await loginPage.login(users.validUser.email, users.validUser.password);
      await expect(page).toHaveURL('/');
      
      // 로그아웃 API 에러 모킹
      await page.route('**/auth/logout', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // 로그아웃 시도
      await headerPage.clickLogoutFromDropdown();
      
      // 에러가 발생해도 UI는 로그아웃 상태로 변경되어야 함
      // (클라이언트 측에서 처리)
      await headerPage.expectLoggedOutState();
    });
  });
});
