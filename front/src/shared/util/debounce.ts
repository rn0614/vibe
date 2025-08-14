/**
 * 함수 호출을 지연시키고, 마지막 호출 후 지정된 시간이 지나야 실행되는 debounce 함수
 * 연속된 호출들 중 마지막 호출만 지정된 시간 후에 실행됩니다.
 * 
 * @param func 실행할 함수
 * @param delay 지연 시간 (밀리초)
 * @returns debounced 함수
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 500);
 * 
 * debouncedSearch('a'); // 500ms 후 실행 예약
 * debouncedSearch('ab'); // 이전 예약 취소, 새로 500ms 후 실행 예약
 * debouncedSearch('abc'); // 이전 예약 취소, 새로 500ms 후 실행 예약
 * // 최종적으로 'abc'만 500ms 후 실행됨
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    // 이전 타이머가 있으면 취소
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 새로운 타이머 설정
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * React 컴포넌트에서 사용할 수 있는 debounce hook
 * 
 * @param callback 실행할 콜백 함수
 * @param delay 지연 시간 (밀리초)
 * @param deps 의존성 배열
 * @returns debounced 함수
 * 
 * @example
 * ```typescript
 * const debouncedSearch = useDebounce((query: string) => {
 *   performSearch(query);
 * }, 500, []);
 * ```
 */
import { useCallback, useRef, useState } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): (...args: Parameters<T>) => void {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        callback.apply(null, args);
      }, delay);
    },
    [callback, delay, ...deps]
  );
}

/**
 * 버튼 클릭 등의 액션에서 중복 실행을 방지하는 debounce 함수
 * 한 번 실행되면 지정된 시간 동안 추가 실행을 차단합니다.
 * 
 * @param func 실행할 함수
 * @param delay 차단 시간 (밀리초)
 * @returns debounced 함수와 현재 차단 상태
 * 
 * @example
 * ```typescript
 * const [debouncedClick, isPending] = useActionDebounce(() => {
 *   handleDelete();
 * }, 1000);
 * 
 * // isPending이 true인 동안은 추가 클릭이 무시됨
 * ```
 */
export function useActionDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [(...args: Parameters<T>) => void, boolean] {
  const [isExecuting, setIsExecuting] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (isExecuting) {
        return; // 이미 실행 중이면 무시
      }

      setIsExecuting(true);
      callback.apply(null, args);

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        setIsExecuting(false);
      }, delay);
    },
    [callback, delay, isExecuting]
  );

  return [debouncedFunction, isExecuting];
}

export default debounce;
