import { type Page } from '@playwright/test';

/**
 * API 모킹 헬퍼 함수들
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface MockPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

/**
 * 사용자 API 모킹
 */
export async function mockUserApi(page: Page) {
  // 사용자 목록 조회
  await page.route('**/api/users', route => {
    const mockUsers: MockUser[] = [
      {
        id: '1',
        email: 'test@example.com',
        name: '테스트 사용자'
      },
      {
        id: '2',
        email: 'admin@example.com',
        name: '관리자'
      }
    ];
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUsers)
    });
  });

  // 특정 사용자 조회
  await page.route('**/api/users/*', route => {
    const url = route.request().url();
    const userId = url.split('/').pop();
    
    const mockUser: MockUser = {
      id: userId || '1',
      email: 'test@example.com',
      name: '테스트 사용자'
    };
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser)
    });
  });
}

/**
 * 인증 API 모킹
 */
export async function mockAuthApi(page: Page) {
  // 로그인
  await page.route('**/auth/login', route => {
    const request = route.request();
    
    if (request.method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: '테스트 사용자'
          },
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token'
        })
      });
    }
  });

  // 로그아웃
  await page.route('**/auth/logout', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: '로그아웃 성공' })
    });
  });

  // 현재 사용자 정보
  await page.route('**/auth/me', route => {
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
}

/**
 * 게시글 API 모킹
 */
export async function mockPostApi(page: Page) {
  // 게시글 목록 조회
  await page.route('**/api/posts', route => {
    const mockPosts: MockPost[] = [
      {
        id: '1',
        title: '첫 번째 게시글',
        content: '첫 번째 게시글 내용입니다.',
        author_id: '1',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: '두 번째 게시글',
        content: '두 번째 게시글 내용입니다.',
        author_id: '1',
        created_at: new Date().toISOString()
      }
    ];
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPosts)
    });
  });
}

/**
 * 에러 응답 모킹
 */
export async function mockErrorResponse(page: Page, endpoint: string, status: number, message: string) {
  await page.route(`**/${endpoint}`, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: message })
    });
  });
}

/**
 * 네트워크 지연 시뮬레이션
 */
export async function mockSlowResponse(page: Page, endpoint: string, delay: number) {
  await page.route(`**/${endpoint}`, async route => {
    await new Promise(resolve => setTimeout(resolve, delay));
    route.continue();
  });
}
