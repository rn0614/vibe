// Auth hooks (현재 사용 중)
export { useAuth, useIsAuthenticated, AUTH_USER_QUERY_KEY } from './useAuth';
export { useAuthActions } from './useAuthActions';

// Supabase Query Builder (HOC 기반 조합 가능한 쿼리)
export { 
  createSupabaseQuery,
  createConditionalQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder,
  SupabaseQueryBuilder,
  type WhereCondition,
  type SearchCondition,
  type SortCondition,
  type PaginationCondition
} from './useSupabaseQueryBuilderV2';

// Supabase 유틸리티 (도메인별 hooks에서 사용)
export { 
  QUERY_KEYS,
  createQueryKeys,
  handleSupabaseError,
  useInvalidateQueries,
  createPaginationQuery,
  createPaginationResult,
  // createRealtimeSubscription, // DB 연결 후 주석 해제
  type PaginationParams,
  type PaginationResult
} from './useSupabaseQuery';