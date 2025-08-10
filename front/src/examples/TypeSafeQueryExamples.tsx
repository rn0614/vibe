import React, { useState } from 'react';
import { 
  createSupabaseQuery, 
  createConditionalQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder
} from '@/shared/hooks';
import type { Tables, TablesInsert, TablesUpdate } from '@/shared/types/database';

/**
 * 타입 안전한 Query Builder 사용 예시
 * 
 * 현재 테이블: tb_todolist
 * 앞으로 추가될 테이블들을 고려한 확장 가능한 구조
 */

// 현재 사용 가능한 테이블 타입
type TodoList = Tables<'tb_todolist'>; // { id: number, created_at: string }
type TodoListInsert = TablesInsert<'tb_todolist'>; // { id?: number, created_at?: string }
type TodoListUpdate = TablesUpdate<'tb_todolist'>; // { id?: number, created_at?: string }

// =============================================================================
// 예시 1: 기본 TodoList 조회 (타입 안전)
// =============================================================================

export const TodoListExample: React.FC = () => {
  // ✅ 타입 안전한 쿼리 - 'tb_todolist'만 허용됨
  const todosQuery = createSupabaseQuery('tb_todolist')
    .select('id, created_at')  // 존재하는 컬럼만 사용 가능
    .sort('created_at', 'desc'); // 타입 체크됨

  const { data: todos, isLoading, error } = useSupabaseQueryBuilder(todosQuery);

  // 에러 시연: 잘못된 테이블명 사용하면 컴파일 에러 발생
  // const invalidQuery = createSupabaseQuery('wrong_table'); // ❌ TypeScript 에러!

  return (
    <div className="todo-list-example">
      <h2>📝 할 일 목록 (타입 안전)</h2>
      
      {isLoading && <div>🔄 로딩 중...</div>}
      {error && <div>❌ 에러: {error.message}</div>}
      
      {todos && Array.isArray(todos) && (
        <div>
          <h3>할 일 개수: {todos.length}개</h3>
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <span>ID: {todo.id}</span>
              <span>생성일: {new Date(todo.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 2: WHERE 조건 사용 (타입 안전한 컬럼 참조)
// =============================================================================

export const TypeSafeWhereExample: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(1);

  // ✅ where 조건도 타입 체크됨
  const specificTodoQuery = createSupabaseQuery('tb_todolist')
    .select('*')
    .where('id', 'eq', selectedId)  // 'id'는 number 타입으로 체크됨
    .single();

  // 에러 시연: 잘못된 컬럼명이나 타입 사용 시 컴파일 에러
  // .where('wrong_column', 'eq', 1)     // ❌ 존재하지 않는 컬럼
  // .where('id', 'eq', 'wrong_type')    // ❌ 타입 불일치

  const { data: todo } = useSupabaseQueryBuilder(specificTodoQuery, {
    enabled: !!selectedId
  });

  return (
    <div className="type-safe-where-example">
      <h2>🎯 특정 할 일 조회 (타입 안전한 WHERE)</h2>
      
      <div>
        <label>할 일 ID 선택:</label>
        <input 
          type="number" 
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        />
      </div>

      {todo && !Array.isArray(todo) && (
        <div className="todo-detail">
          <h3>선택된 할 일</h3>
          <p>ID: {todo.id}</p>
          <p>생성일: {new Date(todo.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 3: 뮤테이션 (타입 안전한 INSERT/UPDATE/DELETE)
// =============================================================================

export const TypeSafeMutationExample: React.FC = () => {
  // ✅ 타입 안전한 INSERT 뮤테이션
  const createTodo = useSupabaseMutationBuilder('tb_todolist', 'insert', {
    invalidateQueries: ['tb_todolist'],
    onSuccess: (newTodo: TodoList) => {
      console.log('새 할 일 생성됨:', newTodo);
      alert(`할 일 생성됨 (ID: ${newTodo.id})`);
    }
  });

  // ✅ 타입 안전한 UPDATE 뮤테이션
  const updateTodo = useSupabaseMutationBuilder('tb_todolist', 'update', {
    invalidateQueries: ['tb_todolist'],
    onSuccess: () => alert('할 일 업데이트됨')
  });

  // ✅ 타입 안전한 DELETE 뮤테이션
  const deleteTodo = useSupabaseMutationBuilder('tb_todolist', 'delete', {
    invalidateQueries: ['tb_todolist'],
    onSuccess: () => alert('할 일 삭제됨')
  });

  const handleCreateTodo = () => {
    // ✅ TablesInsert<'tb_todolist'> 타입으로 체크됨
    const newTodoData: TodoListInsert = {
      // id는 선택적 (auto-increment)
      // created_at도 선택적 (기본값 사용)
    };

    createTodo.mutate({ data: newTodoData });

    // 에러 시연: 잘못된 데이터 타입 사용 시 컴파일 에러
    // createTodo.mutate({ data: { wrong_field: 'test' } }); // ❌ TypeScript 에러!
  };

  const handleUpdateTodo = () => {
    // ✅ TablesUpdate<'tb_todolist'> 타입으로 체크됨
    const updateData: TodoListUpdate = {
      created_at: new Date().toISOString()
    };

    updateTodo.mutate({ 
      id: 1, 
      data: updateData 
    });
  };

  const handleDeleteTodo = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteTodo.mutate({ id: 1 });
    }
  };

  return (
    <div className="type-safe-mutation-example">
      <h2>🔄 할 일 조작 (타입 안전한 뮤테이션)</h2>
      
      <div className="mutation-buttons">
        <button
          onClick={handleCreateTodo}
          disabled={createTodo.isPending}
        >
          {createTodo.isPending ? '생성 중...' : '새 할 일 생성'}
        </button>

        <button
          onClick={handleUpdateTodo}
          disabled={updateTodo.isPending}
        >
          {updateTodo.isPending ? '업데이트 중...' : '할 일 업데이트 (ID: 1)'}
        </button>

        <button
          onClick={handleDeleteTodo}
          disabled={deleteTodo.isPending}
        >
          {deleteTodo.isPending ? '삭제 중...' : '할 일 삭제 (ID: 1)'}
        </button>
      </div>

      {(createTodo.error || updateTodo.error || deleteTodo.error) && (
        <div className="error-message">
          ❌ 에러: {createTodo.error?.message || updateTodo.error?.message || deleteTodo.error?.message}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 4: 조건부 쿼리 (타입 안전한 복합 조건)
// =============================================================================

export const TypeSafeConditionalQueryExample: React.FC = () => {
  const [filters, setFilters] = useState({
    minId: 1,
    maxId: 10,
    sortDirection: 'desc' as 'asc' | 'desc'
  });

  // ✅ createConditionalQuery도 타입 안전
  const conditionalQuery = createConditionalQuery('tb_todolist', {
    select: 'id, created_at',
    where: [
      { column: 'id', operator: 'gte', value: filters.minId },    // 타입 체크됨
      { column: 'id', operator: 'lte', value: filters.maxId }     // 타입 체크됨
    ],
    sort: [
      { column: 'id', direction: filters.sortDirection }         // 컬럼명 타입 체크됨
    ]
  });

  const { data: todos } = useSupabaseQueryBuilder(conditionalQuery);

  return (
    <div className="type-safe-conditional-example">
      <h2>⚙️ 조건부 쿼리 (타입 안전)</h2>
      
      <div className="filters">
        <div>
          <label>최소 ID:</label>
          <input
            type="number"
            value={filters.minId}
            onChange={(e) => setFilters(f => ({ ...f, minId: Number(e.target.value) }))}
          />
        </div>
        
        <div>
          <label>최대 ID:</label>
          <input
            type="number"
            value={filters.maxId}
            onChange={(e) => setFilters(f => ({ ...f, maxId: Number(e.target.value) }))}
          />
        </div>
        
        <div>
          <label>정렬:</label>
          <select
            value={filters.sortDirection}
            onChange={(e) => setFilters(f => ({ ...f, sortDirection: e.target.value as 'asc' | 'desc' }))}
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      </div>

      {todos && Array.isArray(todos) && (
        <div>
          <h3>필터링된 결과: {todos.length}개</h3>
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              ID: {todo.id}, 생성일: {new Date(todo.created_at).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 5: 미래 확장을 위한 다중 테이블 예시 (준비된 구조)
// =============================================================================

export const FutureTableExample: React.FC = () => {
  // 📝 미래에 새 테이블이 추가되면 이런 식으로 사용 가능:
  // 
  // type User = Tables<'users'>;
  // type Post = Tables<'posts'>;
  // 
  // const usersQuery = createSupabaseQuery('users')
  //   .select('id, name, email')
  //   .where('status', 'eq', 'active');
  // 
  // const postsQuery = createSupabaseQuery('posts')
  //   .select('id, title, content, user_id')
  //   .where('published', 'eq', true)
  //   .sort('created_at', 'desc');

  return (
    <div className="future-table-example">
      <h2>🚀 미래 테이블 확장 준비</h2>
      
      <div className="info-box">
        <h3>현재 지원되는 테이블:</h3>
        <ul>
          <li>✅ <code>tb_todolist</code> - 할 일 목록</li>
        </ul>
        
        <h3>미래 추가 예정 테이블들:</h3>
        <ul>
          <li>🔄 <code>users</code> - 사용자 정보</li>
          <li>🔄 <code>posts</code> - 게시글</li>
          <li>🔄 <code>comments</code> - 댓글</li>
          <li>🔄 <code>categories</code> - 카테고리</li>
        </ul>
        
        <p>
          새 테이블 추가 시 <code>useSupabaseQueryBuilderV2.ts</code>의 
          <code>ValidTableNames</code> 타입에만 추가하면 
          모든 타입 안전성이 자동으로 적용됩니다! 🎉
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// 통합 예시 컴포넌트
// =============================================================================

export const TypeSafeQueryExamples: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('basic');

  return (
    <div className="type-safe-query-examples">
      <h1>🔒 타입 안전한 Supabase Query Builder</h1>
      
      <nav className="example-nav">
        <button 
          onClick={() => setSelectedExample('basic')}
          className={selectedExample === 'basic' ? 'active' : ''}
        >
          기본 조회
        </button>
        <button 
          onClick={() => setSelectedExample('where')}
          className={selectedExample === 'where' ? 'active' : ''}
        >
          WHERE 조건
        </button>
        <button 
          onClick={() => setSelectedExample('mutation')}
          className={selectedExample === 'mutation' ? 'active' : ''}
        >
          뮤테이션
        </button>
        <button 
          onClick={() => setSelectedExample('conditional')}
          className={selectedExample === 'conditional' ? 'active' : ''}
        >
          조건부 쿼리
        </button>
        <button 
          onClick={() => setSelectedExample('future')}
          className={selectedExample === 'future' ? 'active' : ''}
        >
          미래 확장
        </button>
      </nav>

      <div className="example-content">
        {selectedExample === 'basic' && <TodoListExample />}
        {selectedExample === 'where' && <TypeSafeWhereExample />}
        {selectedExample === 'mutation' && <TypeSafeMutationExample />}
        {selectedExample === 'conditional' && <TypeSafeConditionalQueryExample />}
        {selectedExample === 'future' && <FutureTableExample />}
      </div>
    </div>
  );
};

export default TypeSafeQueryExamples;
