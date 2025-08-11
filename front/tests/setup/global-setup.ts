import { chromium, type FullConfig } from '@playwright/test';

/**
 * Playwright 전역 설정
 * 모든 테스트 실행 전에 한 번 실행됩니다.
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Playwright 전역 설정 시작...');
  
  // 브라우저 시작
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 개발 서버가 시작될 때까지 대기
    console.log('⏳ 개발 서버 시작 대기 중...');
    await page.goto(config.webServer?.url || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    console.log('✅ 개발 서버 준비 완료');
    
    // 필요한 경우 여기서 전역 인증 설정
    // await setupAuth(page);
    
  } catch (error) {
    console.error('❌ 전역 설정 실패:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Playwright 전역 설정 완료');
}

export default globalSetup;
