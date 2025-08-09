import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// QueryClient 설정
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 5 * 60 * 1000,
      // 10분간 캐시 보관
      gcTime: 10 * 60 * 1000,
      // 에러 시 재시도 1회
      retry: 1,
      // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 리페치
      refetchOnReconnect: true,
    },
    mutations: {
      // 뮤테이션 에러 시 재시도 없음
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // QueryClient를 컴포넌트 상태로 관리 (HMR 지원)
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
};
