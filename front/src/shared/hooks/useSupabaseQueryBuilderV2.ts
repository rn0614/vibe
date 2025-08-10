import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api";
import type { PostgrestError } from '@supabase/supabase-js';
import { ApiException } from '@/shared/api/client';
import type { Database, Tables } from '@/shared/types/database';

// 테이블명 타입 추출
type TableName = keyof Database['public']['Tables'];

// 현재 존재하는 테이블들 (타입 안전성 확보)
// 새 테이블 추가 시 TableName 타입에 자동으로 포함됨

/**
 * 🚀 HOC 기반 Supabase Query Builder V2
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
 * const { data, isLoading } = useSupabaseQueryBuilder(usersQuery);
 * ```
 */

// =============================================================================
// 타입 정의
// =============================================================================

// 타입 안전한 SELECT 문자열 타입
export type SelectColumns<TTable extends TableName> = 
  | '*'
  | keyof Tables<TTable>
  | `${string & keyof Tables<TTable>}, ${string}`
  | string; // JOIN 및 복합 쿼리 지원

// WHERE 조건 타입 (컬럼별 타입 안전성)
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

// 검색 조건 타입 (타입 안전한 컬럼 배열)
export type SearchCondition<TTable extends TableName> = {
  columns: (keyof Tables<TTable>)[];
  term: string;
  caseSensitive?: boolean;
};

// 정렬 조건 타입 (타입 안전한 컬럼)
export type SortCondition<TTable extends TableName> = {
  column: keyof Tables<TTable>;
  ascending: boolean;
  nullsFirst?: boolean;
};

// 페이지네이션 조건 타입
export type PaginationCondition = {
  page: number;
  size: number;
};

// =============================================================================
// Query Builder 클래스
// =============================================================================

export class SupabaseQueryBuilder<TTable extends TableName> {
  private table: TTable;
  private selectedColumns: SelectColumns<TTable> = '*';
  private whereConditions: WhereCondition[] = [];
  private searchCondition?: SearchCondition<TTable>;
  private sortConditions: SortCondition<TTable>[] = [];
  private paginationCondition?: PaginationCondition;
  private singleMode: boolean = false;
  private countMode: boolean = false;
  private withCountMode: boolean = false;

  constructor(table: TTable) {
    this.table = table;
  }

  // SELECT 절 설정 (단일 컬럼, 복수 컬럼, JOIN 쿼리 모두 지원)
  select(columns: SelectColumns<TTable>): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.selectedColumns = columns;
    return newBuilder;
  }

  // 타입 안전한 단일 컬럼 SELECT
  selectColumn<K extends keyof Tables<TTable>>(column: K): SupabaseQueryBuilder<TTable> {
    return this.select(column);
  }

  // 타입 안전한 복수 컬럼 SELECT
  selectColumns<K extends keyof Tables<TTable>>(columns: K[]): SupabaseQueryBuilder<TTable> {
    return this.select(columns.join(', ') as SelectColumns<TTable>);
  }

  // WHERE 조건 추가 (정확한 값 일치, 비교 등)
  where<K extends keyof Tables<TTable>>(
    column: K, 
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte', 
    value: Tables<TTable>[K]
  ): SupabaseQueryBuilder<TTable>;
  where<K extends keyof Tables<TTable>>(
    column: K, 
    operator: 'in', 
    values: Tables<TTable>[K][]
  ): SupabaseQueryBuilder<TTable>;
  where<K extends keyof Tables<TTable>>(
    column: K, 
    operator: 'is', 
    value: null | boolean
  ): SupabaseQueryBuilder<TTable>;
  where(
    column: keyof Tables<TTable>, 
    operator: 'like' | 'ilike', 
    pattern: string
  ): SupabaseQueryBuilder<TTable>;
  where(column: keyof Tables<TTable>, operator: string, value: unknown): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    
    if (operator === 'in' && Array.isArray(value)) {
      newBuilder.whereConditions.push({ type: 'in', column: String(column), values: value as unknown[] });
    } else {
      newBuilder.whereConditions.push({ 
        type: operator as WhereCondition['type'], 
        column: String(column), 
        value 
      } as WhereCondition);
    }
    
    return newBuilder;
  }

  // 타입 안전한 값 검증이 포함된 WHERE 메서드들
  whereEq<K extends keyof Tables<TTable>>(
    column: K, 
    value: Tables<TTable>[K]
  ): SupabaseQueryBuilder<TTable> {
    return this.where(column, 'eq', value);
  }

  whereIn<K extends keyof Tables<TTable>>(
    column: K, 
    values: Tables<TTable>[K][]
  ): SupabaseQueryBuilder<TTable> {
    return this.where(column, 'in', values);
  }

  whereGt<K extends keyof Tables<TTable>>(
    column: K, 
    value: Tables<TTable>[K]
  ): SupabaseQueryBuilder<TTable> {
    return this.where(column, 'gt', value);
  }

  whereLike<K extends keyof Tables<TTable>>(
    column: K, 
    pattern: string
  ): SupabaseQueryBuilder<TTable> {
    return this.where(column, 'like', pattern);
  }

  // 검색 조건 추가 (특정 단어를 포함한 경우)
  search(columns: (keyof Tables<TTable>)[], term: string, caseSensitive = false): SupabaseQueryBuilder<TTable> {
    if (!term.trim()) return this;
    
    const newBuilder = this.clone();
    newBuilder.searchCondition = {
      columns,
      term: term.trim(),
      caseSensitive
    };
    return newBuilder;
  }

  // 단일 컬럼 검색 헬퍼
  searchInColumn<K extends keyof Tables<TTable>>(
    column: K, 
    term: string, 
    caseSensitive = false
  ): SupabaseQueryBuilder<TTable> {
    return this.search([column], term, caseSensitive);
  }

  // 정렬 조건 추가  
  sort<K extends keyof Tables<TTable>>(
    column: K, 
    direction: 'asc' | 'desc' = 'asc', 
    nullsFirst?: boolean
  ): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.sortConditions.push({
      column,
      ascending: direction === 'asc',
      nullsFirst
    });
    return newBuilder;
  }

  // 정렬 헬퍼 메서드들
  orderBy<K extends keyof Tables<TTable>>(column: K): SupabaseQueryBuilder<TTable> {
    return this.sort(column, 'asc');
  }

  orderByDesc<K extends keyof Tables<TTable>>(column: K): SupabaseQueryBuilder<TTable> {
    return this.sort(column, 'desc');
  }

  // 페이지네이션 설정
  paginate(condition: PaginationCondition): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.paginationCondition = condition;
    return newBuilder;
  }

  // 단일 레코드 조회 모드
  single(): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.singleMode = true;
    return newBuilder;
  }

  // 카운트 모드 (개수만 조회)
  count(): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.countMode = true;
    return newBuilder;
  }

  // 데이터와 개수를 함께 조회 (핵심 개선!)
  withCount(): SupabaseQueryBuilder<TTable> {
    const newBuilder = this.clone();
    newBuilder.withCountMode = true;
    return newBuilder;
  }

  // 쿼리 키 생성
  getQueryKey(): readonly unknown[] {
    return [
      this.table,
      { 
        select: this.selectedColumns,
        where: this.whereConditions,
        search: this.searchCondition,
        sort: this.sortConditions,
        pagination: this.paginationCondition,
        single: this.singleMode,
        count: this.countMode,
        withCount: this.withCountMode
      }
    ];
  }

  // 쿼리 실행
  async execute(): Promise<Tables<TTable> | Tables<TTable>[] | { count: number } | { data: Tables<TTable>[], totalCount: number }> {
    try {
      // Supabase의 복잡한 타입 시스템을 고려한 안전한 쿼리 실행
      let query: any = supabase.from(this.table);

      // COUNT 모드 또는 WITH_COUNT 모드
      if (this.countMode) {
        query = query.select('*', { count: 'exact', head: true });
      } else if (this.withCountMode) {
        query = query.select(this.selectedColumns, { count: 'exact' });
      } else {
        query = query.select(this.selectedColumns);
      }

      // WHERE 조건 적용
      for (const condition of this.whereConditions) {
        switch (condition.type) {
          case 'eq':
            query = query.eq(condition.column, condition.value);
            break;
          case 'neq':
            query = query.neq(condition.column, condition.value);
            break;
          case 'gt':
            query = query.gt(condition.column, condition.value);
            break;
          case 'gte':
            query = query.gte(condition.column, condition.value);
            break;
          case 'lt':
            query = query.lt(condition.column, condition.value);
            break;
          case 'lte':
            query = query.lte(condition.column, condition.value);
            break;
          case 'in':
            query = query.in(condition.column, condition.values);
            break;
          case 'is':
            query = query.is(condition.column, condition.value);
            break;
          case 'like':
            query = query.like(condition.column, condition.pattern);
            break;
          case 'ilike':
            query = query.ilike(condition.column, condition.pattern);
            break;
        }
      }

      // 검색 조건 적용
      if (this.searchCondition) {
        const { columns, term, caseSensitive } = this.searchCondition;
        const operator = caseSensitive ? 'like' : 'ilike';
        const pattern = `%${term}%`;
        
        const searchQueries = columns.map(col => `${String(col)}.${operator}.${pattern}`);
        query = query.or(searchQueries.join(','));
      }

      // 정렬 조건 적용
      for (const sortCondition of this.sortConditions) {
        query = query.order(String(sortCondition.column), {
          ascending: sortCondition.ascending,
          nullsFirst: sortCondition.nullsFirst
        });
      }

      // 페이지네이션 적용
      if (this.paginationCondition) {
        const from = this.paginationCondition.page * this.paginationCondition.size;
        const to = from + this.paginationCondition.size - 1;
        query = query.range(from, to);
      }

      // 단일 레코드 모드
      if (this.singleMode) {
        query = query.single();
      }

      const { data, error, count } = await query;

      if (error) {
        this.handleSupabaseError(error);
      }

      // COUNT 모드일 때
      if (this.countMode) {
        return { count: count || 0 };
      } else if (this.withCountMode) {
        return { 
          data: data as Tables<TTable>[], 
          totalCount: count || 0 
        };
      } else {
        return data as Tables<TTable> | Tables<TTable>[];
      }
    } catch (error) {
      this.handleSupabaseError(error);
    }
    
    // 이 부분은 도달하지 않지만 TypeScript를 위해 추가
    throw new Error('Query execution failed');
  }

  // 빌더 복제
  private clone(): SupabaseQueryBuilder<TTable> {
    const newBuilder = new SupabaseQueryBuilder<TTable>(this.table);
    newBuilder.selectedColumns = this.selectedColumns;
    newBuilder.whereConditions = [...this.whereConditions];
    newBuilder.searchCondition = this.searchCondition ? { ...this.searchCondition } : undefined;
    newBuilder.sortConditions = [...this.sortConditions];
    newBuilder.paginationCondition = this.paginationCondition ? { ...this.paginationCondition } : undefined;
    newBuilder.singleMode = this.singleMode;
    newBuilder.countMode = this.countMode;
    newBuilder.withCountMode = this.withCountMode;
    return newBuilder;
  }

  // 에러 처리
  private handleSupabaseError(error: unknown): never {
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
  }
}

// =============================================================================
// 팩토리 함수 및 Hooks
// =============================================================================

/**
 * Query Builder 생성 팩토리 함수 (타입 안전)
 */
export const createSupabaseQuery = <TTable extends TableName>(
  table: TTable
): SupabaseQueryBuilder<TTable> => {
  return new SupabaseQueryBuilder<TTable>(table);
};

/**
 * Query Builder를 사용하는 기본 쿼리 Hook
 */
export const useSupabaseQueryBuilder = <TTable extends TableName>(
  queryBuilder: SupabaseQueryBuilder<TTable>,
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
 * 뮤테이션을 위한 Query Builder 기반 헬퍼
 */
export const useSupabaseMutationBuilder = <TTable extends TableName>(
  table: TTable,
  type: 'insert' | 'update' | 'delete',
  options?: {
    onSuccess?: (data: Tables<TTable>) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: TableName[]; // 무효화할 테이블명들
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      data?: Record<string, unknown>;
      id?: string | number;
      where?: Array<{ 
        column: keyof Tables<TTable>; 
        operator: string; 
        value: unknown; 
      }>;
    }): Promise<Tables<TTable>> => {
      try {
        // Supabase의 복잡한 타입 시스템을 고려한 안전한 뮤테이션 실행
        let query: any = supabase.from(table);

        switch (type) {
          case 'insert': {
            query = query.insert(params.data).select().single();
            break;
          }
          case 'update': {
            if (params.id) {
              query = query.update(params.data).eq('id', params.id).select().single();
            } else if (params.where) {
              let updateQuery = query.update(params.data);
              for (const condition of params.where) {
                updateQuery = (updateQuery as any)[condition.operator](String(condition.column), condition.value);
              }
              query = updateQuery.select();
            } else {
              throw new Error('Update requires either id or where conditions');
            }
            break;
          }
          case 'delete': {
            if (params.id) {
              query = query.delete().eq('id', params.id);
            } else if (params.where) {
              let deleteQuery = query.delete();
              for (const condition of params.where) {
                deleteQuery = (deleteQuery as any)[condition.operator](String(condition.column), condition.value);
              }
              query = deleteQuery;
            } else {
              throw new Error('Delete requires either id or where conditions');
            }
            break;
          }
        }

        const { data, error } = await query;

        if (error) {
          throw new ApiException(400, error.message, error.code);
        }
        
        return data as Tables<TTable>;
      } catch (error) {
        if (error instanceof ApiException) {
          throw error;
        }
        throw new ApiException(500, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR', error);
      }
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

/**
 * 조건부 쿼리 생성 헬퍼
 */
export const createConditionalQuery = <TTable extends TableName>(
  table: TTable,
  conditions: {
    select?: SelectColumns<TTable>;
    where?: Array<{
      column: keyof Tables<TTable>;
      operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'is' | 'like' | 'ilike';
      value: unknown;
    }>;
    search?: {
      columns: (keyof Tables<TTable>)[];
      term: string;
      caseSensitive?: boolean;
    };
    sort?: Array<{
      column: keyof Tables<TTable>;
      direction: 'asc' | 'desc';
      nullsFirst?: boolean;
    }>;
    pagination?: PaginationCondition;
    single?: boolean;
    count?: boolean;
    withCount?: boolean;
  }
): SupabaseQueryBuilder<TTable> => {
  let query = createSupabaseQuery(table);

  // SELECT 절
  if (conditions.select) {
    query = query.select(conditions.select);
  }

  // WHERE 조건들
  if (conditions.where) {
          for (const condition of conditions.where) {
        if (condition.operator === 'in' && Array.isArray(condition.value)) {
          query = (query as any).where(String(condition.column), 'in', condition.value);
        } else if (condition.operator === 'like' || condition.operator === 'ilike') {
          query = (query as any).where(String(condition.column), condition.operator, condition.value as string);
        } else {
          query = (query as any).where(String(condition.column), condition.operator, condition.value);
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
      query = query.sort(
        sortCondition.column, 
        sortCondition.direction, 
        sortCondition.nullsFirst
      );
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

  // 데이터와 함께 카운트
  if (conditions.withCount) {
    query = query.withCount();
  }

  return query;
};
