import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from '@/shared/api';

// Query Key 헬퍼
export const queryKeys = {
  all: ['supabase'] as const,
  tables: () => [...queryKeys.all, 'table'] as const,
  table: (table: string) => [...queryKeys.tables(), table] as const,
  tableFilters: (table: string, filters: Record<string, any>) => 
    [...queryKeys.table(table), { filters }] as const,
  tableItem: (table: string, id: string) => 
    [...queryKeys.table(table), id] as const,
};

// 테이블 전체 조회 훅
export const useSupabaseQuery = <T = any>(
  table: string,
  options?: {
    select?: string;
    filters?: (query: PostgrestFilterBuilder<any, any, any[]>) => PostgrestFilterBuilder<any, any, any[]>;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.table(table),
    queryFn: async () => {
      let query = supabase.from(table).select(options?.select || '*');
      
      if (options?.filters) {
        query = options.filters(query);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as T[];
    },
    enabled: options?.enabled ?? true,
  });
};

// 단일 아이템 조회 훅
export const useSupabaseItem = <T = any>(
  table: string,
  id: string | null,
  options?: {
    select?: string;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tableItem(table, id || ''),
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      
      const { data, error } = await supabase
        .from(table)
        .select(options?.select || '*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as T;
    },
    enabled: (options?.enabled ?? true) && !!id,
  });
};

// 생성 뮤테이션 훅
export const useSupabaseInsert = <T = any>(table: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      // 테이블 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.table(table) });
    },
  });
};

// 업데이트 뮤테이션 훅
export const useSupabaseUpdate = <T = any>(table: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as T;
    },
    onSuccess: (data) => {
      // 테이블 및 아이템 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.table(table) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tableItem(table, (data as any).id) });
    },
  });
};

// 삭제 뮤테이션 훅
export const useSupabaseDelete = (table: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // 테이블 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.table(table) });
      // 특정 아이템 쿼리 제거
      queryClient.removeQueries({ queryKey: queryKeys.tableItem(table, deletedId) });
    },
  });
};
