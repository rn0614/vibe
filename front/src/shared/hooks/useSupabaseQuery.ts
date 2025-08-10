import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import type { PostgrestError } from '@supabase/supabase-js';
import { ApiException } from '@/shared/api/client';

/**
 * 🚀 HOC 기반 Supabase Query Builder
 * 
 * 기본 기능들을 조합하여 복잡한 쿼리를 만들 수 있는 체이닝 API 제공
 * 
 * 사용 예시:
 * ```typescript
 * const usersQuery = createSupabaseQuery('users')
 *   .select('id, name, email, avatar_url')
 *   .where('status', 'eq', 'active')
 *   .search(['name', 'email'], searchTerm)
 *   .paginate({ page: 0, size: 20 })
 *   .sort('created_at', 'desc');
 * 
 * const { data, isLoading } = useQuery({
 *   queryKey: usersQuery.getQueryKey(),
 *   queryFn: usersQuery.execute
 * });
 * ```
 */

// =============================================================================
// HOC 기반 Query Builder
// =============================================================================

/**
 * 쿼리 조건 타입 정의
 */
export type WhereCondition = 
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'neq'; column: string; value: unknown }
  | { type: 'gt'; column: string; value: unknown }
  | { type: 'gte'; column: string; value: unknown }
  | { type: 'lt'; column: string; value: unknown }
  | { type: 'lte'; column: string; value: unknown }
  | { type: 'in'; column: string; values: unknown[] }
  | { type: 'is'; column: string; value: null | boolean }
  | { type: 'like'; column: string; pattern: string }
  | { type: 'ilike'; column: string; pattern: string };

export type SearchCondition = {
  columns: string[];
  term: string;
  caseSensitive?: boolean;
};

export type SortCondition = {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
};

export type PaginationCondition = {
  page: number;
  size: number;
};

/**
 * Query Builder 클래스
 */
export class SupabaseQueryBuilder<T = unknown> {
  private table: string;
  private selectColumns: string = '*';
  private whereConditions: WhereCondition[] = [];
  private searchCondition?: SearchCondition;
  private sortConditions: SortCondition[] = [];
  private paginationCondition?: PaginationCondition;
  private singleMode: boolean = false;
  private countMode: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  /**
   * SELECT 절 설정
   */
  select(columns: string): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    newBuilder.selectColumns = columns;
    return newBuilder;
  }

  /**
   * WHERE 조건 추가 (정확한 값 일치, 비교 등)
   */
  where(column: string, operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte', value: unknown): SupabaseQueryBuilder<T>;
  where(column: string, operator: 'in', values: unknown[]): SupabaseQueryBuilder<T>;
  where(column: string, operator: 'is', value: null | boolean): SupabaseQueryBuilder<T>;
  where(column: string, operator: 'like' | 'ilike', pattern: string): SupabaseQueryBuilder<T>;
  where(column: string, operator: string, value: unknown): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    
    if (operator === 'in' && Array.isArray(value)) {
      newBuilder.whereConditions.push({ type: 'in', column, values: value });
    } else {
      newBuilder.whereConditions.push({ 
        type: operator as WhereCondition['type'], 
        column, 
        value 
      } as WhereCondition);
    }
    
    return newBuilder;
  }

  /**
   * 검색 조건 추가 (특정 단어를 포함한 경우)
   */
  search(columns: string[], term: string, caseSensitive = false): SupabaseQueryBuilder<T> {
    if (!term.trim()) return this;
    
    const newBuilder = this.clone();
    newBuilder.searchCondition = {
      columns,
      term: term.trim(),
      caseSensitive
    };
    return newBuilder;
  }

  /**
   * 정렬 조건 추가
   */
  sort(column: string, direction: 'asc' | 'desc' = 'asc', nullsFirst?: boolean): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    newBuilder.sortConditions.push({
      column,
      ascending: direction === 'asc',
      nullsFirst
    });
    return newBuilder;
  }

  /**
   * 페이지네이션 설정
   */
  paginate(condition: PaginationCondition): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    newBuilder.paginationCondition = condition;
    return newBuilder;
  }

  /**
   * 단일 레코드 조회 모드
   */
  single(): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    newBuilder.singleMode = true;
    return newBuilder;
  }

  /**
   * 카운트 모드 (개수만 조회)
   */
  count(): SupabaseQueryBuilder<T> {
    const newBuilder = this.clone();
    newBuilder.countMode = true;
    return newBuilder;
  }

  /**
   * 쿼리 키 생성
   */
  getQueryKey(): readonly unknown[] {
    const keyParts = [
      this.table,
      { 
        select: this.selectColumns,
        where: this.whereConditions,
        search: this.searchCondition,
        sort: this.sortConditions,
        pagination: this.paginationCondition,
        single: this.singleMode,
        count: this.countMode
      }
    ];
    return keyParts;
  }

  /**
   * 쿼리 실행
   */
  async execute(): Promise<T | T[] | { count: number }> {
    try {
      let query = supabase.from(this.table as any);

      // COUNT 모드
      if (this.countMode) {
        query = (query as any).select('*', { count: 'exact', head: true });
      } else {
        query = (query as any).select(this.selectColumns);
      }

      // WHERE 조건 적용
      for (const condition of this.whereConditions) {
        switch (condition.type) {
          case 'eq':
            query = (query as any).eq(condition.column, condition.value);
            break;
          case 'neq':
            query = (query as any).neq(condition.column, condition.value);
            break;
          case 'gt':
            query = (query as any).gt(condition.column, condition.value);
            break;
          case 'gte':
            query = (query as any).gte(condition.column, condition.value);
            break;
          case 'lt':
            query = (query as any).lt(condition.column, condition.value);
            break;
          case 'lte':
            query = (query as any).lte(condition.column, condition.value);
            break;
          case 'in':
            query = (query as any).in(condition.column, condition.values);
            break;
          case 'is':
            query = (query as any).is(condition.column, condition.value);
            break;
          case 'like':
            query = (query as any).like(condition.column, condition.pattern);
            break;
          case 'ilike':
            query = (query as any).ilike(condition.column, condition.pattern);
            break;
        }
      }

      // 검색 조건 적용
      if (this.searchCondition) {
        const { columns, term, caseSensitive } = this.searchCondition;
        const operator = caseSensitive ? 'like' : 'ilike';
        const pattern = `%${term}%`;
        
        const searchQueries = columns.map(col => `${col}.${operator}.${pattern}`);
        query = (query as any).or(searchQueries.join(','));
      }

      // 정렬 조건 적용
      for (const sortCondition of this.sortConditions) {
        query = (query as any).order(sortCondition.column, {
          ascending: sortCondition.ascending,
          nullsFirst: sortCondition.nullsFirst
        });
      }

      // 페이지네이션 적용
      if (this.paginationCondition) {
        const { from, to } = createPaginationQuery({
          page: this.paginationCondition.page,
          pageSize: this.paginationCondition.size
        });
        query = (query as any).range(from, to);
      }

      // 단일 레코드 모드
      if (this.singleMode) {
        query = (query as any).single();
      }

      const { data, error, count } = await (query as any);

      if (error) handleSupabaseError(error);

      // COUNT 모드일 때
      if (this.countMode) {
        return { count: count || 0 };
      }

      return data as T | T[];
    } catch (error) {
      handleSupabaseError(error);
    }
    
    // 이 부분은 도달하지 않지만 TypeScript를 위해 추가
    throw new Error('Query execution failed');
  }

  /**
   * 빌더 복제
   */
  private clone(): SupabaseQueryBuilder<T> {
    const newBuilder = new SupabaseQueryBuilder<T>(this.table);
    newBuilder.selectColumns = this.selectColumns;
    newBuilder.whereConditions = [...this.whereConditions];
    newBuilder.searchCondition = this.searchCondition ? { ...this.searchCondition } : undefined;
    newBuilder.sortConditions = [...this.sortConditions];
    newBuilder.paginationCondition = this.paginationCondition ? { ...this.paginationCondition } : undefined;
    newBuilder.singleMode = this.singleMode;
    newBuilder.countMode = this.countMode;
    return newBuilder;
  }
}

/**
 * Query Builder 생성 팩토리 함수
 */
export const createSupabaseQuery = <T = unknown>(table: string): SupabaseQueryBuilder<T> => {
  return new SupabaseQueryBuilder<T>(table);
};

// =============================================================================
// Query Key 유틸리티 (재사용 권장)
// =============================================================================

/**
 * 표준화된 Query Key 생성 유틸리티
 * 
 * @example
 * const userKeys = createQueryKeys('users');
 * userKeys.all() // ['users']
 * userKeys.lists() // ['users', 'list']
 * userKeys.list({ status: 'active' }) // ['users', 'list', { status: 'active' }]
 * userKeys.detail('123') // ['users', 'detail', '123']
 */
export const createQueryKeys = (entity: string) => ({
  all: () => [entity] as const,
  lists: () => [...createQueryKeys(entity).all(), 'list'] as const,
  list: (filters: Record<string, unknown>) => 
    [...createQueryKeys(entity).lists(), filters] as const,
  details: () => [...createQueryKeys(entity).all(), 'detail'] as const,
  detail: (id: string) => [...createQueryKeys(entity).details(), id] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...createQueryKeys(entity).all(), 'infinite', filters] as const,
});

// 공통 Query Keys
export const QUERY_KEYS = {
  users: createQueryKeys('users'),
  posts: createQueryKeys('posts'),
  comments: createQueryKeys('comments'),
} as const;

// =============================================================================
// 에러 핸들링 유틸리티 (재사용 권장)
// =============================================================================

/**
 * Supabase 에러를 ApiException으로 변환
 */
export const handleSupabaseError = (error: unknown): never => {
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case '23505': // unique_violation
        throw new ApiException(409, '이미 존재하는 데이터입니다.', pgError.code, pgError.details, pgError.hint);
      case '23503': // foreign_key_violation
        throw new ApiException(400, '참조된 데이터가 존재하지 않습니다.', pgError.code, pgError.details, pgError.hint);
      case '42501': // insufficient_privilege
        throw new ApiException(403, '권한이 없습니다.', pgError.code, pgError.details, pgError.hint);
      case '23514': // check_violation
        throw new ApiException(400, '데이터 형식이 올바르지 않습니다.', pgError.code, pgError.details, pgError.hint);
      default:
        throw new ApiException(400, pgError.message, pgError.code, pgError.details, pgError.hint);
    }
  }
  
  throw new ApiException(500, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR', error);
};

/**
 * Query 무효화 유틸리티
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateEntity: (entity: keyof typeof QUERY_KEYS) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS[entity].all() });
    },
    invalidateEntityDetail: (entity: keyof typeof QUERY_KEYS, id: string) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS[entity].detail(id) });
    },
    invalidateEntityLists: (entity: keyof typeof QUERY_KEYS) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS[entity].lists() });
    },
  };
};

// =============================================================================
// 페이지네이션 유틸리티 (재사용 권장)
// =============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Supabase 페이지네이션 헬퍼
 */
export const createPaginationQuery = (
  { page, pageSize }: PaginationParams
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  return { from, to };
};

/**
 * 페이지네이션 결과 변환 헬퍼
 */
export const createPaginationResult = <T>(
  data: T[],
  count: number | null,
  { page, pageSize }: PaginationParams
): PaginationResult<T> => {
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    data,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
  };
};

// =============================================================================
// 실시간 구독 유틸리티 (재사용 권장)
// =============================================================================

/**
 * Supabase 실시간 구독 설정 헬퍼
 * 
 * ⚠️ 실제 DB 연결 후 구현하세요
 */
export const createRealtimeSubscription = () => {
  throw new Error('createRealtimeSubscription: 실제 DB 연결 후 사용하세요.');
};

// =============================================================================
// 조합 가능한 Hooks
// =============================================================================

/**
 * Query Builder를 사용하는 기본 쿼리 Hook
 */
export const useSupabaseQueryBuilder = <T = unknown>(
  queryBuilder: SupabaseQueryBuilder<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryBuilder.getQueryKey(),
    queryFn: () => queryBuilder.execute(),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5분
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};

/**
 * 조건부 쿼리 생성 헬퍼
 */
export const createConditionalQuery = <T = unknown>(
  table: string,
  conditions: {
    select?: string;
    where?: Array<{
      column: string;
      operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'is' | 'like' | 'ilike';
      value: unknown;
    }>;
    search?: {
      columns: string[];
      term: string;
      caseSensitive?: boolean;
    };
    sort?: Array<{
      column: string;
      direction: 'asc' | 'desc';
      nullsFirst?: boolean;
    }>;
    pagination?: PaginationCondition;
    single?: boolean;
    count?: boolean;
  }
): SupabaseQueryBuilder<T> => {
  let query = createSupabaseQuery<T>(table);

  // SELECT 절
  if (conditions.select) {
    query = query.select(conditions.select);
  }

  // WHERE 조건들
  if (conditions.where) {
    for (const condition of conditions.where) {
      if (condition.operator === 'in' && Array.isArray(condition.value)) {
        query = query.where(condition.column, 'in', condition.value);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = query.where(condition.column, condition.operator as any, condition.value);
      }
    }
  }

  // 검색 조건
  if (conditions.search && conditions.search.term) {
    query = query.search(
      conditions.search.columns,
      conditions.search.term,
      conditions.search.caseSensitive
    );
  }

  // 정렬 조건들
  if (conditions.sort) {
    for (const sortCondition of conditions.sort) {
      query = query.sort(sortCondition.column, sortCondition.direction, sortCondition.nullsFirst);
    }
  }

  // 페이지네이션
  if (conditions.pagination) {
    query = query.paginate(conditions.pagination);
  }

  // 단일 레코드
  if (conditions.single) {
    query = query.single();
  }

  // 카운트 모드
  if (conditions.count) {
    query = query.count();
  }

  return query;
};

/**
 * 뮤테이션을 위한 Query Builder 기반 헬퍼
 */
export const useSupabaseMutationBuilder = <T = unknown>(
  table: string,
  type: 'insert' | 'update' | 'delete',
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[]; // 무효화할 테이블명들
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      data?: unknown;
      id?: string;
      where?: Array<{ column: string; operator: string; value: unknown }>;
    }): Promise<T> => {
      try {
        let query = supabase.from(table as any);

        switch (type) {
          case 'insert': {
            query = (query as any).insert(params.data).select().single();
            break;
          }
          case 'update': {
            if (params.id) {
              query = (query as any).update(params.data).eq('id', params.id).select().single();
            } else if (params.where) {
              let updateQuery = (query as any).update(params.data);
              for (const condition of params.where) {
                updateQuery = (updateQuery as any)[condition.operator](condition.column, condition.value);
              }
              query = updateQuery.select();
            } else {
              throw new Error('Update requires either id or where conditions');
            }
            break;
          }
          case 'delete': {
            if (params.id) {
              query = (query as any).delete().eq('id', params.id);
            } else if (params.where) {
              let deleteQuery = (query as any).delete();
              for (const condition of params.where) {
                deleteQuery = (deleteQuery as any)[condition.operator](condition.column, condition.value);
              }
              query = deleteQuery;
            } else {
              throw new Error('Delete requires either id or where conditions');
            }
            break;
          }
        }

        const { data, error } = await (query as any);

        if (error) handleSupabaseError(error);
        return data as T;
      } catch (error) {
        handleSupabaseError(error);
      }
      
      // 이 부분은 도달하지 않지만 TypeScript를 위해 추가
      throw new Error('Mutation execution failed');
    },
    onSuccess: (data) => {
      // 쿼리 무효화
      if (options?.invalidateQueries) {
        for (const tableName of options.invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: [tableName] });
        }
      } else {
        // 기본적으로 현재 테이블 무효화
        queryClient.invalidateQueries({ queryKey: [table] });
      }

      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

// =============================================================================
// 사용 예시 및 패턴
// =============================================================================

/**
 * 🚀 기본 사용 예시
 * 
 * 1. 간단한 조회:
 * ```typescript
 * const usersQuery = createSupabaseQuery('users')
 *   .select('id, name, email')
 *   .where('status', 'eq', 'active')
 *   .sort('created_at', 'desc');
 * 
 * const { data: users, isLoading } = useSupabaseQueryBuilder(usersQuery);
 * ```
 * 
 * 2. 복합 조건 조회:
 * ```typescript
 * const searchUsersQuery = createSupabaseQuery('users')
 *   .select('id, name, email, avatar_url')
 *   .where('status', 'eq', 'active')
 *   .where('role', 'in', ['admin', 'user'])
 *   .search(['name', 'email'], searchTerm)
 *   .paginate({ page: 0, size: 20 })
 *   .sort('created_at', 'desc');
 * 
 * const { data: users } = useSupabaseQueryBuilder(searchUsersQuery, {
 *   enabled: !!searchTerm
 * });
 * ```
 * 
 * 3. 단일 레코드 조회:
 * ```typescript
 * const userQuery = createSupabaseQuery('users')
 *   .select('*')
 *   .where('id', 'eq', userId)
 *   .single();
 * 
 * const { data: user } = useSupabaseQueryBuilder(userQuery, {
 *   enabled: !!userId
 * });
 * ```
 * 
 * 4. 조건부 쿼리 생성:
 * ```typescript
 * const complexQuery = createConditionalQuery('posts', {
 *   select: 'id, title, content, author_id, users!posts_author_id_fkey(name)',
 *   where: [
 *     { column: 'status', operator: 'eq', value: 'published' },
 *     { column: 'category', operator: 'in', value: ['tech', 'news'] }
 *   ],
 *   search: {
 *     columns: ['title', 'content'],
 *     term: searchTerm
 *   },
 *   sort: [
 *     { column: 'published_at', direction: 'desc' }
 *   ],
 *   pagination: { page: currentPage, size: 10 }
 * });
 * 
 * const { data: posts } = useSupabaseQueryBuilder(complexQuery);
 * ```
 * 
 * 5. 뮤테이션 사용:
 * ```typescript
 * const createUser = useSupabaseMutationBuilder('users', 'insert', {
 *   invalidateQueries: ['users'],
 *   onSuccess: (newUser) => {
 *     console.log('사용자 생성됨:', newUser);
 *   }
 * });
 * 
 * const updateUser = useSupabaseMutationBuilder('users', 'update', {
 *   invalidateQueries: ['users']
 * });
 * 
 * const deleteUser = useSupabaseMutationBuilder('users', 'delete', {
 *   invalidateQueries: ['users']
 * });
 * 
 * // 사용법
 * createUser.mutate({ data: { name: 'John', email: 'john@example.com' } });
 * updateUser.mutate({ id: '123', data: { name: 'Jane' } });
 * deleteUser.mutate({ id: '123' });
 * ```
 * 
 * 6. 카운트 쿼리:
 * ```typescript
 * const countQuery = createSupabaseQuery('users')
 *   .where('status', 'eq', 'active')
 *   .count();
 * 
 * const { data: countResult } = useSupabaseQueryBuilder(countQuery);
 * // countResult = { count: 150 }
 * ```
 */
