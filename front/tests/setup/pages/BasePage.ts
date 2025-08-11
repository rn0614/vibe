import { type Page, type Locator } from '@playwright/test';

/**
 * 모든 페이지 클래스의 기본 클래스
 */
export abstract class BasePage {
  protected page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 페이지 객체에 접근하기 위한 getter
   */
  get currentPage(): Page {
    return this.page;
  }

  /**
   * 페이지로 이동
   */
  abstract goto(): Promise<void>;

  /**
   * data-testid로 요소 찾기
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * 텍스트로 요소 찾기
   */
  getByText(text: string): Locator {
    return this.page.locator(`text="${text}"`);
  }

  /**
   * 역할로 요소 찾기
   */
  getByRole(role: string, options?: { name?: string }): Locator {
    return this.page.getByRole(role as any, options);
  }

  /**
   * 로딩 완료 대기
   */
  async waitForLoadingToFinish(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 요소가 보일 때까지 대기
   */
  async waitForVisible(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * 요소가 숨겨질 때까지 대기
   */
  async waitForHidden(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }

  /**
   * 페이지 제목 가져오기
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 현재 URL 가져오기
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * 스크린샷 촬영
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * 페이지 새로고침
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * 뒤로 가기
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * 앞으로 가기
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }
}
