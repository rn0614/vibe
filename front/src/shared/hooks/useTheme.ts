import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export interface UseThemeReturn {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isSystemDark: boolean;
}

/**
 * 테마 관리 훅
 * Bootstrap 5.3+ 다크모드 지원
 */
export const useTheme = (): UseThemeReturn => {
  // 시스템 다크모드 감지
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 로컬스토리지에서 테마 설정 가져오기
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem('vibe-theme') as Theme;
    return stored || 'auto';
  });

  // 실제 적용되는 테마 계산
  const effectiveTheme: 'light' | 'dark' = 
    theme === 'auto' ? (isSystemDark ? 'dark' : 'light') : theme;

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // 현재 상태 설정
    setIsSystemDark(mediaQuery.matches);

    // 변경 감지 리스너 등록
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 구형 브라우저 지원
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // HTML 태그에 data-bs-theme 속성 적용
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    // Bootstrap 다크모드 속성 설정
    htmlElement.setAttribute('data-bs-theme', effectiveTheme);
    
    // body 요소에 Bootstrap 배경색과 텍스트 색상 클래스 적용
    bodyElement.className = bodyElement.className
      .replace(/\b(bg-body|bg-light|bg-dark|text-body|text-light|text-dark|theme-light|theme-dark)\b/g, '')
      .trim();
    
    // Bootstrap의 semantic 클래스 적용
    bodyElement.classList.add('bg-body', 'text-body', `theme-${effectiveTheme}`);

  }, [effectiveTheme]);

  // 테마 설정 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('vibe-theme', newTheme);
  };

  // 테마 토글 함수 (light ↔ dark, auto는 제외)
  const toggleTheme = () => {
    if (theme === 'auto') {
      // auto에서 반대 테마로 전환
      setTheme(isSystemDark ? 'light' : 'dark');
    } else {
      // light ↔ dark 토글
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isSystemDark,
  };
};
