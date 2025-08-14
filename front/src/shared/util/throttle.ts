/**
 * 함수 호출을 지정된 시간 간격으로 제한하는 throttle 함수
 * 첫 번째 호출은 즉시 실행되고, 그 이후 호출들은 지정된 시간 간격으로만 실행됩니다.
 * 
 * @param func 실행할 함수
 * @param delay 지연 시간 (밀리초)
 * @returns throttled 함수
 * 
 * @example
 * ```typescript
 * const throttledSearch = throttle((query: string) => {
 *   console.log('Searching for:', query);
 * }, 2000);
 * 
 * throttledSearch('a'); // 즉시 실행
 * throttledSearch('ab'); // 무시됨
 * throttledSearch('abc'); // 2초 후 실행
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecution = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastExecution >= delay) {
      // 지연 시간이 지났으면 즉시 실행
      lastExecution = now;
      func(...args);
    } else {
      // 지연 시간이 안 지났으면 남은 시간 후에 실행
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const remainingTime = delay - (now - lastExecution);
      timeoutId = setTimeout(() => {
        lastExecution = Date.now();
        func(...args);
      }, remainingTime);
    }
  };
}

/**
 * React 컴포넌트에서 사용할 수 있는 throttle hook
 * 
 * @param callback 실행할 콜백 함수
 * @param delay 지연 시간 (밀리초)
 * @param deps 의존성 배열
 * @returns throttled 함수
 * 
 * @example
 * ```typescript
 * const throttledSearch = useThrottle((query: string) => {
 *   setSearchTerm(query);
 * }, 2000, []);
 * ```
 */
import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): (...args: Parameters<T>) => void {
  const lastExecution = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecution.current >= delay) {
        lastExecution.current = now;
        callback.apply(null, args);
      } else {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        
        const remainingTime = delay - (now - lastExecution.current);
        timeoutId.current = setTimeout(() => {
          lastExecution.current = Date.now();
          callback.apply(null, args);
        }, remainingTime);
      }
    },
    [callback, delay, ...deps]
  );
}

export default throttle;
