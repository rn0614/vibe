import React, { useState } from 'react';
import { 
  createSupabaseQuery, 
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder
} from '@/shared/hooks';
import type { Tables } from '@/shared/types/database';

/**
 * 개선된 타입 안전성을 보여주는 예시
 * 
 * 핵심 개선사항:
 * 1. 더 정교한 SELECT 타입 지원 (단일, 복수, JOIN)
 * 2. 타입 안전한 WHERE 헬퍼 메서드들
 * 3. 컬럼별 타입 검증이 강화된 조건들
 * 4. 더 직관적인 API
 */

// =============================================================================
// 예시 1: 개선된 SELECT 기능
// =============================================================================

export const ImprovedSelectExample: React.FC = () => {
  // ✅ 방법 1: 전체 컬럼 선택
  const allTodosQuery = createSupabaseQuery('tb_todolist')
    .select('*');

  // ✅ 방법 2: 단일 컬럼 선택 (타입 안전)
  const idOnlyQuery = createSupabaseQuery('tb_todolist')
    .selectColumn('id');  // 'id'만 허용됨

  // ✅ 방법 3: 복수 컬럼 선택 (타입 안전)
  const multiColumnQuery = createSupabaseQuery('tb_todolist')
    .selectColumns(['id', 'created_at']);  // 존재하는 컬럼들만 허용

  // ✅ 방법 4: 문자열로 복수 컬럼 선택
  const stringSelectQuery = createSupabaseQuery('tb_todolist')
    .select('id, created_at');

  // 에러 예시:
  // .selectColumn('wrong_column')        // ❌ 존재하지 않는 컬럼
  // .selectColumns(['id', 'wrong'])      // ❌ 잘못된 컬럼 포함

  const { data: allTodos } = useSupabaseQueryBuilder(allTodosQuery);
  const { data: ids } = useSupabaseQueryBuilder(idOnlyQuery);
  const { data: multiData } = useSupabaseQueryBuilder(multiColumnQuery);

  return (
    <div className="improved-select-example">
      <h2>🎯 개선된 SELECT 기능</h2>
      
      <div className="results">
        <div>
          <h3>전체 데이터 ({Array.isArray(allTodos) ? allTodos.length : 0}개)</h3>
          {allTodos && Array.isArray(allTodos) && allTodos.slice(0, 3).map(todo => (
            <div key={todo.id}>
              ID: {todo.id}, 생성일: {new Date(todo.created_at).toLocaleDateString()}
            </div>
          ))}
        </div>

        <div>
          <h3>ID만 조회</h3>
          {ids && Array.isArray(ids) && ids.slice(0, 3).map((item, idx) => (
            <div key={idx}>ID만: {(item as any).id}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 예시 2: 타입 안전한 WHERE 헬퍼 메서드들
// =============================================================================

export const TypeSafeWhereExample: React.FC = () => {
  const [targetId, setTargetId] = useState<number>(1);
  const [minId, setMinId] = useState<number>(1);
  const [searchPattern, setSearchPattern] = useState<string>('');

  // ✅ 타입 안전한 WHERE 헬퍼들
  const specificTodoQuery = createSupabaseQuery('tb_todolist')
    .select('*')
    .whereEq('id', targetId)  // number 타입 자동 검증
    .single();

  const rangeQuery = createSupabaseQuery('tb_todolist')
    .select('id, created_at')
    .whereGt('id', minId)     // number 타입 자동 검증
    .orderByDesc('created_at');

  const multipleIdsQuery = createSupabaseQuery('tb_todolist')
    .select('*')
    .whereIn('id', [1, 2, 3, 4, 5]);  // number[] 타입 자동 검증

  // 패턴 검색 (created_at은 string이므로 LIKE 사용 가능)
  const patternQuery = searchPattern ? createSupabaseQuery('tb_todolist')
    .select('*')
    .whereLike('created_at', `%${searchPattern}%`)
    .orderBy('id') : null;

  // 에러 예시:
  // .whereEq('id', 'string_value')      // ❌ string을 number 필드에
  // .whereGt('created_at', 123)         // ❌ number를 string 필드에
  // .whereIn('id', ['a', 'b'])          // ❌ string[]을 number 필드에

  const { data: specificTodo } = useSupabaseQueryBuilder(specificTodoQuery);
  const { data: rangeTodos } = useSupabaseQueryBuilder(rangeQuery);
  const { data: multipleTodos } = useSupabaseQueryBuilder(multipleIdsQuery);
  const { data: patternTodos } = useSupabaseQueryBuilder(patternQuery!, {
    enabled: !!patternQuery
  });

  return (
    <div className="type-safe-where-example">
      <h2>🔒 타입 안전한 WHERE 조건들</h2>
      
      <div className="controls">
        <div>
          <label>특정 ID 조회:</label>
          <input 
            type="number" 
            value={targetId}
            onChange={(e) => setTargetId(Number(e.target.value))}
          />
        </div>
        
        <div>
          <label>최소 ID:</label>
          <input 
            type="number" 
            value={minId}
            onChange={(e) => setMinId(Number(e.target.value))}
          />
        </div>

        <div>
          <label>날짜 패턴 검색:</label>
          <input 
            type="text" 
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
            placeholder="예: 2024"
          />
        </div>
      </div>

      <div className="results">
        <div>
          <h3>특정 할 일 (ID: {targetId})</h3>
          {specificTodo && !Array.isArray(specificTodo) && (
            <div>ID: {specificTodo.id}, 생성일: {specificTodo.created_at}</div>
          )}
        </div>

        <div>
          <h3>ID > {minId}인 할 일들</h3>
          {rangeTodos && Array.isArray(rangeTodos) && (
            <div>{rangeTodos.length}개 결과</div>
          )}
        </div>

        <div>
          <h3>특정 ID들 (1,2,3,4,5)</h3>
          {multipleTodos && Array.isArray(multipleTodos) && (
            <div>{multipleTodos.length}개 결과</div>
          )}
        </div>

        {searchPattern && (
          <div>
            <h3>날짜 패턴 '{searchPattern}' 검색</h3>
            {patternTodos && Array.isArray(patternTodos) && (
              <div>{patternTodos.length}개 결과</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// 예시 3: 개선된 검색 및 정렬
// =============================================================================

export const ImprovedSearchSortExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof Tables<'tb_todolist'>>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ✅ 타입 안전한 검색 및 정렬
  const searchQuery = React.useMemo(() => {
    let query = createSupabaseQuery('tb_todolist')
      .select('*');

    // 검색어가 있으면 검색 조건 추가
    if (searchTerm.trim()) {
      // 단일 컬럼 검색
      query = query.searchInColumn('created_at', searchTerm);
      
      // 또는 복수 컬럼 검색
      // query = query.search(['created_at'], searchTerm);
    }

    // 정렬 조건
    if (sortDirection === 'asc') {
      query = query.orderBy(sortColumn);
    } else {
      query = query.orderByDesc(sortColumn);
    }

    return query;
  }, [searchTerm, sortColumn, sortDirection]);

  const { data: searchResults, isLoading } = useSupabaseQueryBuilder(searchQuery);

  return (
    <div className="improved-search-sort-example">
      <h2>🔍 개선된 검색 및 정렬</h2>
      
      <div className="controls">
        <div>
          <label>검색어:</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="날짜 형식으로 검색 (예: 2024)"
          />
        </div>
        
        <div>
          <label>정렬 컬럼:</label>
          <select 
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value as keyof Tables<'tb_todolist'>)}
          >
            <option value="id">ID</option>
            <option value="created_at">생성일</option>
          </select>
        </div>

        <div>
          <label>정렬 방향:</label>
          <select 
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      </div>

      <div className="results">
        {isLoading && <div>🔄 검색 중...</div>}
        
        {searchResults && Array.isArray(searchResults) && (
          <div>
            <h3>검색 결과: {searchResults.length}개</h3>
            {searchResults.slice(0, 10).map(todo => (
              <div key={todo.id} className="result-item">
                ID: {todo.id}, 생성일: {new Date(todo.created_at).toLocaleDateString()}
              </div>
            ))}
            {searchResults.length > 10 && (
              <div>... 외 {searchResults.length - 10}개 더</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// 예시 4: 복합 쿼리 및 체이닝
// =============================================================================

export const ComplexQueryExample: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(5);

  // ✅ 복잡한 조건들을 체이닝으로 조합
  const complexQuery = createSupabaseQuery('tb_todolist')
    .selectColumns(['id', 'created_at'])  // 특정 컬럼들만 선택
    .whereGt('id', 0)                     // ID > 0
    .orderByDesc('created_at')            // 생성일 내림차순
    .paginate({ page, size: pageSize });  // 페이지네이션

  // 카운트 쿼리 (전체 개수)
  const countQuery = createSupabaseQuery('tb_todolist')
    .whereGt('id', 0)
    .count();

  const { data: todos, isLoading } = useSupabaseQueryBuilder(complexQuery);
  const { data: countResult } = useSupabaseQueryBuilder(countQuery);

  const totalCount = countResult && !Array.isArray(countResult) ? countResult.count : 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="complex-query-example">
      <h2>⚙️ 복합 쿼리 및 페이지네이션</h2>
      
      <div className="info">
        <p>전체 항목: {totalCount}개</p>
        <p>현재 페이지: {page + 1} / {totalPages}</p>
      </div>

      <div className="pagination-controls">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          이전
        </button>
        <span>페이지 {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
        >
          다음
        </button>
      </div>

      <div className="results">
        {isLoading && <div>🔄 로딩 중...</div>}
        
        {todos && Array.isArray(todos) && (
          <div>
            <h3>현재 페이지 결과:</h3>
            {todos.map(todo => (
              <div key={todo.id} className="todo-item">
                ID: {todo.id}, 생성일: {new Date(todo.created_at).toLocaleDateString()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// 통합 예시 컴포넌트
// =============================================================================

export const ImprovedTypeExamples: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('select');

  return (
    <div className="improved-type-examples">
      <h1>🚀 개선된 타입 안전 Query Builder</h1>
      
      <nav className="example-nav">
        <button 
          onClick={() => setSelectedExample('select')}
          className={selectedExample === 'select' ? 'active' : ''}
        >
          SELECT 개선
        </button>
        <button 
          onClick={() => setSelectedExample('where')}
          className={selectedExample === 'where' ? 'active' : ''}
        >
          WHERE 헬퍼
        </button>
        <button 
          onClick={() => setSelectedExample('search')}
          className={selectedExample === 'search' ? 'active' : ''}
        >
          검색/정렬
        </button>
        <button 
          onClick={() => setSelectedExample('complex')}
          className={selectedExample === 'complex' ? 'active' : ''}
        >
          복합 쿼리
        </button>
      </nav>

      <div className="example-content">
        {selectedExample === 'select' && <ImprovedSelectExample />}
        {selectedExample === 'where' && <TypeSafeWhereExample />}
        {selectedExample === 'search' && <ImprovedSearchSortExample />}
        {selectedExample === 'complex' && <ComplexQueryExample />}
      </div>

      <div className="improvements-summary">
        <h2>🎯 주요 개선사항</h2>
        <ul>
          <li>✅ <strong>SELECT 다양화</strong>: selectColumn(), selectColumns(), 문자열 select 모두 지원</li>
          <li>✅ <strong>WHERE 헬퍼</strong>: whereEq(), whereIn(), whereGt(), whereLike() 등 타입 안전 메서드</li>
          <li>✅ <strong>정렬 헬퍼</strong>: orderBy(), orderByDesc() 직관적 API</li>
          <li>✅ <strong>검색 헬퍼</strong>: searchInColumn() 단일 컬럼 검색 지원</li>
          <li>✅ <strong>컬럼별 타입 검증</strong>: 각 컬럼의 실제 타입에 맞는 값만 허용</li>
          <li>✅ <strong>JOIN 쿼리 준비</strong>: 복잡한 SELECT 문자열 지원</li>
        </ul>
      </div>
    </div>
  );
};

export default ImprovedTypeExamples;
