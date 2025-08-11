import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * AppLayout Header Page Object
 */
export class AppHeaderPage extends BasePage {
  // 선택자 정의
  private readonly selectors = {
    // 전체 헤더
    header: 'nav.navbar',
    
    // 로고
    logo: 'a.navbar-brand',
    
    // 햄버거 메뉴 버튼
    hamburgerButton: 'button:has-text("☰")',
    
    // 테마 토글 버튼
    themeToggleButton: 'button[title*="현재 테마"]',
    
    // 비로그인 상태 요소들
    loginButton: 'a.btn:has-text("로그인")',
    signupButton: 'a.btn:has-text("회원가입")',
    
    // 로그인 상태 요소들
    loadingText: '.text-body-secondary:has-text("로딩 중...")',
    notificationButton: 'button:has-text("🔔")',
    profileDropdown: 'button:has-text("👤")',
    profileDropdownMenu: '.dropdown-menu',
    userEmail: '.dropdown-item-text small',
    
    // 드롭다운 메뉴 항목들
    lightModeOption: '.dropdown-item:has-text("라이트 모드")',
    darkModeOption: '.dropdown-item:has-text("다크 모드")',
    autoModeOption: '.dropdown-item:has-text("시스템 설정")',
    logoutButton: '.dropdown-item:has-text("로그아웃")',
    
    // 사이드바
    offcanvas: '.offcanvas',
    offcanvasCloseButton: '.btn-close',
    navigationLink: (text: string) => `.nav-link:has-text("${text}")`,
  };

  /**
   * 페이지로 이동 (헤더는 모든 페이지에 있으므로 홈으로 이동)
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

  get logo() {
    return this.page.locator(this.selectors.logo);
  }

  get hamburgerButton() {
    return this.page.locator(this.selectors.hamburgerButton);
  }

  get themeToggleButton() {
    return this.page.locator(this.selectors.themeToggleButton);
  }

  // 비로그인 상태 요소들
  get loginButton() {
    return this.page.locator(this.selectors.loginButton);
  }

  get signupButton() {
    return this.page.locator(this.selectors.signupButton);
  }

  // 로그인 상태 요소들
  get loadingText() {
    return this.page.locator(this.selectors.loadingText);
  }

  get notificationButton() {
    return this.page.locator(this.selectors.notificationButton);
  }

  get profileDropdown() {
    return this.page.locator(this.selectors.profileDropdown);
  }

  get profileDropdownMenu() {
    return this.page.locator(this.selectors.profileDropdownMenu);
  }

  get userEmail() {
    return this.page.locator(this.selectors.userEmail);
  }

  get logoutButton() {
    return this.page.locator(this.selectors.logoutButton);
  }

  get offcanvas() {
    return this.page.locator(this.selectors.offcanvas);
  }

  /**
   * 로고 클릭하여 홈으로 이동
   */
  async clickLogo(): Promise<void> {
    await this.logo.click();
    await expect(this.page).toHaveURL('/');
  }

  /**
   * 햄버거 메뉴 열기
   */
  async openSidebar(): Promise<void> {
    await this.hamburgerButton.click();
    await expect(this.offcanvas).toBeVisible();
  }

  /**
   * 사이드바 닫기
   */
  async closeSidebar(): Promise<void> {
    await this.page.locator(this.selectors.offcanvasCloseButton).click();
    await expect(this.offcanvas).not.toBeVisible();
  }

  /**
   * 사이드바에서 네비게이션 메뉴 클릭
   */
  async clickSidebarNavigation(menuText: string): Promise<void> {
    await this.openSidebar();
    await this.page.locator(this.selectors.navigationLink(menuText)).click();
    await expect(this.offcanvas).not.toBeVisible();
  }

  /**
   * 테마 토글 버튼 클릭
   */
  async toggleTheme(): Promise<void> {
    await this.themeToggleButton.click();
  }

  /**
   * 로그인 버튼 클릭
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    await expect(this.page).toHaveURL('/login');
  }

  /**
   * 회원가입 버튼 클릭
   */
  async clickSignup(): Promise<void> {
    await this.signupButton.click();
    await expect(this.page).toHaveURL('/signup');
  }

  /**
   * 프로필 드롭다운 열기
   */
  async openProfileDropdown(): Promise<void> {
    await this.profileDropdown.click();
    await expect(this.profileDropdownMenu).toBeVisible();
  }

  /**
   * 드롭다운에서 로그아웃 클릭
   */
  async clickLogoutFromDropdown(): Promise<void> {
    await this.openProfileDropdown();
    await this.logoutButton.click();
  }

  /**
   * 드롭다운에서 테마 변경
   */
  async changeThemeFromDropdown(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    await this.openProfileDropdown();
    
    const themeMap = {
      light: this.selectors.lightModeOption,
      dark: this.selectors.darkModeOption,
      auto: this.selectors.autoModeOption,
    };
    
    await this.page.locator(themeMap[theme]).click();
  }

  /**
   * 헤더 기본 요소들이 표시되는지 확인
   */
  async expectHeaderToBeVisible(): Promise<void> {
    await expect(this.header).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.hamburgerButton).toBeVisible();
    await expect(this.themeToggleButton).toBeVisible();
  }

  /**
   * 비로그인 상태 UI 확인
   */
  async expectLoggedOutState(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.signupButton).toBeVisible();
    
    // 로그인 상태 요소들이 보이지 않아야 함
    await expect(this.notificationButton).not.toBeVisible();
    await expect(this.profileDropdown).not.toBeVisible();
  }

  /**
   * 로그인 상태 UI 확인
   */
  async expectLoggedInState(userEmail?: string): Promise<void> {
    await expect(this.notificationButton).toBeVisible();
    await expect(this.profileDropdown).toBeVisible();
    
    // 비로그인 상태 요소들이 보이지 않아야 함
    await expect(this.loginButton).not.toBeVisible();
    await expect(this.signupButton).not.toBeVisible();
    
    // 이메일 확인 (선택적)
    if (userEmail) {
      await this.openProfileDropdown();
      await expect(this.userEmail).toContainText(userEmail);
    }
  }

  /**
   * 로딩 상태 확인
   */
  async expectLoadingState(): Promise<void> {
    await expect(this.loadingText).toBeVisible();
    
    // 로딩 중에는 다른 액션 버튼들이 보이지 않아야 함
    await expect(this.loginButton).not.toBeVisible();
    await expect(this.signupButton).not.toBeVisible();
    await expect(this.notificationButton).not.toBeVisible();
    await expect(this.profileDropdown).not.toBeVisible();
  }

  /**
   * 프로필 드롭다운 메뉴 내용 확인
   */
  async expectProfileDropdownContent(userEmail: string): Promise<void> {
    await this.openProfileDropdown();
    
    // 사용자 이메일 확인
    await expect(this.userEmail).toContainText(userEmail);
    
    // 테마 옵션들 확인
    await expect(this.page.locator(this.selectors.lightModeOption)).toBeVisible();
    await expect(this.page.locator(this.selectors.darkModeOption)).toBeVisible();
    await expect(this.page.locator(this.selectors.autoModeOption)).toBeVisible();
    
    // 로그아웃 버튼 확인
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * 사이드바 내용 확인
   */
  async expectSidebarContent(): Promise<void> {
    await this.openSidebar();
    
    // 메인 네비게이션 확인
    await expect(this.page.locator(this.selectors.navigationLink('홈'))).toBeVisible();
    await expect(this.page.locator(this.selectors.navigationLink('할 일'))).toBeVisible();
    await expect(this.page.locator(this.selectors.navigationLink('소개'))).toBeVisible();
    
    // 라이브러리 섹션 확인
    await expect(this.page.locator(this.selectors.navigationLink('즐겨찾기'))).toBeVisible();
    await expect(this.page.locator(this.selectors.navigationLink('기록'))).toBeVisible();
    await expect(this.page.locator(this.selectors.navigationLink('설정'))).toBeVisible();
    
    await this.closeSidebar();
  }
}
