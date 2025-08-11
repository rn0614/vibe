import { type Page, type Locator, expect } from '@playwright/test';

/**
 * 테스트에서 자주 사용되는 유틸리티 함수들
 */

/**
 * 요소가 나타날 때까지 대기
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * 텍스트가 포함된 요소 찾기
 */
export function getByText(page: Page, text: string): Locator {
  return page.locator(`text="${text}"`);
}

/**
 * data-testid로 요소 찾기
 */
export function getByTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * 폼 입력 헬퍼
 */
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [testId, value] of Object.entries(formData)) {
    await page.fill(`[data-testid="${testId}"]`, value);
  }
}

/**
 * 로딩 상태 대기
 */
export async function waitForLoadingToFinish(page: Page) {
  // 로딩 스피너가 사라질 때까지 대기
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 });
}

/**
 * API 응답 대기
 */
export async function waitForApiResponse(page: Page, urlPattern: string) {
  const responsePromise = page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200
  );
  return responsePromise;
}

/**
 * 네트워크 요청 모킹
 */
export async function mockApiResponse(page: Page, url: string, responseData: any) {
  await page.route(`**/${url}`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

/**
 * 로컬 스토리지 설정
 */
export async function setLocalStorage(page: Page, key: string, value: string) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key, value });
}

/**
 * 로컬 스토리지 가져오기
 */
export async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}

/**
 * 페이지 스크린샷 비교
 */
export async function expectScreenshot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`);
}

/**
 * 에러 메시지 확인
 */
export async function expectErrorMessage(page: Page, message: string) {
  await expect(page.locator('[data-testid="error-message"]')).toContainText(message);
}

/**
 * 성공 메시지 확인
 */
export async function expectSuccessMessage(page: Page, message: string) {
  await expect(page.locator('[data-testid="success-message"]')).toContainText(message);
}

/**
 * 페이지 제목 확인
 */
export async function expectPageTitle(page: Page, title: string) {
  await expect(page).toHaveTitle(title);
}

/**
 * URL 패턴 확인
 */
export async function expectUrlPattern(page: Page, pattern: string | RegExp) {
  if (typeof pattern === 'string') {
    await expect(page).toHaveURL(pattern);
  } else {
    await expect(page).toHaveURL(pattern);
  }
}
