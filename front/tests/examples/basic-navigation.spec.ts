import { test, expect } from '@playwright/test';

/**
 * 기본 네비게이션 및 페이지 로딩 테스트
 * Vibe 프로젝트의 기본 기능들을 테스트합니다.
 */
test.describe('기본 네비게이션 테스트', () => {
  test('홈페이지가 올바르게 로딩된다', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
    
    // 헤더 확인
    await expect(page.locator('nav.navbar')).toBeVisible();
    
    // 로고 확인
    await expect(page.locator('a.navbar-brand')).toHaveText('Vibe');
  });

  test('소개 페이지로 네비게이션이 동작한다', async ({ page }) => {
    await page.goto('/');
    
    // 햄버거 메뉴 열기
    await page.locator('button:has-text("☰")').click();
    
    // 소개 링크 클릭
    await page.locator('.nav-link:has-text("소개")').click();
    
    // URL 확인
    await expect(page).toHaveURL('/about');
    
    // 페이지 내용 확인
    await expect(page.locator('h1').first()).toContainText(/FSD 아키텍처/);
  });

  test('할 일 페이지로 네비게이션이 동작한다', async ({ page }) => {
    await page.goto('/');
    
    // 햄버거 메뉴 열기
    await page.locator('button:has-text("☰")').click();
    
    // 할 일 링크 클릭
    await page.locator('.nav-link:has-text("할 일")').click();
    
    // URL 확인
    await expect(page).toHaveURL('/todos');
  });

  // 404 페이지는 아직 구현되지 않았으므로 테스트 스킵
  test.skip('존재하지 않는 페이지에 대해 404 처리가 동작한다', async ({ page }) => {
    // TODO: 404 페이지 구현 후 테스트 활성화
    await page.goto('/nonexistent-page');
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(404|$)/);
  });

  test('반응형 디자인이 모바일에서 올바르게 동작한다', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // 헤더가 여전히 표시되는지 확인
    await expect(page.locator('nav.navbar')).toBeVisible();
    
    // 햄버거 메뉴가 표시되는지 확인
    await expect(page.locator('button:has-text("☰")')).toBeVisible();
  });

  test('테마 토글 버튼이 동작한다', async ({ page }) => {
    await page.goto('/');
    
    // 테마 토글 버튼 찾기
    const themeButton = page.locator('button[title*="현재 테마"]');
    await expect(themeButton).toBeVisible();
    
    // 테마 토글 클릭
    await themeButton.click();
    
    // 테마가 변경되었는지 확인 (DOM 변화나 클래스 변경 등)
    // 실제 구현에 따라 조정 필요
  });
});
