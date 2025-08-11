import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * 인증 상태 설정
 * 로그인이 필요한 테스트에서 사용할 수 있는 인증 상태를 미리 생성합니다.
 */

const authFile = path.join(__dirname, '../.auth/user.json');

setup('인증 설정', async ({ page }) => {
  console.log('🔐 사용자 인증 설정 시작...');
  
  // 로그인 페이지로 이동
  await page.goto('/login');
  
  // 로그인 폼 채우기 (실제 테스트 계정 정보 사용)
  await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL || 'test@example.com');
  await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD || 'password123');
  
  // 로그인 버튼 클릭
  await page.click('[data-testid="login-button"]');
  
  // 로그인 성공 확인 (홈페이지로 리다이렉트)
  await expect(page).toHaveURL('/');
  
  // 또는 인증된 사용자만 볼 수 있는 요소 확인
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // 인증 상태를 파일로 저장
  await page.context().storageState({ path: authFile });
  
  console.log('✅ 사용자 인증 설정 완료');
});

export { authFile };
