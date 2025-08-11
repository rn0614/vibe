import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 로그인 페이지 Page Object
 */
export class LoginPage extends BasePage {
  // 선택자 정의
  private readonly selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    signupLink: '[data-testid="signup-link"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    googleLoginButton: '[data-testid="google-login-button"]',
    githubLoginButton: '[data-testid="github-login-button"]',
  };

  /**
   * 로그인 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForLoadingToFinish();
  }

  /**
   * 폼 요소들
   */
  get emailInput() {
    return this.page.locator(this.selectors.emailInput);
  }

  get passwordInput() {
    return this.page.locator(this.selectors.passwordInput);
  }

  get loginButton() {
    return this.page.locator(this.selectors.loginButton);
  }

  get signupLink() {
    return this.page.locator(this.selectors.signupLink);
  }

  get forgotPasswordLink() {
    return this.page.locator(this.selectors.forgotPasswordLink);
  }

  get errorMessage() {
    return this.page.locator(this.selectors.errorMessage);
  }

  get successMessage() {
    return this.page.locator(this.selectors.successMessage);
  }

  get loadingSpinner() {
    return this.page.locator(this.selectors.loadingSpinner);
  }

  get googleLoginButton() {
    return this.page.locator(this.selectors.googleLoginButton);
  }

  get githubLoginButton() {
    return this.page.locator(this.selectors.githubLoginButton);
  }

  /**
   * 이메일 입력
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * 비밀번호 입력
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * 로그인 버튼 클릭
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * 로그인 실행 (이메일 + 비밀번호 + 로그인 버튼)
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * 빠른 로그인 (기본 테스트 계정)
   */
  async loginWithTestAccount(): Promise<void> {
    await this.login('test@example.com', 'password123');
  }

  /**
   * Google 로그인
   */
  async loginWithGoogle(): Promise<void> {
    await this.googleLoginButton.click();
    // Google OAuth 플로우는 실제 구현에 따라 다를 수 있음
  }

  /**
   * GitHub 로그인
   */
  async loginWithGithub(): Promise<void> {
    await this.githubLoginButton.click();
    // GitHub OAuth 플로우는 실제 구현에 따라 다를 수 있음
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goToSignup(): Promise<void> {
    await this.signupLink.click();
    await expect(this.page).toHaveURL('/signup');
  }

  /**
   * 비밀번호 찾기 페이지로 이동
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await expect(this.page).toHaveURL('/forgot-password');
  }

  /**
   * 로그인 성공 확인
   */
  async expectLoginSuccess(): Promise<void> {
    // 홈페이지로 리다이렉트되는지 확인
    await expect(this.page).toHaveURL('/');
  }

  /**
   * 로그인 실패 확인
   */
  async expectLoginFailure(errorText?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (errorText) {
      await expect(this.errorMessage).toContainText(errorText);
    }
  }

  /**
   * 폼 검증 에러 확인
   */
  async expectValidationError(field: 'email' | 'password', errorText: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="${field}-error"]`);
    await expect(fieldError).toBeVisible();
    await expect(fieldError).toContainText(errorText);
  }

  /**
   * 로딩 상태 확인
   */
  async expectLoading(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loginButton).toBeDisabled();
  }

  /**
   * 로딩 완료 확인
   */
  async expectLoadingFinished(): Promise<void> {
    await expect(this.loadingSpinner).not.toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * 페이지 요소들이 올바르게 표시되는지 확인
   */
  async expectPageToBeLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.signupLink).toBeVisible();
  }

  /**
   * 입력 필드 클리어
   */
  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }
}
