import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 홈페이지 Page Object
 */
export class HomePage extends BasePage {
  // 선택자 정의
  private readonly selectors = {
    header: '[data-testid="app-header"]',
    navigation: '[data-testid="navigation"]',
    mainContent: '[data-testid="main-content"]',
    footer: '[data-testid="app-footer"]',
    userMenu: '[data-testid="user-menu"]',
    loginButton: '[data-testid="login-button"]',
    logoutButton: '[data-testid="logout-button"]',
  };

  /**
   * 홈페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoadingToFinish();
  }

  /**
   * 헤더 요소들
   */
  get header() {
    return this.page.locator(this.selectors.header);
  }

  get navigation() {
    return this.page.locator(this.selectors.navigation);
  }

  get mainContent() {
    return this.page.locator(this.selectors.mainContent);
  }

  get footer() {
    return this.page.locator(this.selectors.footer);
  }

  get userMenu() {
    return this.page.locator(this.selectors.userMenu);
  }

  get loginButton() {
    return this.page.locator(this.selectors.loginButton);
  }

  get logoutButton() {
    return this.page.locator(this.selectors.logoutButton);
  }

  /**
   * 로그인 페이지로 이동
   */
  async goToLogin(): Promise<void> {
    await this.loginButton.click();
    await expect(this.page).toHaveURL('/login');
  }

  /**
   * 네비게이션 메뉴 클릭
   */
  async navigateTo(menuItem: 'home' | 'about' | 'todos'): Promise<void> {
    const menuMap = {
      home: 'Home',
      about: 'About',
      todos: 'Todos'
    };
    
    await this.getByRole('link', { name: menuMap[menuItem] }).click();
    await this.waitForLoadingToFinish();
  }

  /**
   * 사용자 메뉴 열기
   */
  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutButton.click();
    await expect(this.page).toHaveURL('/');
  }

  /**
   * 페이지 요소들이 올바르게 표시되는지 확인
   */
  async expectPageToBeLoaded(): Promise<void> {
    await expect(this.header).toBeVisible();
    await expect(this.navigation).toBeVisible();
    await expect(this.mainContent).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  /**
   * 로그인된 상태인지 확인
   */
  async expectToBeLoggedIn(): Promise<void> {
    await expect(this.userMenu).toBeVisible();
    await expect(this.loginButton).not.toBeVisible();
  }

  /**
   * 로그아웃된 상태인지 확인
   */
  async expectToBeLoggedOut(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.userMenu).not.toBeVisible();
  }

  /**
   * 페이지 제목 확인
   */
  async expectPageTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }
}
